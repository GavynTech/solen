function barColor(score) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-violet-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500/60';
}

function tierColor(tier) {
  const colors = {
    VIP:    'text-violet-400 bg-violet-400/10',
    High:   'text-blue-400 bg-blue-400/10',
    Medium: 'text-amber-400 bg-amber-400/10',
    Low:    'text-white/40 bg-white/[0.05]',
  };
  return colors[tier] ?? colors.Low;
}

const EVENT_BADGE = {
  funding:     'bg-emerald-400/10 text-emerald-400',
  launch:      'bg-violet-400/10 text-violet-400',
  partnership: 'bg-blue-400/10 text-blue-400',
  award:       'bg-amber-400/10 text-amber-400',
  hiring:      'bg-cyan-400/10 text-cyan-400',
  expansion:   'bg-indigo-400/10 text-indigo-400',
  announcement:'bg-white/[0.06] text-white/50',
};

export default function ScoreBreakdown({ score_factors, rationale_object, trigger_events, personalization_snippet, vip_score, vip_tier, rationale }) {
  return (
    <div className="px-6 py-5 space-y-6">
      {/* Overall score */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-white">{vip_score ?? '—'}</div>
        {vip_tier && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tierColor(vip_tier)}`}>
            {vip_tier}
          </span>
        )}
      </div>

      {/* Factor bars */}
      {Array.isArray(score_factors) && score_factors.length > 0 && (
        <div className="space-y-3">
          {score_factors.map((factor, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">{factor.category}</span>
                <span className="text-xs font-semibold text-white/80">{factor.score}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor(factor.score)}`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              {factor.reason && (
                <p className="text-[11px] text-white/30">{factor.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SHAP Rationale Object */}
      {rationale_object && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/[0.06] pt-5">
          {/* Positive Boosters */}
          <div className="sm:col-span-2 space-y-2">
            <p className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-widest">Boosters</p>
            {(rationale_object.positive_boosters ?? []).map((b, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-emerald-400 text-xs mt-0.5 shrink-0">+</span>
                <div>
                  <span className="text-xs text-white/80 font-medium">{b.signal}</span>
                  {b.impact && <p className="text-[11px] text-white/35 mt-0.5">{b.impact}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Risk Factor */}
          {rationale_object.risk_factor && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-red-400/70 uppercase tracking-widest">Risk</p>
              <div className="flex gap-2">
                <span className="text-red-400 text-xs mt-0.5 shrink-0">−</span>
                <div>
                  <span className="text-xs text-white/80 font-medium">{rationale_object.risk_factor.signal}</span>
                  {rationale_object.risk_factor.impact && (
                    <p className="text-[11px] text-white/35 mt-0.5">{rationale_object.risk_factor.impact}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sales Hook */}
      {rationale_object?.sales_hook && (
        <div className="bg-violet-500/[0.07] border border-violet-500/20 rounded-xl px-4 py-3">
          <p className="text-[10px] font-semibold text-violet-400/70 uppercase tracking-widest mb-1">Sales Hook</p>
          <p className="text-sm text-violet-200/80 leading-relaxed">{rationale_object.sales_hook}</p>
        </div>
      )}

      {/* Trigger Events */}
      {Array.isArray(trigger_events) && trigger_events.length > 0 && (
        <div className="border-t border-white/[0.06] pt-5 space-y-3">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Trigger Events</p>
          {personalization_snippet && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5">
              <p className="text-[10px] text-white/40 mb-1">Email Opener</p>
              <p className="text-xs text-white/70 italic">"{personalization_snippet}…"</p>
            </div>
          )}
          {trigger_events.map((event, i) => (
            <div key={i} className="flex gap-3">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 capitalize ${EVENT_BADGE[event.type] ?? EVENT_BADGE.announcement}`}>
                {event.type}
              </span>
              <div>
                <p className="text-xs text-white/60 leading-relaxed">"{event.quote}"</p>
                {event.date && <p className="text-[11px] text-white/25 mt-0.5">{event.date}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rationale */}
      {rationale && (
        <p className="text-xs text-white/35 leading-relaxed border-t border-white/[0.06] pt-4">
          {rationale}
        </p>
      )}
    </div>
  );
}
