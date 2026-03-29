import Anthropic from '@anthropic-ai/sdk';
import { setCors } from './_services/cors.js';
import { requireApiKey } from './_services/auth.js';
import { checkRateLimit } from './_services/rateLimit.js';
import { logAuditEvent } from './_services/auditLog.js';

const SYSTEM_PROMPT = `You are Solen's AI assistant. Solen builds done-for-you automated business systems —
real-time lead enrichment, GPT-4o VIP scoring, personalized outreach drafts, and Slack/HubSpot
alerts, all within 3 seconds of a signup. Be concise, helpful, and sales-savvy.
If someone asks about pricing or getting started, direct them to fill out the form on the page.`;

// Retry with exponential backoff for transient failures (rate limits, server overload)
async function createWithRetry(client, params, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.messages.create(params);
    } catch (err) {
      const isRetryable = err.status === 429 || err.status === 529 || (err.status >= 500 && err.status < 600);
      if (!isRetryable || attempt === maxRetries) throw err;
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    if (!setCors(req, res)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Origin not allowed' }));
    }
    res.writeHead(204);
    return res.end();
  }

  if (!setCors(req, res)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Origin not allowed' }));
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  if (requireApiKey(req, res)) {
    logAuditEvent({ event_type: 'auth_failure', req, endpoint: '/api/chat', details: { reason: 'missing_or_invalid_api_key' } });
    return;
  }

  if (checkRateLimit(req, res, 'chat')) {
    logAuditEvent({ event_type: 'rate_limited', req, endpoint: '/api/chat' });
    return;
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'messages array required' }));
  }

  // Sanitize: only allow valid roles and string content to avoid injection
  const sanitized = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (sanitized.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'No valid messages provided' }));
  }

  try {
    const client = new Anthropic({ apiKey: process.env.api_key_claude20 ?? process.env.ANTHROPIC_API_KEY });
    const response = await createWithRetry(client, {
      model:      'claude-opus-4-6',
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages:   sanitized,
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ reply: text }));
  } catch (err) {
    console.error('Chat API error:', err);
    const status = err.status === 429 ? 429 : 500;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: status === 429 ? 'Rate limit reached. Try again shortly.' : 'Something went wrong. Please try again.' }));
  }
}
