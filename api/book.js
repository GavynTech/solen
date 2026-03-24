import { Resend } from 'resend';
import { enrichWithApollo } from './_services/apollo.js';
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

  try {
    const { name, email, company, plan, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and email are required.' });
    }

    // Fire pipeline in background — don't block the email confirmation
    (async () => {
      try {
        const enrichment = await enrichWithApollo(email);
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

    await resend.emails.send({
      from: FROM,
      to: NOTIFY_EMAIL,
      subject: `New Solen lead: ${name} — ${plan || 'General inquiry'}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;color:#1e293b">
          <h2 style="color:#7c3aed">New Solen Lead</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#64748b;width:120px">Name</td><td style="padding:6px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Company</td><td style="padding:6px 0">${company || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Plan</td><td style="padding:6px 0">${plan || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;vertical-align:top">Message</td><td style="padding:6px 0">${message || '—'}</td></tr>
          </table>
        </div>
      `,
    });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You're on the Solen list, ${name.split(' ')[0]}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;color:#1e293b">
          <h2 style="color:#7c3aed">We got your request</h2>
          <p>Hey ${name.split(' ')[0]},</p>
          <p>Thanks for reaching out about <strong>${plan || 'Solen'}</strong>. We'll be in touch within 24 hours to book your strategy call.</p>
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
