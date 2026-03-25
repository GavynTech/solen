import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function embedText(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.data[0].embedding;
}

export async function findSimilarObjections(query, topK = 3) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const embedding = await embedText(query);

  const { data, error } = await supabase.rpc('match_objections', {
    query_embedding: embedding,
    match_count: topK,
  });

  if (error) throw new Error(`pgvector search error: ${error.message}`);

  return data ?? [];
}
