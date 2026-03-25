import { setCors } from '../_services/cors.js';

export default function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const { pin } = req.body ?? {};
  const adminPin = process.env.ADMIN_PIN;

  if (!adminPin) {
    console.error('[admin/auth] ADMIN_PIN env var not set');
    return res.status(500).json({ ok: false, error: 'Not configured' });
  }

  if (!pin || pin !== adminPin) {
    return res.status(401).json({ ok: false, error: 'Invalid PIN' });
  }

  return res.status(200).json({ ok: true });
}
