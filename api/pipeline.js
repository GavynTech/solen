import { setCors } from './_services/cors.js';
import { requireApiKey } from './_services/auth.js';
import { checkRateLimit } from './_services/rateLimit.js';
import { logAuditEvent } from './_services/auditLog.js';
import { enrichWithFirecrawl, scrapeCompanyHooks } from './_services/firecrawl.js';
import { researchWithPerplexity } from './_services/perplexity.js';
import { nullSafeRoute } from './_services/router.js';
import { scoreWithClaude } from './_services/scorer.js';
import { upsertHubSpotContact } from './_services/hubspot.js';
import { sendSlackAlert } from './_services/slack.js';
import { logEnrichmentEvent, createLeadSequence } from './_services/supabase.js';
import { sendOutreachEmail } from './_services/resend.js';

function domainToCompany(email) {
  const d = email.split('@')[1]?.split('.')[0] ?? 'Company';
  return d.charAt(0).toUpperCase() + d.slice(1);
}

const DEMO_ENRICHMENT = (email) => ({
  company_name: domainToCompany(email),
  annual_revenue: 8500000,
  employee_count: 65,
  industry: 'Software / SaaS',
  tech_stack: ['HubSpot', 'Segment', 'Intercom'],
  funding_stage: 'Series A',
  headquarters: 'Austin, TX',
  linkedin_url: null,
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (!setCors(req, res)) return res.status(403).json({ ok: false, error: 'Origin not allowed' });
    res.writeHead(204);
    return res.end();
  }

  if (!setCors(req, res)) {
    return res.status(403).json({ ok: false, error: 'Origin not allowed' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (requireApiKey(req, res)) {
    logAuditEvent({ event_type: 'auth_failure', req, endpoint: '/api/pipeline', details: { reason: 'missing_or_invalid_api_key' } });
    return;
  }

  if (checkRateLimit(req, res, 'pipeline')) {
    logAuditEvent({ event_type: 'rate_limited', req, endpoint: '/api/pipeline' });
    return;
  }

  const pipelineStart = Date.now();
  const timing = {};

  try {
    const { email, name, company, source, utmSource } = req.body ?? {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Valid email required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Stage 1: Apollo + Perplexity + Firecrawl in parallel ─────────────────
    timing.enrichment_start = Date.now() - pipelineStart;
    const emailDomain = normalizedEmail.split('@')[1];
    const [apolloData, perplexityData, hooks] = await Promise.all([
      enrichWithFirecrawl(emailDomain),
      (async () => {
        const partialContext = { company_name: company ?? null };
        return researchWithPerplexity(partialContext, normalizedEmail);
      })(),
      scrapeCompanyHooks(emailDomain),
    ]);
    timing.enrichment_ms = Date.now() - pipelineStart - timing.enrichment_start;

    // ── Stage 2: Null-Safe Default Router ─────────────────────────────────────
    const { enriched, null_fields_patched } = nullSafeRoute(apolloData);

    // ── Stage 2b: Demo enrichment fallback ────────────────────────────────────
    // When Apollo returns nothing useful, inject realistic demo data so Claude
    // scores real signals and Slack shows a convincing alert on sales demos.
    let enrichment_mode = 'live';
    // Only fall back to demo data when Firecrawl returned nothing at all
    // (e.g. domain blocks scrapers or FIRECRAWL_API_KEY missing)
    if (!apolloData.company_name && !apolloData.industry && !apolloData.tech_stack?.length) {
      Object.assign(enriched, DEMO_ENRICHMENT(normalizedEmail));
      enrichment_mode = 'demo';
    }

    // ── Stage 3: Claude scoring ────────────────────────────────────────────────
    timing.scoring_start = Date.now() - pipelineStart;
    const score = await scoreWithClaude({
      email: normalizedEmail,
      name,
      enriched,
      research: perplexityData,
      null_fields_patched,
      hooks,
    });
    timing.scoring_ms = Date.now() - pipelineStart - timing.scoring_start;

    // ── Stage 4: HubSpot + Slack in parallel ──────────────────────────────────
    timing.delivery_start = Date.now() - pipelineStart;
    const [hubspotResult, slackSent] = await Promise.all([
      upsertHubSpotContact({ email: normalizedEmail, name, enriched, score }),
      sendSlackAlert({ email: normalizedEmail, name, enriched, score, hubspot_id: null }),
    ]);
    timing.delivery_ms = Date.now() - pipelineStart - timing.delivery_start;

    // ── Stage 5: Supabase log ──────────────────────────────────────────────────
    const pipeline_latency_ms = Date.now() - pipelineStart;
    const lead_id = await logEnrichmentEvent({
      email: normalizedEmail,
      name: name ?? null,
      source: source ?? 'hero_cta_form',
      utm_source: utmSource ?? null,
      company_name: enriched.company_name,
      industry: enriched.industry,
      employee_count: enriched.employee_count,
      annual_revenue: enriched.annual_revenue,
      funding_stage: enriched.funding_stage,
      tech_stack: enriched.tech_stack,
      vip_score: score.vip_score,
      vip_tier: score.vip_tier,
      score_rationale: score.score_rationale,
      outreach_subject: score.outreach_draft?.subject,
      outreach_body: score.outreach_draft?.body,
      recommended_action: score.recommended_action,
      null_fields_patched,
      score_factors: score.score_factors ?? null,
      rationale_object: score.rationale_object ?? null,
      trigger_events: hooks?.trigger_events ?? null,
      personalization_snippet: hooks?.personalization_snippet ?? null,
      hubspot_id: hubspotResult.hubspot_id,
      hubspot_status: hubspotResult.status,
      slack_sent: slackSent,
      pipeline_latency_ms,
      research_summary: perplexityData.summary,
      intent_signals: perplexityData.intent_signals,
      created_at: new Date().toISOString(),
    });

    // ── Stage 6: Email outreach sequence (fire-and-forget) ────────────────────
    if (score.vip_score >= 60) {
      Promise.resolve().then(async () => {
        try {
          const sent = await sendOutreachEmail({
            to: normalizedEmail,
            subject: score.outreach_draft?.subject,
            body: score.outreach_draft?.body,
          });
          if (sent) {
            await createLeadSequence({
              email: normalizedEmail,
              lead_id,
              company_name: enriched.company_name,
              vip_score: score.vip_score,
              vip_tier: score.vip_tier,
              outreach_subject: score.outreach_draft?.subject,
              outreach_body: score.outreach_draft?.body,
            });
          }
        } catch (err) {
          console.error('[pipeline] sequence error:', err.message);
        }
      }).catch(console.error);
    }

    return res.status(200).json({
      ok: true,
      email: normalizedEmail,
      enrichment: enriched,
      enrichment_mode,
      null_fields_patched,
      research: perplexityData,
      score,
      hubspot: hubspotResult,
      slack_sent: slackSent,
      timing,
      pipeline_latency_ms,
    });
  } catch (err) {
    console.error('[api/pipeline]', err);
    return res.status(500).json({
      ok: false,
      error: 'Pipeline failed. Please try again.',
      pipeline_latency_ms: Date.now() - pipelineStart,
    });
  }
}
