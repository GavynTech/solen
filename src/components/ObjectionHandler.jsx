import { useState } from 'react';

const CATEGORY_BADGE = {
  competitor: 'bg-blue-400/10 text-blue-400',
  budget:     'bg-amber-400/10 text-amber-400',
  timing:     'bg-violet-400/10 text-violet-400',
  authority:  'bg-white/[0.06] text-white/50',
  need:       'bg-emerald-400/10 text-emerald-400',
  trust:      'bg-red-400/10 text-red-400/80',
  process:    'bg-white/[0.06] text-white/40',
  fit:        'bg-indigo-400/10 text-indigo-400',
  technical:  'bg-cyan-400/10 text-cyan-400',
};

const TONE_STYLE = {
  short_direct:    { badge: 'bg-red-400/10 text-red-400',    icon: '⚡', label: 'Short & Direct' },
  formal_detailed: { badge: 'bg-blue-400/10 text-blue-400',  icon: '📋', label: 'Formal & Detailed' },
  casual:          { badge: 'bg-emerald-400/10 text-emerald-400', icon: '💬', label: 'Casual' },
};

const SENTIMENT_STYLE = {
  negative: { color: 'text-red-400/70',     label: 'Skeptical' },
  neutral:  { color: 'text-white/40',        label: 'Neutral' },
  positive: { color: 'text-emerald-400/70', label: 'Open' },
};

function MatchCard({ match, index }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-start justify-between gap-4">
        <p className="text-sm text-white/60 italic">"{match.objection_text}"</p>
        <div className="flex items-center gap-2 shrink-0">
          {match.category && (
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${CATEGORY_BADGE[match.category] ?? 'bg-white/[0.06] text-white/40'}`}>
              {match.category}
            </span>
          )}
          <span className="text-[10px] text-white/25">
            {Math.round((match.similarity ?? 0) * 100)}% match
          </span>
        </div>
      </div>

      {/* Mirrored response (primary) */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-violet-400/70 uppercase tracking-widest">
            Tone-Matched Response
          </span>
          {match.mirrored_response && match.mirrored_response !== match.response_text && (
            <button
              onClick={() => setShowOriginal(v => !v)}
              className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              {showOriginal ? 'Hide original' : 'View original'}
            </button>
          )}
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          {match.mirrored_response ?? match.response_text}
        </p>
      </div>

      {/* Original (toggle) */}
      {showOriginal && (
        <div className="px-5 pb-4 pt-2 border-t border-white/[0.04]">
          <p className="text-[10px] text-white/25 mb-1.5">Original playbook response:</p>
          <p className="text-xs text-white/40 leading-relaxed">{match.response_text}</p>
        </div>
      )}
    </div>
  );
}

export default function ObjectionHandler({ pin }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/objections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, query: query.trim() }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Search failed');
      setResult({ matches: json.matches ?? [], tone_analysis: json.tone_analysis });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tone = result?.tone_analysis;
  const toneStyle = TONE_STYLE[tone?.tone] ?? TONE_STYLE.casual;
  const sentimentStyle = SENTIMENT_STYLE[tone?.sentiment] ?? SENTIMENT_STYLE.neutral;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white/80 mb-1">Objection Handler</h2>
        <p className="text-xs text-white/30">
          Paste a prospect's reply. The AI detects their tone and mirrors it in the response.
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Paste the prospect's reply, e.g. "We already use ZoomInfo and our team is happy with it."`}
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
        >
          {loading ? 'Analyzing…' : 'Find Response'}
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-400/80 bg-red-400/10 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Tone Analysis Banner */}
      {tone && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Detected Tone</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${toneStyle.badge}`}>
              {toneStyle.icon} {toneStyle.label}
            </span>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Sentiment</p>
            <span className={`text-xs font-medium ${sentimentStyle.color}`}>
              {sentimentStyle.label}
            </span>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Word Count</p>
            <span className="text-xs text-white/50">{tone.word_count} words</span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-white/20 leading-relaxed max-w-48">
              Responses below are rewritten to match their {toneStyle.label.toLowerCase()} style.
            </p>
          </div>
        </div>
      )}

      {result?.matches.length === 0 && (
        <div className="text-sm text-white/30 text-center py-10">
          No matching responses found. Try rephrasing the objection.
        </div>
      )}

      {result?.matches.length > 0 && (
        <div className="space-y-4">
          {result.matches.map((match, i) => (
            <MatchCard key={i} match={match} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
