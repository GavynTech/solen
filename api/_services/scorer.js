import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    vip_score: { type: 'integer', description: 'Score from 0-100 indicating lead quality' },
    vip_tier: { type: 'string', enum: ['VIP', 'High', 'Medium', 'Low'] },
    score_rationale: { type: 'string', description: 'Brief explanation of the score' },
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
  required: ['vip_score', 'vip_tier', 'score_rationale', 'outreach_draft', 'recommended_action', 'confidence_interval'],
  additionalProperties: false,
};

export async function scoreWithClaude({ email, name, enriched, research, null_fields_patched }) {
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
Write personalized outreach referencing specific company details. Be direct and value-focused, not generic.`,
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
