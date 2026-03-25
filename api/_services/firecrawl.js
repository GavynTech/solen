import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

function extractHooks(markdown) {
  const lower = markdown.toLowerCase();
  const hooks = {
    recent_news: [],
    hiring_signals: [],
    product_launches: [],
    pain_points: [],
  };

  const hiringPatterns = ["we're hiring", 'join our team', 'open positions', 'careers', 'job openings', 'now hiring'];
  if (hiringPatterns.some(p => lower.includes(p))) {
    hooks.hiring_signals.push('Active hiring — careers page signals detected');
  }

  const productPatterns = [
    ['new release', 'New product release announced'],
    ['launching', 'Product launch activity detected'],
    ['introducing', 'Product introduction content found'],
    ['announcing', 'Announcement content found'],
    ['new feature', 'New feature launch signaled'],
  ];
  productPatterns.forEach(([p, label]) => {
    if (lower.includes(p)) hooks.product_launches.push(label);
  });

  const newsPatterns = [
    ['press release', 'Press release content present'],
    ['funding', 'Funding/investment mention found'],
    ['partnership', 'Partnership announcement detected'],
    ['raised', 'Capital raise language present'],
    ['series a', 'Series A language found'],
    ['series b', 'Series B language found'],
  ];
  newsPatterns.forEach(([p, label]) => {
    if (lower.includes(p)) hooks.recent_news.push(label);
  });

  const painPatterns = [
    ['manual process', 'Manual process pain signal'],
    ['inefficient', 'Efficiency challenge signal'],
    ['struggling', 'Active struggle language found'],
    ['pain point', 'Explicit pain point language'],
    ['too many tools', 'Tool sprawl pain signal'],
  ];
  painPatterns.forEach(([p, label]) => {
    if (lower.includes(p)) hooks.pain_points.push(label);
  });

  // Deduplicate and cap at 3 per category
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://${domain}`,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn('[firecrawl] non-OK status for', domain, res.status);
      return {};
    }

    const json = await res.json();
    const markdown = json.data?.markdown ?? '';
    const hooks = extractHooks(markdown);

    // Persist to research_hooks (fire-and-forget)
    const supabase = getSupabase();
    if (supabase) {
      supabase
        .from('research_hooks')
        .upsert({ domain, hooks, raw_markdown: markdown.slice(0, 10000), scraped_at: new Date().toISOString() }, { onConflict: 'domain' })
        .then(({ error }) => {
          if (error) console.warn('[firecrawl] upsert error:', error.message);
        });
    }

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
