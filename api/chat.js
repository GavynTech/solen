import Anthropic from '@anthropic-ai/sdk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(CORS_HEADERS).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).set(CORS_HEADERS).json({ error: 'messages array required' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: `You are Solen's AI assistant. Solen builds done-for-you automated business systems —
real-time lead enrichment, GPT-4o VIP scoring, personalized outreach drafts, and Slack/HubSpot
alerts, all within 3 seconds of a signup. Be concise, helpful, and sales-savvy.
If someone asks about pricing or getting started, direct them to fill out the form on the page.`,
      messages,
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ reply: text }));
  } catch (err) {
    console.error('Chat API error:', err);
    res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Something went wrong. Please try again.' }));
  }
}
