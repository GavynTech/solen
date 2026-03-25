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

export default function ObjectionHandler({ pin }) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setMatches(null);

    try {
      const res = await fetch('/api/objections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, query: query.trim() }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Search failed');
      setMatches(json.matches ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white/80 mb-1">Objection Handler</h2>
        <p className="text-xs text-white/30">Type a prospect objection to find the best response from the playbook.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='e.g. "We already use ZoomInfo"'
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-400/80 bg-red-400/10 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {matches !== null && matches.length === 0 && (
        <div className="text-sm text-white/30 text-center py-10">
          No matching responses found. Try rephrasing the objection.
        </div>
      )}

      {matches && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((match, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"
            >
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
              <div className="px-5 py-4">
                <p className="text-sm text-white/80 leading-relaxed">{match.response_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
