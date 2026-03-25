import { getLeadsWithSequences } from '../_services/supabase.js';

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

  const { pin } = req.body ?? {};
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).set(CORS_HEADERS).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    const { leads, sequences, metrics } = await getLeadsWithSequences();
    return res.status(200).set(CORS_HEADERS).json({ ok: true, leads, sequences, metrics });
  } catch (err) {
    console.error('[admin/leads]', err.message);
    return res.status(500).set(CORS_HEADERS).json({ ok: false, error: 'Failed to fetch leads' });
  }
}
