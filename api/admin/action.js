import { performSequenceAction } from '../_services/supabase.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const VALID_ACTIONS = ['send_now', 'skip', 'mark_won', 'mark_lost'];

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(CORS_HEADERS).json({ ok: false });
  }

  const { pin, action, sequence_id } = req.body ?? {};

  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).set(CORS_HEADERS).json({ ok: false, error: 'Unauthorized' });
  }

  if (!action || !VALID_ACTIONS.includes(action)) {
    return res.status(400).set(CORS_HEADERS).json({ ok: false, error: 'Invalid action' });
  }

  if (!sequence_id) {
    return res.status(400).set(CORS_HEADERS).json({ ok: false, error: 'sequence_id required' });
  }

  try {
    const ok = await performSequenceAction(sequence_id, action);
    return res.status(ok ? 200 : 500).set(CORS_HEADERS).json({ ok });
  } catch (err) {
    console.error('[admin/action]', err.message);
    return res.status(500).set(CORS_HEADERS).json({ ok: false, error: 'Action failed' });
  }
}
