import { useEffect, useRef } from 'react';
import {
  DatabaseZap, ShieldCheck, BrainCircuit, Sparkles,
  CheckCircle2, ArrowRight, PhoneCall, Star, Radar,
  Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   CORE FEATURE MOCKUPS (unchanged)
───────────────────────────────────────────────────────────────────────── */
function EnrichmentMockup() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0f14] font-mono text-[11px] leading-relaxed overflow-hidden mt-4">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <span className="text-white/20 text-[10px] ml-1">apollo_response.json</span>
      </div>
      <div className="p-3 space-y-0.5">
        <p><span className="text-white/25">{'{'}</span></p>
        <p className="pl-3"><span className="text-blue-400/80">"title"</span><span className="text-white/25">: </span><span className="text-emerald-400/80">"VP of Revenue Operations"</span><span className="text-white/25">,</span></p>
        <p className="pl-3"><span className="text-blue-400/80">"seniority"</span><span className="text-white/25">: </span><span className="text-emerald-400/80">"vp"</span><span className="text-white/25">,</span></p>
        <p className="pl-3"><span className="text-blue-400/80">"organization"</span><span className="text-white/25">: {'{'}</span></p>
        <p className="pl-6"><span className="text-blue-400/80">"name"</span><span className="text-white/25">: </span><span className="text-emerald-400/80">"Acme Corp"</span><span className="text-white/25">,</span></p>
        <p className="pl-6"><span className="text-blue-400/80">"estimated_num_employees"</span><span className="text-white/25">: </span><span className="text-violet-400/80">280</span><span className="text-white/25">,</span></p>
        <p className="pl-6"><span className="text-blue-400/80">"estimated_annual_revenue"</span><span className="text-white/25">: </span><span className="text-violet-400/80">18000000</span><span className="text-white/25">,</span></p>
        <p className="pl-6"><span className="text-blue-400/80">"latest_funding_stage"</span><span className="text-white/25">: </span><span className="text-emerald-400/80">"Series A"</span></p>
        <p className="pl-3"><span className="text-white/25">{'}'}</span></p>
        <p><span className="text-white/25">{'}'}</span></p>
      </div>
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/[0.07] px-3 py-2">
        <CheckCircle2 size={13} className="text-violet-400 shrink-0" />
        <span className="text-[10px] text-violet-300/80 font-medium">VIP Score computed → <strong className="text-violet-300">94 / 100</strong></span>
      </div>
    </div>
  );
}

function NullSafeMockup() {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0d0f14] font-mono text-[11px] overflow-hidden mt-3">
      <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
        <span className="text-white/25 text-[10px]">null_safe_defaults.js</span>
      </div>
      <div className="p-3 space-y-0.5">
        <p><span className="text-white/30">const </span><span className="text-blue-400/80">e</span><span className="text-white/30"> = $json.enrichment?.organization </span><span className="text-white/30">|| </span><span className="text-white/50">{'{}'}</span><span className="text-white/30">;</span></p>
        <p className="mt-1"><span className="text-amber-400/80">estimated_num_employees</span><span className="text-white/30">:</span></p>
        <p className="pl-3 text-emerald-400/70">e.estimated_num_employees <span className="text-white/30">??</span> <span className="text-violet-400/80">0</span></p>
        <p className="mt-2 text-[10px] text-white/20">// Apollo returns null on ~30% of private cos.</p>
        <p className="text-[10px] text-white/20">// Without this: VIP leads silently dropped</p>
      </div>
    </div>
  );
}

function AIEmailMockup() {
  return (
    <div className="rounded-lg border border-fuchsia-500/15 bg-fuchsia-500/[0.04] p-3 mt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <BrainCircuit size={12} className="text-fuchsia-400" />
        <span className="text-[10px] font-semibold text-fuchsia-400/80 tracking-wide uppercase">GPT-4o Draft</span>
      </div>
      <p className="text-[11px] text-white/50 leading-relaxed italic">
        "Sarah, scaling RevOps past $18M ARR typically means stitching Salesforce and HubSpot
        data together manually at month-end — our platform eliminates that in 48 hours.
        Would a 15-minute call work this week?"
      </p>
      <div className="flex items-center gap-1 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500/60" />
        <span className="text-[10px] text-white/30">3 sentences · Hyper-personalized · In 1.4s</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   GRAND SLAM MOCKUPS
───────────────────────────────────────────────────────────────────────── */

/* iMessage-style missed-call text-back */
function iMessageMockup() {
  return (
    <div className="mt-4 rounded-2xl bg-[#0d0f14] border border-white/[0.06] overflow-hidden">
      {/* Phone status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#111318]">
        <span className="text-[10px] font-semibold text-white/50">9:41 AM</span>
        <span className="text-[10px] font-semibold text-white/40 tracking-tight">Messages</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-sm border border-white/30 relative">
            <div className="absolute inset-0.5 right-0.5 bg-white/60 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Contact bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">JD</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-white/80">John Davidson</p>
          <p className="text-[9px] text-white/35">+1 (404) 555-0182</p>
        </div>
      </div>

      {/* Bubbles */}
      <div className="p-3 space-y-2.5">
        {/* Inbound — missed call */}
        <div className="flex items-end gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <PhoneCall size={9} className="text-white/40" />
          </div>
          <div className="rounded-2xl rounded-bl-sm bg-white/[0.08] border border-white/[0.06] px-3 py-2 max-w-[70%]">
            <div className="flex items-center gap-1.5">
              <PhoneCall size={10} className="text-red-400" />
              <p className="text-[11px] text-white/60 font-medium">Missed Call</p>
            </div>
            <p className="text-[9px] text-white/30 mt-0.5">Tap to call back</p>
          </div>
        </div>

        {/* Outbound — automated reply */}
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-amber-500 to-orange-500 px-3 py-2 max-w-[78%]">
            <p className="text-[11px] text-white font-medium leading-snug">
              Hey! Sorry we missed your call. How can we help you today? 😊
            </p>
          </div>
        </div>

        {/* Sent indicator */}
        <div className="flex justify-end">
          <p className="text-[9px] text-white/25">Delivered · Automated · 0s after missed call</p>
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-white/[0.04] bg-[#111318]">
        <div className="flex-1 rounded-full bg-white/[0.05] border border-white/[0.06] px-3 py-1.5">
          <span className="text-[11px] text-white/20">iMessage</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-amber-500/80 flex items-center justify-center">
          <ArrowRight size={10} className="text-white" />
        </div>
      </div>
    </div>
  );
}

/* Google Review card mockup */
function ReviewMockup() {
  return (
    <div className="mt-4 space-y-2.5">
      {/* HubSpot trigger */}
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
        <div className="w-4 h-4 rounded bg-orange-500/80 flex items-center justify-center shrink-0">
          <span className="text-[8px] font-black text-white">H</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/50 truncate">Deal Status → <span className="text-emerald-400 font-semibold">Closed Won</span></p>
        </div>
        <div className="text-[9px] text-white/25 shrink-0">trigger</div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-px h-3 bg-yellow-500/30" />
          <span className="text-[9px] text-white/20">14 days</span>
          <div className="w-px h-3 bg-yellow-500/30" />
          <ArrowRight size={10} className="text-yellow-500/40 rotate-90" />
        </div>
      </div>

      {/* Review card */}
      <div className="rounded-xl border border-yellow-500/15 bg-[#0d0f14] p-3.5">
        {/* Google header */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex gap-0.5">
            <span className="text-[11px] font-black text-blue-400">G</span>
            <span className="text-[11px] font-black text-red-400">o</span>
            <span className="text-[11px] font-black text-yellow-400">o</span>
            <span className="text-[11px] font-black text-blue-400">g</span>
            <span className="text-[11px] font-black text-emerald-400">l</span>
            <span className="text-[11px] font-black text-red-400">e</span>
          </div>
          <span className="text-[10px] text-white/25">· Review Request Sent</span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
          ))}
          <span className="text-[10px] text-white/40 ml-1.5 font-semibold">5.0</span>
        </div>

        {/* Reviewer */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-[8px] font-bold text-white">MR</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/70">Marcus R.</p>
            <p className="text-[9px] text-white/30">2 days ago · Google Maps</p>
          </div>
        </div>

        <p className="text-[11px] text-white/50 leading-relaxed italic">
          "Exceptional service. The team responded within minutes and the
          whole process was seamless from start to finish. Highly recommend."
        </p>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-yellow-400/60" />
          <span className="text-[9px] text-white/25">Automated via n8n · Zero manual effort</span>
        </div>
      </div>
    </div>
  );
}

/* Slack competitor intel brief mockup */
function SlackBriefMockup() {
  return (
    <div className="mt-4 rounded-xl border border-blue-500/15 bg-[#1a1d23] overflow-hidden">
      {/* Slack chrome */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04] bg-[#111318]">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-semibold text-white/50"># sales</span>
        <span className="text-[9px] text-white/20 ml-auto">Today</span>
      </div>

      {/* Bot message */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          {/* Bot avatar */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <Radar size={13} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[11px] font-bold text-blue-400">Solen Intel Bot</span>
              <span className="text-[9px] text-white/25">Today at 9:00 AM</span>
            </div>

            {/* Brief card */}
            <div className="rounded-lg border-l-2 border-blue-500/60 bg-white/[0.03] border border-white/[0.05] p-2.5 space-y-1.5">
              <p className="text-[10px] font-bold text-white/70">📊 Daily Competitor Intel Brief</p>

              <div className="space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="text-[9px] text-red-400 shrink-0 mt-px font-bold">▲</span>
                  <div>
                    <p className="text-[10px] font-semibold text-white/60">CompetitorCo launched "AI Scoring"</p>
                    <p className="text-[9px] text-white/30 leading-snug">Their version requires manual setup. Ours is fully automated and live in 48h.</p>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[9px] text-amber-400 shrink-0 mt-px font-bold">●</span>
                  <div>
                    <p className="text-[10px] font-semibold text-white/60">RivalApp raised $12M Series B</p>
                    <p className="text-[9px] text-white/30 leading-snug">Likely targeting enterprise. Counter: emphasize our SMB speed-to-value.</p>
                  </div>
                </div>
              </div>

              <div className="pt-1.5 border-t border-white/[0.05] flex items-center gap-1.5">
                <Zap size={9} className="text-blue-400 shrink-0" />
                <span className="text-[9px] text-white/25">Sourced via Perplexity API · Updated daily 9AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SHARED BENTO CARD
───────────────────────────────────────────────────────────────────────── */
function BentoCard({ children, className = '', large = false }) {
  return (
    <div className={`bento-card relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden ${large ? 'p-7' : 'p-6'} ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function Features() {
  const coreRef  = useRef(null);
  const slamRef  = useRef(null);

  useEffect(() => {
    const targets = [coreRef.current, slamRef.current].filter(Boolean);
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('fade-up-anim'); },
      { threshold: 0.06 }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="product" className="relative bg-[#050507] py-28 px-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-violet-600/5 blur-[100px]" />

      {/* ── CORE FEATURES ──────────────────────────────────────────────── */}
      <div ref={coreRef} className="relative max-w-6xl mx-auto opacity-0">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 mb-5">
            <Sparkles size={11} className="text-violet-400" />
            <span className="text-xs font-semibold text-white/40 tracking-wide uppercase">Core Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Built to Close Deals,{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text' }}>
              Not Just Generate Reports
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto leading-relaxed">
            Every component of the pipeline is engineered around one outcome: getting your reps on the phone with the right person first.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Feature 1 */}
          <BentoCard large className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center glow-blue">
                <DatabaseZap size={17} className="text-blue-400" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-bold text-white/90">Real-Time Lead Enrichment</p>
                <p className="text-[11px] text-white/35">Apollo.io · Clearbit · Hunter.io</p>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-1">
              The moment a free-trial user hits submit, we know their job title, company revenue,
              headcount, funding stage, and full tech stack — before they finish reading your welcome email.
            </p>
            <div className="flex flex-wrap gap-2 my-3">
              {['Company Revenue', 'Headcount', 'Tech Stack', 'Funding Stage', 'LinkedIn URL', 'HQ Location'].map((t) => (
                <span key={t} className="text-[10px] font-medium text-blue-300/70 border border-blue-500/20 bg-blue-500/[0.07] rounded-full px-2.5 py-0.5">{t}</span>
              ))}
            </div>
            <EnrichmentMockup />
          </BentoCard>

          {/* Feature 2 */}
          <BentoCard>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mb-3 glow-amber">
              <ShieldCheck size={17} className="text-amber-400" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-bold text-white/90 mb-1">Null-Safe Data Routing</p>
            <p className="text-[11px] text-white/40 leading-relaxed mb-1">
              Apollo returns <code className="text-amber-400/70 bg-white/[0.05] rounded px-1">null</code> revenue for ~30% of private companies. Our null-safe defaults ensure zero VIP leads are silently dropped.
            </p>
            <ul className="space-y-1.5 my-3">
              {[
                'Personal emails auto-discarded (Gmail/Yahoo)',
                'Fallback to employee count if revenue is null',
                'Enterprise/Mid-Market/Nurture tiered routing',
                'All failures logged to Slack #ops-alerts',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[11px] text-white/40">
                  <CheckCircle2 size={11} className="text-amber-400/70 mt-0.5 shrink-0" />{item}
                </li>
              ))}
            </ul>
            <NullSafeMockup />
          </BentoCard>

          {/* Feature 3 */}
          <BentoCard>
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/25 flex items-center justify-center mb-3">
              <BrainCircuit size={17} className="text-fuchsia-400" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-bold text-white/90 mb-1">GPT-4o VIP Scoring</p>
            <p className="text-[11px] text-white/40 leading-relaxed mb-1">
              Our LLM analyzes enriched data against your ICP and returns a 0–100 score, qualification reasoning, and a hyper-personalized email draft in under 1.5 seconds.
            </p>
            <div className="flex items-center gap-2 my-3">
              {[
                { label: 'VIP',     score: '90–100', color: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10' },
                { label: 'High',    score: '70–89',  color: 'text-violet-400 border-violet-500/30 bg-violet-500/10'    },
                { label: 'Nurture', score: '< 70',   color: 'text-white/40 border-white/[0.1] bg-white/[0.03]'         },
              ].map(({ label, score, color }) => (
                <div key={label} className={`flex-1 rounded-lg border text-center py-2 ${color}`}>
                  <p className="text-[10px] font-bold">{label}</p>
                  <p className="text-[9px] opacity-70">{score}</p>
                </div>
              ))}
            </div>
            <AIEmailMockup />
          </BentoCard>

          {/* Feature 4 */}
          <BentoCard className="md:col-span-2">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-3 glow-emerald">
                  <Sparkles size={17} className="text-emerald-400" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-bold text-white/90 mb-2">Instant, Parallel Delivery</p>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  After scoring, the pipeline fans out simultaneously: a rich Slack Block Kit alert fires to{' '}
                  <code className="text-emerald-400/70 bg-white/[0.05] rounded px-1">#vip-leads</code> and a HubSpot contact is
                  created or updated with VIP score, AI email draft, and tech stack — all in the same execution cycle.
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  {[
                    { label: 'Slack Block Kit alert with green "View in CRM" button', color: 'text-emerald-400' },
                    { label: 'HubSpot contact upsert with custom vip_score property', color: 'text-blue-400'    },
                    { label: 'AI email draft stored directly on the contact record',  color: 'text-violet-400'  },
                    { label: 'Sales rep next-action prompt auto-assigned',            color: 'text-amber-400'   },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-start gap-2">
                      <ArrowRight size={11} className={`${color} mt-0.5 shrink-0`} />
                      <span className="text-[11px] text-white/40">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full sm:w-56 rounded-xl border border-emerald-500/15 bg-[#1a1d23] overflow-hidden shrink-0">
                <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-white/40"># vip-leads</span>
                </div>
                <div className="p-3 border-l-2 border-emerald-500/60">
                  <p className="text-[10px] font-bold text-white/70 mb-0.5">🔥 VIP Lead — Score 94/100</p>
                  <p className="text-[10px] text-white/40">Sarah Chen · VP RevOps</p>
                  <p className="text-[10px] text-white/30">Acme Corp · $18M ARR · 280 emp</p>
                  <div className="mt-2 inline-flex rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5">
                    <span className="text-[9px] font-bold text-emerald-400">📋 View in CRM</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

        </div>
      </div>

      {/* ── GRAND SLAM RETAINER FEATURES ───────────────────────────────── */}
      <div ref={slamRef} className="relative max-w-6xl mx-auto mt-24 opacity-0">

        {/* Section header */}
        <div className="text-center mb-14">
          {/* Connector line from above section */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-8 bg-gradient-to-b from-white/[0.06] to-amber-500/30" />
              <div className="w-2 h-2 rounded-full bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <div className="w-px h-8 bg-gradient-to-b from-amber-500/30 to-white/[0.04]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5 mb-5 backdrop-blur-sm">
            <Star size={11} className="text-amber-400 fill-amber-400/30" />
            <span className="text-xs font-semibold text-amber-300/80 tracking-wide uppercase">
              Grand Slam Retainer Features · $497/mo
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Automations That Run{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-300 bg-clip-text text-transparent"
                  style={{ WebkitBackgroundClip: 'text' }}>
              Your Business Overnight.
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto leading-relaxed">
            These aren't features — they're silent revenue systems. Each one recovers or generates
            money your business was already leaving on the table.
          </p>
        </div>

        {/* Grand Slam bento grid — equal 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1 — Missed Call Text-Back */}
          <BentoCard>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center glow-amber shrink-0">
                <PhoneCall size={17} className="text-amber-400" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-bold text-white/90">AI Missed-Call Text Back</p>
                <p className="text-[10px] text-amber-400/60 font-medium">Instant SMS Recovery</p>
              </div>
            </div>

            <p className="text-[12px] text-white/45 leading-relaxed">
              Never lose a lead to a competitor because you were on the other line. Our system
              instantly engages missed callers via SMS — before they even try someone else.
            </p>

            {iMessageMockup()}

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.06] px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70 shrink-0" />
              <span className="text-[10px] text-amber-300/70 font-medium">
                Avg. 40% of missed calls convert when texted within 60 seconds
              </span>
            </div>
          </BentoCard>

          {/* Card 2 — Google Review Generation */}
          <BentoCard>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center shrink-0"
                   style={{ boxShadow: '0 0 14px rgba(234,179,8,0.35)' }}>
                <Star size={17} className="text-yellow-400 fill-yellow-400/40" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-bold text-white/90">Automated Review Generation</p>
                <p className="text-[10px] text-yellow-400/60 font-medium">Google SEO on Autopilot</p>
              </div>
            </div>

            <p className="text-[12px] text-white/45 leading-relaxed">
              When a deal is marked <span className="text-emerald-400 font-semibold">Closed Won</span> in HubSpot, the system waits 14 days and automatically texts the client for a Google review — skyrocketing your organic local SEO.
            </p>

            {ReviewMockup()}

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-yellow-500/15 bg-yellow-500/[0.05] px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70 shrink-0" />
              <span className="text-[10px] text-yellow-300/70 font-medium">
                Clients avg. +12 new reviews per month with zero manual effort
              </span>
            </div>
          </BentoCard>

          {/* Card 3 — Daily Competitor Intel */}
          <BentoCard>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center glow-blue shrink-0">
                <Radar size={17} className="text-blue-400" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-bold text-white/90">Daily Competitor Intel Briefs</p>
                <p className="text-[10px] text-blue-400/60 font-medium">Perplexity API · Real-Time</p>
              </div>
            </div>

            <p className="text-[12px] text-white/45 leading-relaxed">
              The AI monitors your top 3 competitors using Perplexity API and posts a daily
              summary to your <code className="text-blue-400/70 bg-white/[0.05] rounded px-1">#sales</code> Slack channel — so your reps always know exactly how to pitch against them.
            </p>

            {SlackBriefMockup()}

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-500/15 bg-blue-500/[0.06] px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/70 shrink-0" />
              <span className="text-[10px] text-blue-300/70 font-medium">
                Monitors product pages, G2 reviews, press releases, and job postings
              </span>
            </div>
          </BentoCard>

        </div>

        {/* Bottom value summary strip */}
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <Star size={15} className="text-amber-400 fill-amber-400/30" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/80">All 3 Grand Slam features included in the Revenue Engine tier</p>
              <p className="text-[11px] text-white/35">$497/mo retainer · Fully managed · Zero maintenance required</p>
            </div>
          </div>
          <a href="#pricing"
             className="btn-shine relative overflow-hidden shrink-0 flex items-center gap-2 rounded-xl
               bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500
               px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20
               transition-all duration-200 group whitespace-nowrap">
            See Pricing
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </a>
        </div>

      </div>
    </section>
  );
}
