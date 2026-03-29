const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

function getAllowedOrigins() {
  const env = process.env.ALLOWED_ORIGINS ?? '';
  const fromEnv = env.split(',').map(o => o.trim()).filter(Boolean);
  return [...fromEnv, ...DEV_ORIGINS];
}

/**
 * Set CORS headers for an allowed origin.
 * Returns false (without sending a response) if the Origin is present but not in the allowlist —
 * the caller must send a 403. Returns true if CORS headers were set (or no Origin header present).
 */
export function setCors(req, res) {
  const origin = req.headers['origin'];

  if (origin) {
    const allowed = getAllowedOrigins();
    if (!allowed.includes(origin)) return false;
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  return true;
}
