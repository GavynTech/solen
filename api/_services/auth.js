/**
 * Centralized auth middleware helpers.
 * Each function returns true if auth FAILED (response already sent),
 * or false if auth passed.
 */

export function requireApiKey(req, res) {
  const key = process.env.PIPELINE_API_KEY;
  if (!key) {
    res.status(500).json({ ok: false, error: 'Server misconfigured' });
    return true;
  }
  const provided = req.headers['x-api-key'];
  if (!provided) {
    res.status(401).json({ ok: false, error: 'API key required' });
    return true;
  }
  if (provided !== key) {
    res.status(403).json({ ok: false, error: 'Invalid API key' });
    return true;
  }
  return false;
}

export function requireAdminPin(req, res) {
  const pin = process.env.ADMIN_PIN;
  if (!pin) {
    res.status(500).json({ ok: false, error: 'Server misconfigured' });
    return true;
  }
  if (!req.body?.pin || req.body.pin !== pin) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return true;
  }
  return false;
}

export function requireCronSecret(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    res.status(500).json({ ok: false, error: 'Server misconfigured' });
    return true;
  }
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${secret}`) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return true;
  }
  return false;
}
