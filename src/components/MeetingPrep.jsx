import { useState } from 'react';

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.02] transition-colors text-left"
      >
        {title}
        <span className="text-white/30 ml-2">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

export default function MeetingPrep({ pin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes('@')) return setError('Enter a valid prospect email');
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Briefing failed');
      setResult(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white/80 mb-1">Meeting Prep Agent</h2>
        <p className="text-xs text-white/30 mb-4">
          Enter a prospect's email. Solens scrapes their company site, runs external research, and generates a
          1-page call briefing in ~10 seconds.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="prospect@company.com"
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Prepping…
              </span>
            ) : (
              'Prep Me'
            )}
          </button>
        </form>
        {error && <p className="mt-3 text-xs text-red-400/80">{error}</p>}
      </div>

      {/* Briefing output */}
      {result && (
        <div className="space-y-3">
          {/* Header card */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-white">{result.company_name}</div>
              <div className="text-xs text-white/40 mt-0.5">{result.email}</div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Briefing Ready
            </span>
          </div>

          <Section title="Company Overview">
            <p className="text-sm text-white/60 leading-relaxed">{result.briefing.company_summary}</p>
          </Section>

          {result.briefing.trigger_events?.length > 0 && (
            <Section title="Trigger Events">
              <ul className="space-y-2">
                {result.briefing.trigger_events.map((event, i) => (
                  <li key={i} className="flex gap-2 text-sm text-white/60">
                    <span className="text-violet-400 shrink-0 mt-0.5">▸</span>
                    {event}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Likely Pain Points">
            <ul className="space-y-2">
              {result.briefing.pain_points.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/60">
                  <span className="text-amber-400 shrink-0 mt-0.5">▸</span>
                  {point}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Talking Points">
            <ul className="space-y-2">
              {result.briefing.talking_points.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/60">
                  <span className="text-emerald-400 shrink-0 mt-0.5">▸</span>
                  {point}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Objection Rebuttals" defaultOpen={false}>
            <div className="space-y-3">
              {result.briefing.objection_rebuttals.map((item, i) => (
                <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-4">
                  <div className="text-xs font-semibold text-red-400/80 mb-1.5">"{item.objection}"</div>
                  <div className="text-sm text-white/60">{item.rebuttal}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Recommended ask — always visible, high contrast */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-5 py-4">
            <div className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-2">
              Recommended Ask
            </div>
            <p className="text-sm text-white/80 font-medium">{result.briefing.recommended_ask}</p>
          </div>
        </div>
      )}
    </div>
  );
}
