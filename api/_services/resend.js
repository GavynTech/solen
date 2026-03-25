import { Resend } from 'resend';

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getFrom() {
  const domain = process.env.RESEND_FROM_DOMAIN ?? 'resend.dev';
  return `Solens <outreach@${domain}>`;
}

export async function sendOutreachEmail({ to, subject, body }) {
  try {
    const resend = getClient();
    if (!resend) {
      console.warn('[resend] RESEND_API_KEY not set');
      return false;
    }

    const { error } = await resend.emails.send({
      from: getFrom(),
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });

    if (error) {
      // Graceful log on rate limit
      if (error.statusCode === 429) {
        console.warn('[resend] rate limit hit, email not sent to', to);
      } else {
        console.error('[resend] sendOutreachEmail error:', error.message);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('[resend] sendOutreachEmail error:', err.message);
    return false;
  }
}

export async function sendFollowUpEmail({ to, originalSubject, followUpBody, step }) {
  try {
    const resend = getClient();
    if (!resend) {
      console.warn('[resend] RESEND_API_KEY not set');
      return false;
    }

    const subject = step === 2
      ? `Closing the loop — ${originalSubject}`
      : `Re: ${originalSubject}`;

    const { error } = await resend.emails.send({
      from: getFrom(),
      to,
      subject,
      text: followUpBody,
      html: followUpBody.replace(/\n/g, '<br>'),
    });

    if (error) {
      if (error.statusCode === 429) {
        console.warn('[resend] rate limit hit, follow-up not sent to', to);
      } else {
        console.error('[resend] sendFollowUpEmail error:', error.message);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('[resend] sendFollowUpEmail error:', err.message);
    return false;
  }
}
