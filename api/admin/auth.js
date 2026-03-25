const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(CORS_HEADERS).json({ ok: false });
  }

  const { pin } = req.body ?? {};
  const adminPin = process.env.ADMIN_PIN;

  if (!adminPin) {
    console.error('[admin/auth] ADMIN_PIN env var not set');
    return res.status(500).set(CORS_HEADERS).json({ ok: false, error: 'Not configured' });
  }

  if (!pin || pin !== adminPin) {
    return res.status(401).set(CORS_HEADERS).json({ ok: false, error: 'Invalid PIN' });
  }

  return res.status(200).set(CORS_HEADERS).json({ ok: true });
}
