import { sanitizeCompanyName } from './sanitize.js';

export async function researchWithPerplexity(apolloData, email) {
  try {
    const rawCompany = apolloData.company_name ?? email.split('@')[1]?.split('.')[0] ?? 'the company';
    const company = sanitizeCompanyName(rawCompany);

    const prompt = [
      `Research the company "${company}" for sales intelligence purposes.`,
      apolloData.industry ? `Industry: ${apolloData.industry}.` : '',
      apolloData.headquarters ? `HQ: ${apolloData.headquarters}.` : '',
      'Provide: recent hiring signals, press releases or product launches in the last 6 months,',
      'growth indicators, funding news, and any intent signals that suggest they may need revenue operations tooling.',
      'Be concise and factual. Focus on actionable sales intelligence.',
    ].filter(Boolean).join(' ');

    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      console.warn('[perplexity] non-200:', res.status);
      return { summary: null, intent_signals: [] };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '';

    // Extract simple intent signals by looking for key phrases
    const signalKeywords = ['hiring', 'funding', 'launch', 'expansion', 'partnership', 'acquisition', 'growth'];
    const intent_signals = signalKeywords.filter((k) => text.toLowerCase().includes(k));

    return { summary: text.trim() || null, intent_signals };
  } catch (err) {
    console.error('[perplexity] error:', err.message);
    return { summary: null, intent_signals: [] };
  }
}
