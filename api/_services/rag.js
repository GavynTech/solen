import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ── Tone Detection ────────────────────────────────────────────────────────────

const INFORMAL_SIGNALS = [
  "don't", "can't", "we're", "i'm", "it's", "that's", "isn't", "won't",
  "nope", "yeah", "ok", "okay", "lol", "tbh", "honestly", "look,", "listen,",
];
const FORMAL_SIGNALS = [
  'however', 'therefore', 'furthermore', 'regarding', 'currently',
  'at this time', 'we would', 'please note', 'kindly', 'sincerely',
  'to whom', 'as per', 'in accordance', 'moving forward', 'going forward',
];
const NEGATIVE_SIGNALS = [
  'no', 'not', "can't", "won't", "don't", 'never', 'already', 'expensive',
  'too much', 'waste', 'bad', 'frustrated', 'problem', 'issue', 'difficult',
];
const POSITIVE_SIGNALS = [
  'interested', 'maybe', 'consider', 'open', 'could', 'would', 'thanks',
  'appreciate', 'sounds', 'interesting', 'curious', 'tell me more',
];

export function detectTone(text) {
  if (!text || typeof text !== 'string') {
    return { tone: 'casual', sentiment: 'neutral', word_count: 0, label: 'Casual' };
  }

  const lower = text.toLowerCase();
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;

  const informalCount = INFORMAL_SIGNALS.filter(s => lower.includes(s)).length;
  const formalCount = FORMAL_SIGNALS.filter(s => lower.includes(s)).length;
  const negCount = NEGATIVE_SIGNALS.filter(s => lower.includes(s)).length;
  const posCount = POSITIVE_SIGNALS.filter(s => lower.includes(s)).length;

  // Tone classification
  let tone;
  if (wordCount <= 12 || (wordCount <= 20 && informalCount > 0)) {
    tone = 'short_direct';
  } else if (formalCount >= 2 || wordCount > 60 || (formalCount > informalCount && wordCount > 25)) {
    tone = 'formal_detailed';
  } else {
    tone = 'casual';
  }

  // Sentiment classification
  let sentiment = 'neutral';
  if (negCount >= 2 && negCount > posCount) sentiment = 'negative';
  else if (posCount > negCount) sentiment = 'positive';

  const labels = {
    short_direct: 'Short & Direct',
    formal_detailed: 'Formal & Detailed',
    casual: 'Casual',
  };

  return {
    tone,
    sentiment,
    word_count: wordCount,
    formality_score: formalCount - informalCount,
    label: labels[tone],
  };
}

// ── Tone Mirroring via Claude ─────────────────────────────────────────────────

const TONE_INSTRUCTIONS = {
  short_direct: 'MAX 2 sentences. Lead with the single strongest point. Cut all filler and softeners. Be blunt.',
  formal_detailed: 'Use complete professional paragraphs. Structured reasoning. Acknowledge their point formally before pivoting.',
  casual: 'Conversational and friendly, like a colleague. Contractions OK. Keep it natural.',
};

const SENTIMENT_INSTRUCTIONS = {
  negative: 'They are skeptical or resistant. Acknowledge their concern in the first sentence before making your case.',
  neutral: 'They are neutral. Be direct and confident.',
  positive: 'They seem open. Be warm and move toward a next step.',
};

export async function mirrorTone(response_text, tone, sentiment) {
  const toneRule = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.casual;
  const sentimentRule = SENTIMENT_INSTRUCTIONS[sentiment] ?? SENTIMENT_INSTRUCTIONS.neutral;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001', // Fast + cheap for this task
    max_tokens: 300,
    system: `You are a sales communication specialist. Rewrite objection responses to match the prospect's communication style exactly. Output ONLY the rewritten response — no labels, no explanation, no quotes.`,
    messages: [
      {
        role: 'user',
        content: `Rewrite this sales response to match the following style:

Tone rule: ${toneRule}
Sentiment rule: ${sentimentRule}

Original response:
${response_text}

Output the rewritten response only.`,
      },
    ],
  });

  return message.content[0]?.text?.trim() ?? response_text;
}

// ── Embeddings + Vector Search ────────────────────────────────────────────────

export async function embedText(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.data[0].embedding;
}

export async function findSimilarObjections(query, topK = 3) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  // Run tone detection + embedding in parallel
  const toneAnalysis = detectTone(query);
  const embedding = await embedText(query);

  const { data, error } = await supabase.rpc('match_objections', {
    query_embedding: embedding,
    match_count: topK,
  });

  if (error) throw new Error(`pgvector search error: ${error.message}`);

  const matches = data ?? [];

  // Mirror tone on all matches in parallel
  const mirrored = await Promise.all(
    matches.map(async match => {
      const mirrored_response = await mirrorTone(
        match.response_text,
        toneAnalysis.tone,
        toneAnalysis.sentiment
      );
      return { ...match, mirrored_response };
    })
  );

  return { matches: mirrored, tone_analysis: toneAnalysis };
}
