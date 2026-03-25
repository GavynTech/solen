import { useState } from 'react';

const STATUS_DOT = {
  running: 'bg-emerald-400 animate-pulse',
  idle: 'bg-violet-400',
  standby: 'bg-white/20',
  error: 'bg-red-400',
};

const STATUS_LABEL = {
  running: 'text-emerald-400',
  idle: 'text-violet-400',
  standby: 'text-white/30',
  error: 'text-red-400',
};

const WAR_ROOM_NODES = [
  { label: 'Apollo', sub: 'Prospecting', agentId: null },
  { label: 'Enrichment', sub: 'Pipeline Agent', agentId: 'pipeline' },
  { label: 'Scout', sub: 'Scout Agent', agentId: 'scout' },
  { label: 'Claude Scorer', sub: 'Scorer Agent', agentId: 'scorer' },
  { label: 'Sequence Engine', sub: 'Sequence Agent', agentId: 'sequence' },
  { label: 'Resend', sub: 'Email Delivery', agentId: null },
];

function formatRelativeTime(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const MOCK_AGENTS = [
  { id: 'pipeline', name: 'Pipeline Agent', status: 'running', stat: '142 leads enriched today', last_run: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: 'scout', name: 'Scout Agent', status: 'running', stat: '38 new prospects found', last_run: new Date(Date.now() - 7 * 60000).toISOString() },
  { id: 'scorer', name: 'Scorer Agent', status: 'idle', stat: '97 leads scored this session', last_run: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: 'sequence', name: 'Sequence Agent', status: 'running', stat: '24 sequences active · 6 replied', last_run: new Date(Date.now() - 1 * 60000).toISOString() },
  { id: 'monitor', name: 'Monitor Agent', status: 'standby', stat: 'Watching 14 warm leads', last_run: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'cleanup', name: 'Cleanup Agent', status: 'error', stat: 'Apollo rate limit hit — retrying', last_run: new Date(Date.now() - 45 * 60000).toISOString() },
];

const MOCK_FEED = [
  { timestamp: new Date(Date.now() - 1 * 60000).toISOString(), agent: 'Sequence Agent', action: 'Sent follow-up to marcus@acmelogistics.com — Day 3' },
  { timestamp: new Date(Date.now() - 3 * 60000).toISOString(), agent: 'Pipeline Agent', action: 'Enriched 12 leads from Apollo batch #88' },
  { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), agent: 'Scout Agent', action: 'Found 7 new VP-level prospects in logistics vertical' },
  { timestamp: new Date(Date.now() - 9 * 60000).toISOString(), agent: 'Scorer Agent', action: 'Scored batch of 25 — avg score 74, 4 flagged VIP' },
  { timestamp: new Date(Date.now() - 14 * 60000).toISOString(), agent: 'Sequence Agent', action: 'Reply detected from sarah@fleetops.io — paused sequence' },
  { timestamp: new Date(Date.now() - 22 * 60000).toISOString(), agent: 'Pipeline Agent', action: 'Deduped 3 leads against existing CRM contacts' },
  { timestamp: new Date(Date.now() - 31 * 60000).toISOString(), agent: 'Scout Agent', action: 'Apollo search: "VP Supply Chain" SaaS 50-500 employees — 38 results' },
  { timestamp: new Date(Date.now() - 45 * 60000).toISOString(), agent: 'Cleanup Agent', action: 'Apollo rate limit exceeded — backing off 30 min' },
  { timestamp: new Date(Date.now() - 58 * 60000).toISOString(), agent: 'Scorer Agent', action: 'Re-scored 8 leads after new trigger events detected' },
  { timestamp: new Date(Date.now() - 72 * 60000).toISOString(), agent: 'Sequence Agent', action: 'Enrolled 5 new leads into "Cold Outreach v3" sequence' },
];

export default function AgentFleet({ pin }) {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [feed, setFeed] = useState(MOCK_FEED);
  const [loading, setLoading] = useState(false);

  // TODO: re-enable live fetch when API is ready
  // const fetchStatus = useCallback(async () => { ... }, [pin]);
  // useEffect(() => { fetchStatus(); const i = setInterval(fetchStatus, 10000); return () => clearInterval(i); }, [fetchStatus]);

  const agentStatusMap = Object.fromEntries(agents.map(a => [a.id, a.status]));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Grid */}
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Agent Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div
              key={agent.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{agent.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[agent.status] ?? STATUS_DOT.standby}`} />
                  <span className={`text-xs capitalize ${STATUS_LABEL[agent.status] ?? 'text-white/30'}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-white/50">{agent.stat}</div>
              <div className="text-xs text-white/25">Last run: {formatRelativeTime(agent.last_run)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* War Room */}
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">War Room</h2>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 overflow-x-auto">
          <div className="flex items-center justify-start gap-2 min-w-max mx-auto w-fit">
            {WAR_ROOM_NODES.map((node, i) => {
              const status = node.agentId ? agentStatusMap[node.agentId] : 'idle';
              const isActive = ['running', 'idle'].includes(status);
              return (
                <div key={node.label} className="flex items-center gap-2">
                  <div
                    className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-all ${
                      isActive
                        ? 'border-violet-500/40 bg-violet-500/[0.08] shadow-[0_0_16px_rgba(139,92,246,0.12)]'
                        : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-violet-300' : 'text-white/30'}`}>
                      {node.label}
                    </span>
                    <span className="text-[10px] text-white/20 whitespace-nowrap">{node.sub}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    )}
                  </div>
                  {i < WAR_ROOM_NODES.length - 1 && (
                    <span className="text-white/15 text-sm select-none">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Activity Feed</h2>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
            {feed.length === 0 ? (
              <div className="px-4 py-10 text-center text-white/25 text-sm">No recent activity</div>
            ) : (
              feed.map((event, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-xs text-white/20 shrink-0 w-16">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-violet-400/60 shrink-0">{event.agent}</span>
                  <span className="text-xs text-white/40">{event.action}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
