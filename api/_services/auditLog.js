/**
 * Fire-and-forget security event logger → Supabase audit_log table.
 *
 * Required Supabase migration (run once in SQL editor):
 *
 *   create table audit_log (
 *     id         uuid        default gen_random_uuid() primary key,
 *     event_type text        not null,
 *     ip         text,
 *     endpoint   text,
 *     details    jsonb,
 *     created_at timestamptz default now()
 *   );
 *   -- service role only, no RLS needed
 */

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ??
    req.socket?.remoteAddress ??
    'unknown'
  );
}

/**
 * Log a security-relevant event. Non-blocking — never throws.
 *
 * @param {object} params
 * @param {'auth_failure'|'rate_limited'|'admin_action'|'cron_triggered'} params.event_type
 * @param {object} params.req      - Request object (for IP extraction)
 * @param {string} params.endpoint - e.g. '/api/pipeline'
 * @param {object} [params.details]- Extra JSONB payload
 */
export function logAuditEvent({ event_type, req, endpoint, details = {} }) {
  const supabase = getSupabase();
  if (!supabase) return;

  const ip = getIp(req);

  supabase
    .from('audit_log')
    .insert({ event_type, ip, endpoint, details })
    .then(({ error }) => {
      if (error) console.error('[auditLog] insert error:', error.message);
    })
    .catch(err => console.error('[auditLog] unexpected error:', err.message));
}
