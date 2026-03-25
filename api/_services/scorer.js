import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    vip_score: { type: 'integer', description: 'Score from 0-100 indicating lead quality' },
    vip_tier: { type: 'string', enum: ['VIP', 'High', 'Medium', 'Low'] },
    score_rationale: { type: 'string', description: 'Brief explanation of the score' },
    score_factors: {
      type: 'array',
      description: 'Breakdown of the score across 4 categories',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'e.g. ICP Fit, Intent Signals, Engagement Fit, Revenue Fit' },
          score: { type: 'integer', description: 'Sub-score 0-100' },
          reason: { type: 'string', description: 'One-sentence explanation for this sub-score' },
        },
        required: ['category', 'score', 'reason'],
        additionalProperties: false,
      },
    },
    hooks_used: {
      type: 'array',
      description: 'Which research hooks were referenced in the outreach draft',
      items: { type: 'string' },
    },
    outreach_draft: {
      type: 'object',
      properties: {
        subject: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['subject', 'body'],
      additionalProperties: false,
    },
    recommended_action: { type: 'string', description: 'Suggested next step for sales team' },
    confidence_interval: { type: 'string', description: 'Confidence range e.g. 85-95' },
  },
  required: ['vip_score', 'vip_tier', 'score_rationale', 'score_factors', 'hooks_used', 'outreach_draft', 'recommended_action', 'confidence_interval'],
  additionalProperties: false,
};

export async function scoreWithClaude({ email, name, enriched, research, null_fields_patched, hooks }) {
  const hooksSection = hooks && Object.values(hooks).some(v => v?.length > 0)
    ? [
        '\nRecent Intelligence (from company website):',
        hooks.recent_news?.length ? `  News: ${hooks.recent_news.join('; ')}` : '',
        hooks.hiring_signals?.length ? `  Hiring: ${hooks.hiring_signals.join('; ')}` : '',
        hooks.product_launches?.length ? `  Products: ${hooks.product_launches.join('; ')}` : '',
        hooks.pain_points?.length ? `  Pain points: ${hooks.pain_points.join('; ')}` : '',
      ].filter(Boolean).join('\n')
    : '';

  const leadContext = [
    `Email: ${email}`,
    name ? `Name: ${name}` : '',
    `Company: ${enriched.company_name ?? 'Unknown'}`,
    `Industry: ${enriched.industry}`,
    `Employees: ${enriched.employee_count}`,
    `Annual Revenue: ${enriched.annual_revenue ? `$${enriched.annual_revenue.toLocaleString()}` : 'Unknown'}`,
    `Funding Stage: ${enriched.funding_stage}`,
    `Tech Stack: ${Array.isArray(enriched.tech_stack) ? enriched.tech_stack.slice(0, 8).join(', ') : 'Unknown'}`,
    enriched.headquarters ? `HQ: ${enriched.headquarters}` : '',
    research.summary ? `\nResearch Summary:\n${research.summary}` : '',
    research.intent_signals?.length ? `Intent Signals: ${research.intent_signals.join(', ')}` : '',
    null_fields_patched.length ? `\n(Note: ${null_fields_patched.join(', ')} were filled with defaults due to missing data)` : '',
    hooksSection,
  ].filter(Boolean).join('\n');

  const stream = await client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    thinking: { type: 'adaptive' },
    output_config: {
      format: {
        type: 'json_schema',
        schema: OUTPUT_SCHEMA,
      },
    },
    system: `You are a revenue operations AI that scores inbound leads for a SaaS company (Solen).
Solen's ideal customer profile: B2B SaaS, Series A-C, 50-500 employees, $5M-$100M ARR, RevOps or Sales Ops team.
Score leads 0-100 based on ICP fit, intent signals, and company health.
VIP = 80+, High = 60-79, Medium = 40-59, Low = <40.
Write personalized outreach referencing specific company details. Be direct and value-focused, not generic.

Always populate score_factors with exactly 4 entries: ICP Fit, Intent Signals, Engagement Fit, Revenue Fit. Each sub-score 0-100.
If Recent Intelligence is provided, weave the top 2 most relevant hooks into the outreach_draft body, and list those hooks in hooks_used.`,
    messages: [
      {
        role: 'user',
        content: `Score this lead and draft personalized outreach:\n\n${leadContext}`,
      },
    ],
  });

  const response = await stream.finalMessage();
  const textBlock = response.content.find((b) => b.type === 'text');
  return JSON.parse(textBlock.text);
}
