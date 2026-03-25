import { performSequenceAction } from '../_services/supabase.js';
import { setCors } from '../_services/cors.js';

const VALID_ACTIONS = ['send_now', 'skip', 'mark_won', 'mark_lost'];

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const { pin, action, sequence_id } = req.body ?? {};

  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (!action || !VALID_ACTIONS.includes(action)) {
    return res.status(400).json({ ok: false, error: 'Invalid action' });
  }

  if (!sequence_id) {
    return res.status(400).json({ ok: false, error: 'sequence_id required' });
  }

  try {
    const ok = await performSequenceAction(sequence_id, action);
    return res.status(ok ? 200 : 500).json({ ok });
  } catch (err) {
    console.error('[admin/action]', err.message);
    return res.status(500).json({ ok: false, error: 'Action failed' });
  }
}
