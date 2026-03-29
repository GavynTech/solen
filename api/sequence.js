import { getSequencesDue, advanceSequence, updateSequenceStatus } from './_services/supabase.js';
import { sendFollowUpEmail } from './_services/resend.js';
import { logAuditEvent } from './_services/auditLog.js';

const TEMPLATES = {
  day3: (company) => `Hi,

Just wanted to follow up on my note about Solens and how we've been helping companies like ${company} close the gap between lead capture and revenue.

Have you had a chance to look it over? I'd love to show you what the pipeline looks like in a quick 15-minute demo — no slides, just a live walkthrough.

Let me know if you're open to it.

Best,
The Solens Team`,

  day7: (company) => `Hi,

I've reached out a couple of times about helping ${company} with automated lead enrichment and scoring — I'll make this my last note.

If the timing isn't right, no worries at all. The door is always open. If you ever want to see what Solens can do, just reply and I'll set something up.

Wishing you and the team continued success.

Best,
The Solens Team`,
};

export default async function handler(req, res) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers['authorization'];
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    logAuditEvent({ event_type: 'auth_failure', req, endpoint: '/api/sequence', details: { reason: 'invalid_cron_secret' } });
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  logAuditEvent({ event_type: 'cron_triggered', req, endpoint: '/api/sequence' });

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const sequences = await getSequencesDue();
    const results = { processed: 0, sent: 0, completed: 0, errors: 0 };

    for (const seq of sequences) {
      results.processed++;
      try {
        if (seq.step === 0) {
          // Day 3 follow-up
          const sent = await sendFollowUpEmail({
            to: seq.email,
            originalSubject: seq.outreach_subject,
            followUpBody: TEMPLATES.day3(seq.company_name ?? 'your company'),
            step: 1,
          });

          if (sent) {
            results.sent++;
            await advanceSequence(seq.id, {
              step: 1,
              next_send_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              sent_at_field: 'day3_sent_at',
            });
          } else {
            results.errors++;
          }
        } else if (seq.step === 1) {
          // Day 7 break-up
          const sent = await sendFollowUpEmail({
            to: seq.email,
            originalSubject: seq.outreach_subject,
            followUpBody: TEMPLATES.day7(seq.company_name ?? 'your company'),
            step: 2,
          });

          if (sent) {
            results.completed++;
            await updateSequenceStatus(seq.id, 'completed');
          } else {
            results.errors++;
          }
        }
      } catch (err) {
        console.error(`[sequence] error processing ${seq.id}:`, err.message);
        results.errors++;
      }
    }

    console.log('[sequence] cron run complete:', results);
    return res.status(200).json({ ok: true, ...results });
  } catch (err) {
    console.error('[sequence] cron error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
