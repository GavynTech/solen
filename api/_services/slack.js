const TIER_EMOJI = { VIP: '🔥', High: '⚡', Medium: '📊', Low: '📋' };
const TIER_COLOR = { VIP: '#7c3aed', High: '#2563eb', Medium: '#d97706', Low: '#6b7280' };

export async function sendSlackAlert({ email, name, enriched, score, hubspot_id }) {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('[slack] SLACK_WEBHOOK_URL not set');
      return false;
    }

    const tier = score.vip_tier ?? 'Medium';
    const emoji = TIER_EMOJI[tier] ?? '📊';
    const color = TIER_COLOR[tier] ?? '#6b7280';
    const company = enriched.company_name ?? email.split('@')[1] ?? 'Unknown Company';
    const hubspotUrl = hubspot_id
      ? `https://app.hubspot.com/contacts/contact/${hubspot_id}`
      : null;

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} New ${tier} Lead — ${company}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Email:*\n${email}` },
          { type: 'mrkdwn', text: `*VIP Score:*\n${score.vip_score}/100 (${tier})` },
          { type: 'mrkdwn', text: `*Company:*\n${company}` },
          { type: 'mrkdwn', text: `*Employees:*\n${enriched.employee_count ?? 'Unknown'}` },
          { type: 'mrkdwn', text: `*Industry:*\n${enriched.industry ?? 'Unknown'}` },
          { type: 'mrkdwn', text: `*Funding:*\n${enriched.funding_stage ?? 'Unknown'}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Score Rationale:*\n${score.score_rationale ?? 'N/A'}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Recommended Action:*\n${score.recommended_action ?? 'N/A'}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Email Draft Subject:*\n${score.outreach_draft?.subject ?? 'N/A'}`,
        },
      },
    ];

    const actions = [];
    if (hubspotUrl) {
      actions.push({
        type: 'button',
        text: { type: 'plain_text', text: '👤 View in HubSpot', emoji: true },
        url: hubspotUrl,
        style: 'primary',
      });
    }
    if (score.outreach_draft?.body) {
      actions.push({
        type: 'button',
        text: { type: 'plain_text', text: '📋 Copy Email Draft', emoji: true },
        value: score.outreach_draft.body,
        action_id: 'copy_email_draft',
      });
    }

    if (actions.length > 0) {
      blocks.push({ type: 'actions', elements: actions });
    }

    blocks.push({ type: 'divider' });

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [{ color, blocks }],
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('[slack] error:', err.message);
    return false;
  }
}
