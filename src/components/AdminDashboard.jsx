import React, { useState, useEffect, useCallback } from 'react';
import ProspectRunner from './ProspectRunner';
import AgentFleet from './AgentFleet';
import ScoreBreakdown from './ScoreBreakdown';
import ObjectionHandler from './ObjectionHandler';

const TIER_COLOR = {
  VIP: 'text-violet-400',
  High: 'text-blue-400',
  Medium: 'text-amber-400',
  Low: 'text-white/40',
};

const STATUS_BADGE = {
  active:    'bg-emerald-400/10 text-emerald-400',
  pending:   'bg-white/[0.05] text-white/40',
  completed: 'bg-white/[0.05] text-white/30',
  replied:   'bg-blue-400/10 text-blue-400',
  won:       'bg-violet-400/10 text-violet-400',
  lost:      'bg-red-400/10 text-red-400/70',
  skipped:   'bg-white/[0.05] text-white/25',
};

function MetricCard({ label, value }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
      <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  );
}

export default function AdminDashboard({ pin, onLogout }) {
  const [tab, setTab] = useState('leads');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedLead, setExpandedLead] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Failed to load');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAction(sequence_id, action) {
    setActionLoading(sequence_id + action);
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, action, sequence_id }),
      });
      const json = await res.json();
      if (json.ok) fetchData();
    } finally {
      setActionLoading(null);
    }
  }

  // Build a map of sequence by email for the lead table
  const sequenceByEmail = {};
  (data?.sequences ?? []).forEach(s => {
    if (!sequenceByEmail[s.email] || s.created_at > sequenceByEmail[s.email].created_at) {
      sequenceByEmail[s.email] = s;
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#050507] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-xs text-white font-bold">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Solens Admin</h1>
              <p className="text-xs text-white/30">Sales Engine Dashboard</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
          >
            Log out
          </button>
        </div>

        {/* Metrics */}
        {data?.metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Leads Today" value={data.metrics.leads_today} />
            <MetricCard label="Avg Score" value={data.metrics.avg_score} />
            <MetricCard label="Active Sequences" value={data.metrics.sequences_active} />
            <MetricCard label="Emails Sent" value={data.metrics.emails_sent} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
          {['leads', 'sequences', 'prospect', 'agents', 'objections'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-violet-600 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {error && (
          <div className="text-sm text-red-400/80 bg-red-400/10 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'leads' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['', 'Company', 'Email', 'Score', 'Tier', 'Sequence', 'Date'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {(data?.leads ?? []).map(lead => {
                        const seq = sequenceByEmail[lead.email];
                        const isExpanded = expandedLead === lead.id;
                        return (
                          <React.Fragment key={lead.id}>
                            <tr className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-3 py-3 w-8">
                                {lead.score_factors && (
                                  <button
                                    onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                                    className="text-white/30 hover:text-white/60 transition-colors text-xs"
                                  >
                                    {isExpanded ? '▾' : '▸'}
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3 text-white/80 font-medium">
                                {lead.company_name ?? '—'}
                              </td>
                              <td className="px-4 py-3 text-white/50 text-xs">{lead.email}</td>
                              <td className="px-4 py-3">
                                <span className={`font-semibold ${TIER_COLOR[lead.vip_tier] ?? 'text-white/50'}`}>
                                  {lead.vip_score ?? '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full bg-white/[0.05] ${TIER_COLOR[lead.vip_tier] ?? 'text-white/40'}`}>
                                  {lead.vip_tier ?? '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {seq ? (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[seq.status] ?? 'bg-white/[0.05] text-white/40'}`}>
                                    {seq.status}
                                  </span>
                                ) : (
                                  <span className="text-xs text-white/20">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-white/30 text-xs">
                                {lead.created_at
                                  ? new Date(lead.created_at).toLocaleDateString()
                                  : '—'}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-white/[0.015]">
                                <td colSpan={7} className="border-b border-white/[0.04]">
                                  <ScoreBreakdown
                                    score_factors={lead.score_factors}
                                    vip_score={lead.vip_score}
                                    vip_tier={lead.vip_tier}
                                    rationale={lead.score_rationale}
                                  />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {(data?.leads ?? []).length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-white/25 text-sm">
                            No leads yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'sequences' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['Company', 'Email', 'Score', 'Step', 'Status', 'Next Send', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {(data?.sequences ?? []).map(seq => (
                        <tr key={seq.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-white/80 font-medium">
                            {seq.company_name ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-white/50 text-xs">{seq.email}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${TIER_COLOR[seq.vip_tier] ?? 'text-white/50'}`}>
                              {seq.vip_score ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/50">{seq.step ?? 0}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[seq.status] ?? 'bg-white/[0.05] text-white/40'}`}>
                              {seq.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/30 text-xs">
                            {seq.next_send_at
                              ? new Date(seq.next_send_at).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {seq.status === 'active' && (
                              <div className="flex items-center gap-1.5">
                                {[
                                  { action: 'send_now', label: 'Send Now', style: 'text-emerald-400/80 hover:text-emerald-400' },
                                  { action: 'skip', label: 'Skip', style: 'text-white/30 hover:text-white/60' },
                                  { action: 'mark_won', label: 'Won', style: 'text-violet-400/80 hover:text-violet-400' },
                                  { action: 'mark_lost', label: 'Lost', style: 'text-red-400/60 hover:text-red-400' },
                                ].map(({ action, label, style }) => (
                                  <button
                                    key={action}
                                    onClick={() => handleAction(seq.id, action)}
                                    disabled={actionLoading === seq.id + action}
                                    className={`text-xs transition-colors disabled:opacity-40 ${style}`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(data?.sequences ?? []).length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-white/25 text-sm">
                            No sequences yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'prospect' && (
              <ProspectRunner pin={pin} />
            )}

            {tab === 'agents' && (
              <AgentFleet pin={pin} />
            )}

            {tab === 'objections' && (
              <ObjectionHandler pin={pin} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
