import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function logEnrichmentEvent(record) {
  // Fire-and-forget: never blocks the pipeline response
  Promise.resolve().then(async () => {
    try {
      const supabase = getClient();
      if (!supabase) {
        console.warn('[supabase] missing env vars, skipping log');
        return;
      }
      const { error } = await supabase.from('enrichment_events').insert([record]);
      if (error) console.error('[supabase] insert error:', error.message);
    } catch (err) {
      console.error('[supabase] error:', err.message);
    }
  }).catch(console.error);
}
