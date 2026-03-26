import { createClient } from '@supabase/supabase-js';
import { scrapeCompanyHooks } from './_services/firecrawl.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function sendSignalAlert({ domain, companyName, emails, newEvents }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const eventLines = newEvents
    .map(e => `• *[${(e.type ?? 'signal').toUpperCase()}]* ${e.personalization_snippet ?? e.quote}`)
    .join('\n');

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📡 ICP Signal Spike — ${companyName}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*New signals detected for an active sequence prospect:*\n${eventLines}`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Domain:*\n${domain}` },
        { type: 'mrkdwn', text: `*Active Sequence(s):*\n${emails.join(', ')}` },
      ],
    },
    { type: 'divider' },
  ];

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attachments: [{ color: '#7c3aed', blocks }] }),
  });
}

export default async function handler(req, res) {
  // Accept cron (GET with Authorization header) or manual trigger (POST with pin)
  const isAuthorizedCron =
    req.method === 'GET' &&
    req.headers['authorization'] === `Bearer ${process.env.CRON_SECRET}`;
  const isManualTrigger =
    req.method === 'POST' && req.body?.pin === process.env.ADMIN_PIN;

  if (!isAuthorizedCron && !isManualTrigger) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'DB unavailable' });

  // Fetch all active sequences
  const { data: sequences, error } = await supabase
    .from('lead_sequences')
    .select('id, email, company_name, vip_score')
    .eq('status', 'active')
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  if (!sequences?.length) return res.status(200).json({ ok: true, checked: 0, alerts: 0 });

  // Deduplicate domains
  const domains = [...new Set(sequences.map(s => s.email.split('@')[1]).filter(Boolean))];

  let alertCount = 0;
  const results = [];

  for (const domain of domains) {
    try {
      // Load stored trigger event types for this domain
      const { data: stored } = await supabase
        .from('research_hooks')
        .select('hooks, scraped_at')
        .eq('domain', domain)
        .order('scraped_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const storedTypes = new Set((stored?.hooks?.trigger_events ?? []).map(e => e.type));

      // Force fresh scrape by deleting cache
      await supabase.from('research_hooks').delete().eq('domain', domain);
      const fresh = await scrapeCompanyHooks(domain);
      const freshEvents = fresh?.trigger_events ?? [];

      // Find event types not seen before
      const newEvents = freshEvents.filter(e => !storedTypes.has(e.type));

      if (newEvents.length > 0) {
        const seqs = sequences.filter(s => s.email.split('@')[1] === domain);
        const companyName = seqs[0]?.company_name ?? domain;
        const emails = seqs.map(s => s.email);

        await sendSignalAlert({ domain, companyName, emails, newEvents });
        alertCount++;
      }

      results.push({
        domain,
        stored_types: storedTypes.size,
        fresh_events: freshEvents.length,
        new_signals: newEvents.length,
      });
    } catch (err) {
      console.error('[monitor] error for domain', domain, err.message);
      results.push({ domain, error: err.message });
    }
  }

  return res.status(200).json({ ok: true, checked: domains.length, alerts: alertCount, results });
}
