import { findSimilarObjections } from './_services/rag.js';
import { setCors } from './_services/cors.js';

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const { pin, query } = req.body ?? {};

  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return res.status(400).json({ ok: false, error: 'Query required' });
  }

  try {
    const matches = await findSimilarObjections(query.trim());
    return res.status(200).json({ ok: true, matches });
  } catch (err) {
    console.error('[objections]', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
