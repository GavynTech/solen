import { useEffect, useRef } from 'react';
import { Zap, DatabaseZap, Search, BrainCircuit, Workflow, CheckCircle2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   NODE DATA  (5 nodes — scraper injected at position 3)
───────────────────────────────────────────────────────────────────────── */
const nodes = [
  {
    id:        'trigger',
    step:      '01',
    icon:      Zap,
    glow:      'glow-blue',
    iconColor: 'text-blue-400',
    iconBg:    'bg-blue-500/15 border-blue-500/30',
    accent:    'border-blue-500/20 from-blue-500/[0.07]',
    badgeColor:'bg-blue-500/10 border-blue-500/20 text-blue-300',
    label:     'Webhook Trigger',
    sublabel:  'Free Trial Signup',
    latency:   '~5ms',
    stats: [
      { key: 'event',     val: '"free_trial_signup"' },
      { key: 'source',    val: '"pricing_page"'      },
      { key: 'timestamp', val: '"2026-03-23T…"'      },
    ],
    status: { color: 'bg-blue-400', label: 'Listening' },
  },
  {
    id:        'enrich',
    step:      '02',
    icon:      DatabaseZap,
    glow:      'glow-amber',
    iconColor: 'text-amber-400',
    iconBg:    'bg-amber-500/15 border-amber-500/30',
    accent:    'border-amber-500/20 from-amber-500/[0.06]',
    badgeColor:'bg-amber-500/10 border-amber-500/20 text-amber-300',
    label:     'Apollo.io API',
    sublabel:  'Lead Enrichment',
    latency:   '~380ms',
    stats: [
      { key: 'employees', val: '280'         },
      { key: 'revenue',   val: '$18,000,000' },
      { key: 'stage',     val: '"Series A"'  },
    ],
    status: { color: 'bg-amber-400', label: 'Enriching' },
  },
  {
    id:        'scraper',
    step:      '03',
    icon:      Search,
    glow:      'glow-fuchsia',
    iconColor: 'text-fuchsia-400',
    iconBg:    'bg-fuchsia-500/15 border-fuchsia-500/30',
    accent:    'border-fuchsia-500/20 from-fuchsia-500/[0.06]',
    badgeColor:'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300',
    label:     'Active Web Scraping',
    sublabel:  'Perplexity / Tavily API',
    latency:   '~900ms',
    stats: [
      { key: 'target',  val: '"acmecorp.io"'   },
      { key: 'sources', val: '["web","news"]'  },
      { key: 'context', val: '"Series A news"' },
    ],
    status: { color: 'bg-fuchsia-400', label: 'Scraping' },
  },
  {
    id:        'ai',
    step:      '04',
    icon:      BrainCircuit,
    glow:      'glow-violet',
    iconColor: 'text-violet-400',
    iconBg:    'bg-violet-500/15 border-violet-500/30',
    accent:    'border-violet-500/20 from-violet-500/[0.07]',
    badgeColor:'bg-violet-500/10 border-violet-500/20 text-violet-300',
    label:     'GPT-4o Engine',
    sublabel:  'Scoring & Drafting',
    latency:   '~1.4s',
    stats: [
      { key: 'model', val: '"gpt-4o"' },
      { key: 'score', val: '94 / 100' },
      { key: 'tier',  val: '"VIP"'    },
    ],
    status: { color: 'bg-violet-400', label: 'Analyzing' },
  },
  {
    id:        'action',
    step:      '05',
    icon:      Workflow,
    glow:      'glow-emerald',
    iconColor: 'text-emerald-400',
    iconBg:    'bg-emerald-500/15 border-emerald-500/30',
    accent:    'border-emerald-500/20 from-emerald-500/[0.06]',
    badgeColor:'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    label:     'Slack + HubSpot',
    sublabel:  'Parallel Routing',
    latency:   '<50ms',
    stats: [
      { key: 'slack',    val: '"#vip-leads"'  },
      { key: 'hubspot',  val: '"upserted"'    },
      { key: 'assigned', val: '"sales_rep_1"' },
    ],
    status: { color: 'bg-emerald-400', label: 'Delivered' },
  },
];

/* 4 connectors between 5 nodes — delays stagger left → right */
const dotDelays = [
  '',
  'flow-dot-delay-1',
  'flow-dot-delay-2',
  'flow-dot-delay-3',
];

/* ─────────────────────────────────────────────────────────────────────────
   NODE CARD
───────────────────────────────────────────────────────────────────────── */
function NodeCard({ node }) {
  const Icon = node.icon;

  return (
    <div className={`
      bento-card relative flex-1 min-w-[160px] max-w-[220px]
      rounded-2xl border bg-gradient-to-b ${node.accent} to-transparent
      bg-[#0d0f14] backdrop-blur-sm overflow-hidden
    `}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${node.iconBg} ${node.glow}`}>
            <Icon size={19} strokeWidth={1.7} className={node.iconColor} />
          </div>
          <div className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-widest ${node.badgeColor}`}>
            {node.step}
          </div>
        </div>

        {/* Labels */}
        <p className="text-[12px] font-bold text-white/90 leading-tight">{node.label}</p>
        <p className={`text-[10px] font-semibold mb-3 mt-0.5 ${node.iconColor} opacity-70`}>{node.sublabel}</p>

        {/* Mini JSON */}
        <div className="rounded-lg bg-black/40 border border-white/[0.05] font-mono text-[10px] p-2.5 space-y-0.5 mb-3">
          <p className="text-white/20">{'{'}</p>
          {node.stats.map(({ key, val }) => (
            <p key={key} className="pl-2">
              <span className="text-blue-400/70">"{key}"</span>
              <span className="text-white/20">: </span>
              <span className={val.startsWith('"') || val.startsWith('[') ? 'text-emerald-400/70' : 'text-violet-400/70'}>
                {val}
              </span>
            </p>
          ))}
          <p className="text-white/20">{'}'}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${node.status.color} animate-pulse`} />
            <span className="text-[10px] text-white/35 font-medium">{node.status.label}</span>
          </div>
          <div className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5">
            <span className="text-[10px] text-white/35 font-mono">{node.latency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CONNECTORS
───────────────────────────────────────────────────────────────────────── */
function HConnector({ dotDelay }) {
  return (
    <div className="hidden lg:flex items-center self-center flex-1 min-w-[24px] max-w-[48px] px-0.5">
      <div className="relative w-full" style={{ height: '2px' }}>
        <div className="flow-line absolute inset-0" />
        <div className={`flow-dot ${dotDelay}`} />
      </div>
    </div>
  );
}

function VConnector() {
  return (
    <div className="flex lg:hidden justify-center items-center" style={{ height: '40px' }}>
      <div className="relative" style={{ width: '2px', height: '100%' }}>
        <div className="flow-line-v absolute inset-0" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function ArchitectureMap() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('fade-up-anim'); },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="relative bg-[#050507] py-28 px-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-indigo-600/[0.05] blur-[140px]" />
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto opacity-0">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 mb-5 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/40 tracking-wide uppercase">How It Works</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            The Revenue Engine{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent"
                  style={{ WebkitBackgroundClip: 'text' }}>
              Architecture
            </span>
          </h2>

          <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed">
            From the moment a lead signs up, five automated stages fire in sequence —
            enriching, scraping live context, scoring, and routing them to your team in under 3 seconds.
          </p>
        </div>

        {/* Pipeline */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0">
          {nodes.map((node, i) => (
            <div key={node.id} className="contents">
              <NodeCard node={node} />
              {i < nodes.length - 1 && (
                <>
                  <HConnector dotDelay={dotDelays[i]} />
                  <VConnector />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Timing bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-[11px] text-white/25 font-medium tracking-wide uppercase">Pipeline execution time</p>
          <div className="flex items-end gap-1.5">
            {[
              { w: 'w-2',   h: 'h-2',   color: 'bg-blue-500',    label: '5ms'   },
              { w: 'w-10',  h: 'h-3',   color: 'bg-amber-500',   label: '380ms' },
              { w: 'w-16',  h: 'h-4',   color: 'bg-fuchsia-500', label: '900ms' },
              { w: 'w-20',  h: 'h-6',   color: 'bg-violet-500',  label: '1.4s'  },
              { w: 'w-3',   h: 'h-2.5', color: 'bg-emerald-500', label: '<50ms' },
            ].map(({ w, h, color, label }, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-white/25 font-mono">{label}</span>
                <div className={`${w} ${h} rounded-sm ${color} opacity-70`} />
              </div>
            ))}
            <span className="text-xs font-bold text-white/50 ml-2 mb-0.5">≈ 3.7s total</span>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Webhook',       value: '~5ms',   color: 'text-blue-400'    },
            { label: 'Enrichment',    value: '380ms',  color: 'text-amber-400'   },
            { label: 'Web Scraping',  value: '~900ms', color: 'text-fuchsia-400' },
            { label: 'GPT-4o',        value: '~1.4s',  color: 'text-violet-400'  },
            { label: 'Delivery',      value: '<50ms',  color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 flex items-center justify-between gap-2">
              <span className="text-[11px] text-white/35 font-medium">{label}</span>
              <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Footer callout */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.05]" />
          <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
            <CheckCircle2 size={11} className="text-emerald-400" />
            <span className="text-[11px] text-white/35 font-medium">
              Entire pipeline orchestrated in n8n · Zero custom servers
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.05]" />
        </div>

      </div>
    </section>
  );
}
