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
    rationale_object: {
      type: 'object',
      description: 'SHAP-style structured rationale for the score',
      properties: {
        positive_boosters: {
          type: 'array',
          description: 'Exactly 3 specific signals that boosted this score',
          items: {
            type: 'object',
            properties: {
              signal: { type: 'string', description: 'Short label, e.g. "Recent Series A funding"' },
              impact: { type: 'string', description: 'Why this signal matters for Solen\'s ICP' },
            },
            required: ['signal', 'impact'],
            additionalProperties: false,
          },
        },
        risk_factor: {
          type: 'object',
          description: 'The single biggest red flag or uncertainty for this lead',
          properties: {
            signal: { type: 'string', description: 'Short label, e.g. "Low employee growth"' },
            impact: { type: 'string', description: 'Why this is a risk or what to watch for' },
          },
          required: ['signal', 'impact'],
          additionalProperties: false,
        },
        sales_hook: {
          type: 'string',
          description: 'The single sharpest angle for the sales rep to lead with — specific to this company\'s situation',
        },
      },
      required: ['positive_boosters', 'risk_factor', 'sales_hook'],
      additionalProperties: false,
    },
    recommended_action: { type: 'string', description: 'Suggested next step for sales team' },
    confidence_interval: { type: 'string', description: 'Confidence range e.g. 85-95' },
  },
  required: ['vip_score', 'vip_tier', 'score_rationale', 'score_factors', 'rationale_object', 'hooks_used', 'outreach_draft', 'recommended_action', 'confidence_interval'],
  additionalProperties: false,
};

export async function scoreWithClaude({ email, name, enriched, research, null_fields_patched, hooks }) {
  const triggerEvents = hooks?.trigger_events ?? [];
  const personalizationSnippet = hooks?.personalization_snippet ?? null;

  const hooksSection = hooks && Object.values(hooks).some(v => v?.length > 0)
    ? [
        '\nRecent Intelligence (from company website):',
        personalizationSnippet ? `  Trigger Event Opener: "${personalizationSnippet}"` : '',
        triggerEvents.length
          ? `  Trigger Events:\n${triggerEvents.map(e => `    - [${e.type.toUpperCase()}] "${e.quote}"${e.date ? ` (${e.date})` : ''}`).join('\n')}`
          : '',
        hooks.recent_news?.length ? `  News signals: ${hooks.recent_news.join('; ')}` : '',
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
If Recent Intelligence is provided:
- If a "Trigger Event Opener" is present, use it as the FIRST sentence of the outreach_draft body verbatim, then connect it to Solen's value prop.
- Otherwise weave the top 2 most relevant hooks into the outreach body.
- List all hooks/events referenced in hooks_used.

For rationale_object:
- positive_boosters: exactly 3 specific, concrete signals from the lead data that raised the score (e.g. "Series B funding — $12M raised", "Using HubSpot + Salesforce stack", "Hiring 4 RevOps roles"). Be specific, not generic.
- risk_factor: the single biggest concern (e.g. "Only 45 employees — may lack dedicated RevOps budget", "No funding data — revenue trajectory unclear").
- sales_hook: one sharp, specific angle tailored to this company's situation that a rep should lead with (e.g. "Lead with their EMEA expansion — Solen can score and sequence their new market leads automatically").`,
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
