import { Resend } from 'resend';
import { checkRateLimit } from './_services/rateLimit.js';
import { logAuditEvent } from './_services/auditLog.js';
import { escapeHtml } from './_services/sanitize.js';
import { enrichWithFirecrawl } from './_services/firecrawl.js';
import { scoreWithClaude } from './_services/scorer.js';
import { nullSafeRoute } from './_services/router.js';
import { upsertHubSpotContact } from './_services/hubspot.js';
import { sendSlackAlert } from './_services/slack.js';
import { logEnrichmentEvent } from './_services/supabase.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = 'heavyworkloads99@proton.me';
const FROM = 'Solen <onboarding@resend.dev>';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (checkRateLimit(req, res, 'book')) {
    logAuditEvent({ event_type: 'rate_limited', req, endpoint: '/api/book' });
    return;
  }

  try {
    const { name, email, company, plan, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and email are required.' });
    }

    // Fire pipeline in background — don't block the email confirmation
    (async () => {
      try {
        const emailDomain = email.split('@')[1];
        const enrichment = await enrichWithFirecrawl(emailDomain);
        const routed     = nullSafeRoute({ ...enrichment, company_name: enrichment.company_name ?? company });
        const score      = await scoreWithClaude(email, routed);
        const [hsResult] = await Promise.allSettled([
          upsertHubSpotContact({ email, name, company: routed.company_name, plan }),
          sendSlackAlert({
            email, name,
            enrichment: routed,
            score,
            source: `booking_cta — ${plan || 'Discovery Call'}`,
          }),
          logEnrichmentEvent({ email, enrichment: routed, score, source: 'booking' }),
        ]);
        void hsResult;
      } catch (pipelineErr) {
        console.error('[book] pipeline error:', pipelineErr.message);
      }
    })();

    const safeName    = escapeHtml(name);
    const safeEmail   = escapeHtml(email);
    const safeCompany = escapeHtml(company);
    const safePlan    = escapeHtml(plan);
    const safeMessage = escapeHtml(message);
    const firstName   = escapeHtml(name.split(' ')[0]);

    await resend.emails.send({
      from: FROM,
      to: NOTIFY_EMAIL,
      subject: `New Solen lead: ${safeName} — ${safePlan || 'General inquiry'}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;color:#1e293b">
          <h2 style="color:#7c3aed">New Solen Lead</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#64748b;width:120px">Name</td><td style="padding:6px 0;font-weight:600">${safeName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0">${safeEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Company</td><td style="padding:6px 0">${safeCompany || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Plan</td><td style="padding:6px 0">${safePlan || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;vertical-align:top">Message</td><td style="padding:6px 0">${safeMessage || '—'}</td></tr>
          </table>
        </div>
      `,
    });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You're on the Solen list, ${firstName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;color:#1e293b">
          <h2 style="color:#7c3aed">We got your request</h2>
          <p>Hey ${firstName},</p>
          <p>Thanks for reaching out about <strong>${safePlan || 'Solen'}</strong>. We'll be in touch within 24 hours to book your strategy call.</p>
          <p style="color:#64748b;font-size:14px">— The Solen Team</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/book]', err);
    return res.status(500).json({ ok: false, error: 'Failed to send. Please try again later.' });
  }
}
