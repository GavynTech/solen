import { searchApolloProspects } from './_services/apollo.js';
import { scoreWithClaude } from './_services/scorer.js';
import { nullSafeRoute } from './_services/router.js';
import { sendSlackBatchSummary } from './_services/slack.js';
import { sendOutreachEmail } from './_services/resend.js';
import {
  createLeadSequence,
  createProspectRun,
  updateProspectRun,
  insertProspect,
} from './_services/supabase.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(CORS_HEADERS).json({ ok: false });
  }

  const { pin, icp } = req.body ?? {};

  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).set(CORS_HEADERS).json({ ok: false, error: 'Unauthorized' });
  }

  if (!icp) {
    return res.status(400).set(CORS_HEADERS).json({ ok: false, error: 'icp required' });
  }

  // Cap limit to 5 on Hobby plan (10s timeout), 10-15 on Pro (60s)
  const safeIcp = { ...icp, limit: Math.min(icp.limit ?? 5, 5) };

  try {
    const run_id = await createProspectRun(safeIcp);
    const prospects = await searchApolloProspects(safeIcp);

    const stats = { total: prospects.length, high_score: 0, queued: 0 };
    const top_leads = [];
    const results = [];

    for (const prospect of prospects) {
      // 500ms delay between calls to avoid hammering scoring API
      await delay(500);

      try {
        const { enriched } = nullSafeRoute(prospect);
        // Skip Perplexity for prospecting — Claude scores fine on Apollo data alone
        const score = await scoreWithClaude({
          email: prospect.email,
          name: `${prospect.first_name ?? ''} ${prospect.last_name ?? ''}`.trim() || null,
          enriched,
          research: { summary: null, intent_signals: [] },
          null_fields_patched: [],
        });

        const prospect_record = {
          run_id,
          email: prospect.email,
          first_name: prospect.first_name,
          last_name: prospect.last_name,
          title: prospect.title,
          company_name: prospect.company_name,
          apollo_data: prospect,
          enriched,
          vip_score: score.vip_score,
          vip_tier: score.vip_tier,
          score_rationale: score.score_rationale,
        };

        let sequence_id = null;

        if (score.vip_score >= 70) {
          stats.high_score++;

          const prospect_id = await insertProspect(prospect_record);

          const sent = await sendOutreachEmail({
            to: prospect.email,
            subject: score.outreach_draft?.subject,
            body: score.outreach_draft?.body,
          });

          if (sent) {
            stats.queued++;
            sequence_id = await createLeadSequence({
              email: prospect.email,
              lead_id: prospect_id,
              company_name: prospect.company_name,
              vip_score: score.vip_score,
              vip_tier: score.vip_tier,
              outreach_subject: score.outreach_draft?.subject,
              outreach_body: score.outreach_draft?.body,
            });
          }

          top_leads.push({ ...prospect, vip_score: score.vip_score, vip_tier: score.vip_tier });
        } else {
          await insertProspect(prospect_record);
        }

        results.push({
          email: prospect.email,
          company: prospect.company_name,
          score: score.vip_score,
          tier: score.vip_tier,
          queued: sequence_id != null,
        });
      } catch (err) {
        console.error(`[prospect] error processing ${prospect.email}:`, err.message);
        results.push({ email: prospect.email, error: err.message });
      }
    }

    // Update run stats and fire Slack summary
    await Promise.all([
      run_id ? updateProspectRun(run_id, stats) : Promise.resolve(),
      sendSlackBatchSummary({ ...stats, top_leads }),
    ]);

    return res.status(200).set(CORS_HEADERS).json({ ok: true, run_id, ...stats, results });
  } catch (err) {
    console.error('[prospect]', err.message);
    return res.status(500).set(CORS_HEADERS).json({ ok: false, error: err.message });
  }
}
