import { findSimilarObjections } from './_services/rag.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(CORS_HEADERS).json({ ok: false });
  }

  const { pin, query } = req.body ?? {};

  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).set(CORS_HEADERS).json({ ok: false, error: 'Unauthorized' });
  }

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return res.status(400).set(CORS_HEADERS).json({ ok: false, error: 'Query required' });
  }

  try {
    const matches = await findSimilarObjections(query.trim());
    return res.status(200).set(CORS_HEADERS).json({ ok: true, matches });
  } catch (err) {
    console.error('[objections]', err.message);
    return res.status(500).set(CORS_HEADERS).json({ ok: false, error: err.message });
  }
}
