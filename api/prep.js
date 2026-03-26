import Anthropic from '@anthropic-ai/sdk';
import { setCors } from './_services/cors.js';
import { enrichWithFirecrawl, scrapeCompanyHooks } from './_services/firecrawl.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PREP_SCHEMA = {
  type: 'object',
  properties: {
    company_summary: {
      type: 'string',
      description: 'Brief overview of the company, what they do, and their market position',
    },
    trigger_events: {
      type: 'array',
      items: { type: 'string' },
      description: 'Recent notable events: funding, launches, hiring surges, expansions, partnerships',
    },
    pain_points: {
      type: 'array',
      items: { type: 'string' },
      description: 'Likely pain points based on company profile and signals, 3-5 items',
    },
    talking_points: {
      type: 'array',
      items: { type: 'string' },
      description: "Specific conversation starters tied to this company's situation, 3-5 items",
    },
    objection_rebuttals: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          objection: { type: 'string' },
          rebuttal: { type: 'string' },
        },
        required: ['objection', 'rebuttal'],
        additionalProperties: false,
      },
      description: 'Top 3 anticipated objections with sharp rebuttals',
    },
    recommended_ask: {
      type: 'string',
      description: 'The single best close for this call — what to ask for specifically',
    },
  },
  required: ['company_summary', 'trigger_events', 'pain_points', 'talking_points', 'objection_rebuttals', 'recommended_ask'],
  additionalProperties: false,
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, pin } = req.body ?? {};
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const domain = email.split('@')[1];

  try {
    const [enriched, hooks] = await Promise.all([
      enrichWithFirecrawl(domain),
      scrapeCompanyHooks(domain),
    ]);

    const context = [
      `Prospect Email: ${email}`,
      `Company Domain: ${domain}`,
      enriched.company_name ? `Company Name: ${enriched.company_name}` : '',
      enriched.industry ? `Industry: ${enriched.industry}` : '',
      enriched.employee_count ? `Employees: ${enriched.employee_count}` : '',
      enriched.funding_stage ? `Funding Stage: ${enriched.funding_stage}` : '',
      enriched.tech_stack?.length ? `Tech Stack: ${enriched.tech_stack.join(', ')}` : '',
      enriched.headquarters ? `HQ: ${enriched.headquarters}` : '',
      hooks.trigger_events?.length
        ? `\nTrigger Events:\n${hooks.trigger_events
            .map(e => `- [${e.type?.toUpperCase()}] ${e.quote}${e.date ? ` (${e.date})` : ''}`)
            .join('\n')}`
        : '',
      hooks.hiring_signals?.length ? `Hiring Signals: ${hooks.hiring_signals.join('; ')}` : '',
      hooks.recent_news?.length ? `Recent News: ${hooks.recent_news.join('; ')}` : '',
      hooks.product_launches?.length ? `Product Activity: ${hooks.product_launches.join('; ')}` : '',
      hooks.pain_points?.length ? `Pain Signals: ${hooks.pain_points.join('; ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      output_config: {
        format: {
          type: 'json_schema',
          schema: PREP_SCHEMA,
        },
      },
      system: `You are an expert sales coach preparing a rep for a discovery call.
Generate a concise, actionable 1-page meeting briefing based on the company intelligence provided.
Be specific — reference actual signals from the data, not generic advice.
Solens sells AI revenue operations: lead scoring, automated outreach sequences, meeting prep, and pipeline intelligence.
Focus on why this company needs Solens right now based on what you can see about their situation.`,
      messages: [
        {
          role: 'user',
          content: `Generate a meeting prep briefing for this prospect:\n\n${context}`,
        },
      ],
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const briefing = JSON.parse(textBlock.text);

    return res.status(200).json({
      ok: true,
      email,
      domain,
      company_name: enriched.company_name ?? domain.split('.')[0],
      briefing,
    });
  } catch (err) {
    console.error('[prep] error:', err.message);
    return res.status(500).json({ error: 'Failed to generate briefing' });
  }
}
