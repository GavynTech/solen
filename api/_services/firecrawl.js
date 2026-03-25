import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Pages most likely to contain trigger events
const TRIGGER_PATHS = ['/blog', '/news', '/newsroom', '/press', '/updates', '/announcements'];

// Trigger event definitions: keyword → event type + verb for snippet
const TRIGGER_KEYWORDS = [
  { keyword: 'launched',    type: 'launch',      verb: 'launched' },
  { keyword: 'launch',      type: 'launch',      verb: 'launched' },
  { keyword: 'introducing', type: 'launch',      verb: 'introduced' },
  { keyword: 'announcing',  type: 'announcement', verb: 'announced' },
  { keyword: 'announced',   type: 'announcement', verb: 'announced' },
  { keyword: 'partnership', type: 'partnership', verb: 'partnered' },
  { keyword: 'partnered',   type: 'partnership', verb: 'partnered' },
  { keyword: 'award',       type: 'award',       verb: 'won an award' },
  { keyword: 'recognized',  type: 'award',       verb: 'was recognized' },
  { keyword: 'funding',     type: 'funding',     verb: 'raised funding' },
  { keyword: 'raised',      type: 'funding',     verb: 'raised' },
  { keyword: 'series a',    type: 'funding',     verb: 'closed a Series A' },
  { keyword: 'series b',    type: 'funding',     verb: 'closed a Series B' },
  { keyword: 'series c',    type: 'funding',     verb: 'closed a Series C' },
  { keyword: 'hiring',      type: 'hiring',      verb: 'is actively hiring' },
  { keyword: "we're hiring", type: 'hiring',     verb: 'is actively hiring' },
  { keyword: 'expanding',   type: 'expansion',   verb: 'is expanding' },
  { keyword: 'expansion',   type: 'expansion',   verb: 'announced an expansion' },
];

// Date patterns to extract from surrounding text
const DATE_REGEX = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:,?\s+\d{4})?|\b\d{1,2}\/\d{1,2}\/\d{2,4}|\b(q[1-4]\s+\d{4}|\d{4})\b/gi;

async function getCachedHooks(domain) {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase
      .from('research_hooks')
      .select('hooks, scraped_at')
      .eq('domain', domain)
      .order('scraped_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const age = Date.now() - new Date(data.scraped_at).getTime();
    return age < CACHE_TTL_MS ? data.hooks : null;
  } catch {
    return null;
  }
}

async function scrapeUrl(url, signal) {
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
    signal,
  });
  if (!res.ok) return '';
  const json = await res.json();
  return json.data?.markdown ?? '';
}

function extractSentencesAround(markdown, keyword) {
  // Split into sentences, find ones containing the keyword, return best match
  const sentences = markdown
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 300);

  const lower = markdown.toLowerCase();
  const matches = [];

  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(keyword)) {
      // Try to extract a date from nearby context
      const dateMatch = sentence.match(DATE_REGEX);
      matches.push({
        quote: sentence.replace(/\s+/g, ' ').trim(),
        date: dateMatch ? dateMatch[0] : null,
      });
    }
  }

  return matches.slice(0, 2); // Return top 2 matches per keyword
}

function extractTriggerEvents(markdown, domain) {
  const lower = markdown.toLowerCase();
  const seen = new Set();
  const events = [];

  for (const { keyword, type, verb } of TRIGGER_KEYWORDS) {
    if (!lower.includes(keyword)) continue;
    if (seen.has(type)) continue; // One event per type

    const matches = extractSentencesAround(lower === markdown ? markdown : markdown, keyword);
    if (matches.length === 0) continue;

    const best = matches[0];
    seen.add(type);

    // Build personalization snippet — ready to use as email opener
    const companyName = domain.split('.')[0];
    const company = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    const dateStr = best.date ? ` in ${best.date}` : ' recently';
    const snippet = `Saw that ${company} ${verb}${dateStr}`;

    events.push({
      type,
      keyword,
      quote: best.quote,
      date: best.date ?? null,
      personalization_snippet: snippet,
    });

    if (events.length >= 3) break; // Cap at 3 trigger events
  }

  return events;
}

function extractBaseHooks(markdown) {
  const lower = markdown.toLowerCase();
  const hooks = {
    recent_news: [],
    hiring_signals: [],
    product_launches: [],
    pain_points: [],
  };

  if (['careers', 'join our team', 'open positions', 'now hiring'].some(p => lower.includes(p))) {
    hooks.hiring_signals.push('Active hiring signals detected');
  }
  if (['new release', 'new feature', 'product update'].some(p => lower.includes(p))) {
    hooks.product_launches.push('Product launch activity detected');
  }
  if (['press release', 'raised', 'series a', 'series b', 'funding'].some(p => lower.includes(p))) {
    hooks.recent_news.push('Funding or press activity found');
  }
  if (['manual process', 'inefficient', 'pain point', 'struggling'].some(p => lower.includes(p))) {
    hooks.pain_points.push('Pain signal language detected');
  }

  Object.keys(hooks).forEach(k => {
    hooks[k] = [...new Set(hooks[k])].slice(0, 3);
  });

  return hooks;
}

export async function scrapeCompanyHooks(domain) {
  if (!domain) return {};
  if (!process.env.FIRECRAWL_API_KEY) return {};

  const cached = await getCachedHooks(domain);
  if (cached) {
    console.log('[firecrawl] cache hit for', domain);
    return cached;
  }

  try {
    // 3s total budget — scrape homepage + trigger pages in parallel
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const urlsToScrape = [
      `https://${domain}`,
      ...TRIGGER_PATHS.map(p => `https://${domain}${p}`),
    ];

    const results = await Promise.allSettled(
      urlsToScrape.map(url => scrapeUrl(url, controller.signal))
    );
    clearTimeout(timeout);

    // Combine all markdown, weight trigger pages higher by appending twice
    const homepageMd = results[0].status === 'fulfilled' ? results[0].value : '';
    const triggerMd = results
      .slice(1)
      .filter(r => r.status === 'fulfilled' && r.value.length > 100)
      .map(r => r.value)
      .join('\n\n');

    const combinedMd = [triggerMd, triggerMd, homepageMd].join('\n\n'); // Trigger pages weighted 2x
    const rawMd = [homepageMd, triggerMd].join('\n\n').slice(0, 10000);

    const baseHooks = extractBaseHooks(combinedMd);
    const triggerEvents = extractTriggerEvents(combinedMd, domain);

    // Top personalization snippet = first trigger event's snippet, or null
    const personalization_snippet = triggerEvents[0]?.personalization_snippet ?? null;

    const hooks = {
      ...baseHooks,
      trigger_events: triggerEvents,
      personalization_snippet,
    };

    // Persist to research_hooks (fire-and-forget)
    const supabase = getSupabase();
    if (supabase) {
      supabase
        .from('research_hooks')
        .upsert(
          { domain, hooks, raw_markdown: rawMd, scraped_at: new Date().toISOString() },
          { onConflict: 'domain' }
        )
        .then(({ error }) => {
          if (error) console.warn('[firecrawl] upsert error:', error.message);
        });
    }

    console.log(`[firecrawl] ${domain}: ${triggerEvents.length} trigger events found`);
    return hooks;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[firecrawl] timeout for', domain);
    } else {
      console.warn('[firecrawl] error for', domain, err.message);
    }
    return {};
  }
}
