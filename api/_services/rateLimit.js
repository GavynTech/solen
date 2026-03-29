// In-memory per-IP sliding window rate limiter.
// On Vercel cold start the window resets — acceptable for serverless.

const windows = new Map(); // key: `${endpoint}:${ip}` → [timestamp, ...]

const LIMITS = {
  pipeline: { max: 5,  windowMs: 60 * 60 * 1000 }, // 5/hr
  chat:     { max: 20, windowMs: 60 * 60 * 1000 }, // 20/hr
  book:     { max: 3,  windowMs: 60 * 60 * 1000 }, // 3/hr
};

function getIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ??
    req.socket?.remoteAddress ??
    'unknown'
  );
}

/**
 * Returns true if the request should be blocked (and has already written the 429).
 * Returns false if the request is within the rate limit.
 */
export function checkRateLimit(req, res, endpoint) {
  const limit = LIMITS[endpoint];
  if (!limit) return false;

  const ip = getIp(req);
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  const cutoff = now - limit.windowMs;

  const timestamps = (windows.get(key) ?? []).filter(t => t > cutoff);
  timestamps.push(now);
  windows.set(key, timestamps);

  if (timestamps.length > limit.max) {
    const retryAfter = Math.ceil((timestamps[0] + limit.windowMs - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({
      ok: false,
      error: 'Too many requests. Please try again later.',
      retry_after_seconds: retryAfter,
    });
    return true;
  }

  return false;
}
