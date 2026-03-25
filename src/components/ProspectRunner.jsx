import { useState } from 'react';

const TIER_COLOR = {
  VIP: 'text-violet-400',
  High: 'text-blue-400',
  Medium: 'text-amber-400',
  Low: 'text-white/40',
};

export default function ProspectRunner({ pin }) {
  const [icp, setIcp] = useState({
    titles: '',
    industries: '',
    employee_min: 50,
    employee_max: 500,
    limit: 5,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  async function handleRun(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch('/api/prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          icp: {
            titles: icp.titles.split(',').map(s => s.trim()).filter(Boolean),
            industries: icp.industries.split(',').map(s => s.trim()).filter(Boolean),
            employee_range: [Number(icp.employee_min), Number(icp.employee_max)],
            limit: Math.min(Number(icp.limit), 5),
          },
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? 'Run failed');
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/70">Ideal Customer Profile</h3>
          <span className="text-xs text-amber-400/70 bg-amber-400/10 px-2 py-0.5 rounded-full">
            Apollo free tier: ~50 credits/mo
          </span>
        </div>

        <form onSubmit={handleRun} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Job Titles (comma-separated)</label>
              <input
                type="text"
                placeholder="CEO, VP of Sales, Head of Revenue"
                value={icp.titles}
                onChange={e => setIcp(p => ({ ...p, titles: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Industries (comma-separated)</label>
              <input
                type="text"
                placeholder="SaaS, Fintech, E-commerce"
                value={icp.industries}
                onChange={e => setIcp(p => ({ ...p, industries: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Employee Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={icp.employee_min}
                  onChange={e => setIcp(p => ({ ...p, employee_min: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
                <span className="text-white/30 text-sm">–</span>
                <input
                  type="number"
                  min="1"
                  value={icp.employee_max}
                  onChange={e => setIcp(p => ({ ...p, employee_max: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">
                Lead Limit <span className="text-white/20">(max 5 on Hobby)</span>
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={icp.limit}
                onChange={e => setIcp(p => ({ ...p, limit: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400/80 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running prospect search…
              </span>
            ) : (
              '🔭 Run Prospect Search'
            )}
          </button>
        </form>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Processed', value: results.total },
              { label: 'High Score', value: results.high_score },
              { label: 'Queued', value: results.queued },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">Results</h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {results.results?.map((r, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/80">{r.email}</div>
                    {r.company && <div className="text-xs text-white/40">{r.company}</div>}
                    {r.error && <div className="text-xs text-red-400/70">{r.error}</div>}
                  </div>
                  {r.score != null && (
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${TIER_COLOR[r.tier] ?? 'text-white/50'}`}>
                        {r.score}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-white/[0.05] ${TIER_COLOR[r.tier] ?? 'text-white/40'}`}>
                        {r.tier}
                      </span>
                      {r.queued && (
                        <span className="text-xs text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                          queued
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
