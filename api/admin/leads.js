import { getLeadsWithSequences } from '../_services/supabase.js';
import { setCors } from '../_services/cors.js';

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const { pin } = req.body ?? {};
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    const { leads, sequences, metrics } = await getLeadsWithSequences();
    return res.status(200).json({ ok: true, leads, sequences, metrics });
  } catch (err) {
    console.error('[admin/leads]', err.message);
    return res.status(500).json({ ok: false, error: 'Failed to fetch leads' });
  }
}
