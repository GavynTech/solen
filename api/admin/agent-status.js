import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function statusFromAge(timestamp, thresholdMs = 10 * 60 * 1000) {
  if (!timestamp) return 'standby';
  const age = Date.now() - new Date(timestamp).getTime();
  return age < thresholdMs ? 'running' : 'idle';
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(CORS_HEADERS).json({ ok: false });
  }

  const { pin } = req.body ?? {};
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).set(CORS_HEADERS).json({ ok: false, error: 'Unauthorized' });
  }

  const supabase = getClient();
  if (!supabase) {
    return res.status(200).set(CORS_HEADERS).json({ ok: true, agents: FALLBACK_AGENTS, feed: [] });
  }

  try {
    const [enrichmentRes, sequenceRes, researchHooksRes, prospectRunsRes] = await Promise.all([
      supabase
        .from('enrichment_events')
        .select('created_at, vip_score, company_name')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('lead_sequences')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('research_hooks')
        .select('scraped_at')
        .order('scraped_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('prospect_runs')
        .select('created_at, status, total')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const events = enrichmentRes.data ?? [];
    const lastEnrichment = events[0]?.created_at ?? null;
    const lastSequence = sequenceRes.data?.[0]?.created_at ?? null;
    const lastHook = researchHooksRes.data?.scraped_at ?? null;
    const lastProspect = prospectRunsRes.data?.created_at ?? null;
    const scoredCount = events.filter(r => r.vip_score !== null).length;

    const feed = events.slice(0, 20).map(r => ({
      timestamp: r.created_at,
      agent: 'Pipeline Agent',
      action: `Processed ${r.company_name ?? 'lead'} — score ${r.vip_score ?? '?'}`,
    }));

    const agents = [
      {
        id: 'pipeline',
        name: 'Pipeline Agent',
        monitors: 'enrichment_events',
        status: statusFromAge(lastEnrichment),
        last_run: lastEnrichment,
        stat: `${events.length} leads processed`,
      },
      {
        id: 'sequence',
        name: 'Sequence Agent',
        monitors: 'lead_sequences',
        // Daily cron — "running" if ran within last 24h
        status: statusFromAge(lastSequence, 24 * 60 * 60 * 1000),
        last_run: lastSequence,
        stat: lastSequence ? 'Daily cron active' : 'No sequences yet',
      },
      {
        id: 'scout',
        name: 'Scout Agent',
        monitors: 'research_hooks',
        status: statusFromAge(lastHook),
        last_run: lastHook,
        stat: lastHook ? 'Domains scraped' : 'No scrapes yet',
      },
      {
        id: 'scorer',
        name: 'Scorer Agent',
        monitors: 'enrichment_events.vip_score',
        status: statusFromAge(lastEnrichment),
        last_run: lastEnrichment,
        stat: `${scoredCount} leads scored`,
      },
      {
        id: 'prospect',
        name: 'Prospect Agent',
        monitors: 'prospect_runs',
        status: statusFromAge(lastProspect),
        last_run: lastProspect,
        stat: prospectRunsRes.data
          ? `Last batch: ${prospectRunsRes.data.total ?? 0} leads`
          : 'No runs yet',
      },
      {
        id: 'chat',
        name: 'Chat Agent',
        monitors: 'chat API calls',
        status: 'standby',
        last_run: null,
        stat: 'V1 — always standby',
      },
    ];

    return res.status(200).set(CORS_HEADERS).json({ ok: true, agents, feed });
  } catch (err) {
    console.error('[agent-status]', err.message);
    return res.status(500).set(CORS_HEADERS).json({ ok: false, error: err.message });
  }
}

const FALLBACK_AGENTS = [
  { id: 'pipeline', name: 'Pipeline Agent', status: 'standby', last_run: null, stat: '—' },
  { id: 'sequence', name: 'Sequence Agent', status: 'standby', last_run: null, stat: '—' },
  { id: 'scout', name: 'Scout Agent', status: 'standby', last_run: null, stat: '—' },
  { id: 'scorer', name: 'Scorer Agent', status: 'standby', last_run: null, stat: '—' },
  { id: 'prospect', name: 'Prospect Agent', status: 'standby', last_run: null, stat: '—' },
  { id: 'chat', name: 'Chat Agent', status: 'standby', last_run: null, stat: 'V1 — always standby' },
];
