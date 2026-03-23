import { useState, useEffect, useRef } from 'react';
import {
  Loader2, ArrowRight, Zap, BarChart3, Shield,
  Sparkles, CheckCircle2, AlertCircle, ChevronRight,
  Building2, TrendingUp, User,
} from 'lucide-react';

const N8N_WEBHOOK_URL = 'https://your-n8n-domain.com/webhook/trial-signup';

function domainToCompany(email) {
  const domain = (email.split('@')[1] || '').split('.')[0];
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

function SlackNotif({ notif, exiting }) {
  const accentMap = {
    webhook:  'border-indigo-500  bg-indigo-500/10',
    enrich:   'border-blue-500    bg-blue-500/10',
    score:    'border-violet-500  bg-violet-500/10',
    delivery: 'border-emerald-500 bg-emerald-500/10',
  };
  const iconMap = {
    webhook:  'text-indigo-400',
    enrich:   'text-blue-400',
    score:    'text-violet-400',
    delivery: 'text-emerald-400',
  };

  return (
    <div className={`${exiting ? 'notif-exit' : 'notif-enter'} w-[320px] rounded-xl border border-white/[0.08] bg-[#1a1d23]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden`}>
      <div className={`flex gap-3 p-3.5 border-l-[3px] ${accentMap[notif.type] ?? 'border-white/20 bg-white/5'}`}>
        <div className="shrink-0 mt-0.5">
          <div className={`w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center ${iconMap[notif.type] ?? 'text-white/60'}`}>
            {notif.icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap size={8} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-semibold text-white/40 tracking-wide uppercase">Solen Pipeline</span>
            <span className="text-[10px] text-white/20 ml-auto shrink-0">just now</span>
          </div>
          <p className="text-xs font-semibold text-white/90 leading-snug truncate">{notif.title}</p>
          <p className="text-[11px] text-white/50 leading-snug mt-0.5 truncate">{notif.body}</p>
          {notif.sub && <p className="text-[10px] text-white/30 mt-0.5 truncate">{notif.sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [email, setEmail]           = useState('');
  const [status, setStatus]         = useState('idle');
  const [errorMsg, setErrorMsg]     = useState('');
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });
  const [notifs, setNotifs]         = useState([]);
  const [exitingAll, setExitingAll] = useState(false);
  const timersRef                   = useRef([]);

  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const addTimer = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const triggerMockPipeline = (submittedEmail) => {
    const company   = domainToCompany(submittedEmail);
    const emailUser = submittedEmail.split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const stages = [
      { id: 1, type: 'webhook',  delay: 600,  icon: <Zap size={14} />,          title: '🔗 Webhook Received',          body: submittedEmail,                        sub: 'Pipeline triggered · n8n processing'           },
      { id: 2, type: 'enrich',   delay: 2100, icon: <Building2 size={14} />,     title: '🔍 Apollo Enrichment Complete', body: `${company} · Series A · ~$18M ARR`,   sub: '280 employees · San Francisco, CA'             },
      { id: 3, type: 'score',    delay: 3800, icon: <TrendingUp size={14} />,    title: '🔥 VIP Score: 94/100',          body: `${emailUser} · VP of Revenue Ops`,    sub: 'Tier: VIP · Immediate outreach required'       },
      { id: 4, type: 'delivery', delay: 5400, icon: <CheckCircle2 size={14} />,  title: '✅ Alert Fired → #vip-leads',   body: 'HubSpot contact created · Draft ready', sub: 'Assigned to sales rep · Est. deal: $48K'     },
    ];

    stages.forEach(({ delay, id, ...rest }) => {
      addTimer(() => setNotifs((prev) => [...prev, { id, ...rest }]), delay);
    });
    addTimer(() => setStatus('success'), 5000);
    addTimer(() => {
      setExitingAll(true);
      addTimer(() => { setNotifs([]); setExitingAll(false); }, 400);
    }, 10500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    triggerMockPipeline(email);
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:     email.toLowerCase().trim(),
          event:     'free_trial_signup',
          source:    'hero_cta_form',
          timestamp: new Date().toISOString(),
          utmSource: new URLSearchParams(window.location.search).get('utm_source') ?? 'direct',
        }),
      });
    } catch (_) { /* demo runs regardless */ }
  };

  return (
    <section className="relative min-h-screen bg-[#050507] text-white overflow-hidden flex flex-col">

      {/* Cursor glow */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.055) 0%, transparent 70%)`,
      }} />

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-60 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.08] blur-[150px]" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[350px] rounded-full bg-purple-800/[0.08] blur-[110px]" />
      </div>

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.16]" style={{
        backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)',
        backgroundSize:  '36px 36px',
      }} />

      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent z-10" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Solen<span className="text-violet-400">.</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-white/40">
          {['Product', 'How It Works', 'Pricing', 'Case Studies'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
               className="hover:text-white/80 transition-colors duration-150">{item}</a>
          ))}
        </div>

        <a href="#pricing" className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white/90 border border-white/[0.08] hover:border-white/20 rounded-full px-4 py-1.5 transition-all duration-200 bg-white/[0.02] hover:bg-white/[0.05]">
          View Pricing <ChevronRight size={12} />
        </a>
      </nav>

      {/* Hero body */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-4 py-1.5 mb-8 backdrop-blur-sm">
          <Sparkles size={11} className="text-violet-400" />
          <span className="text-xs font-medium text-violet-300/90 tracking-wide">
            AI-Powered Revenue Operations · Built on n8n
          </span>
        </div>

        <h1 className="max-w-4xl text-5xl md:text-6xl lg:text-[72px] font-bold tracking-tight leading-[1.06] mb-5">
          <span className="text-white">Your Competitors Are</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: 'text' }}>
            Calling Your Best Leads First.
          </span>
        </h1>

        <p className="max-w-2xl text-base md:text-lg text-white/40 leading-relaxed mb-10 font-light">
          Solen is a done-for-you automated business system that enriches every
          free-trial signup in real-time, scores them with GPT&#8209;4o, drafts
          personalized outreach, and pings your sales team — all within 3 seconds of signup.
        </p>

        {/* Form card */}
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1 backdrop-blur-xl shadow-2xl shadow-black/50">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
            <div className="relative p-6">
              {status === 'success' ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-white/90">Pipeline triggered. Watch the demo →</p>
                  <p className="text-xs text-white/40 text-center leading-relaxed">
                    Check the bottom-right of your screen. That's your sales team's Slack channel, in real-time.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <label className="text-left text-[11px] font-semibold text-white/35 tracking-widest uppercase">
                    Work Email
                  </label>
                  <input
                    type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={status === 'loading'}
                    className={`w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white
                      placeholder-white/[0.18] outline-none transition-all duration-200
                      focus:bg-white/[0.06] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${status === 'error' ? 'border-red-500/40' : 'border-white/[0.07] hover:border-white/[0.13]'}`}
                  />
                  {status === 'error' && errorMsg && (
                    <div className="flex items-center gap-2 text-xs text-red-400/90">
                      <AlertCircle size={12} /> {errorMsg}
                    </div>
                  )}
                  <button type="submit" disabled={status === 'loading' || !email}
                    className="relative overflow-hidden btn-shine w-full flex items-center justify-center gap-2
                      rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600
                      hover:from-violet-500 hover:to-indigo-500
                      disabled:from-violet-900 disabled:to-indigo-900 disabled:cursor-not-allowed
                      px-6 py-3 text-sm font-semibold text-white
                      shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35
                      transition-all duration-200 group">
                    {status === 'loading' ? (
                      <><Loader2 size={15} className="animate-spin" /><span>Triggering Pipeline...</span></>
                    ) : (
                      <><span>See It In Action — Free</span><ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-150" /></>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-white/20 mt-0.5">
                    Submit any email · Watch the live demo · No card required
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
          {[
            { icon: Zap,       label: 'Sub-3s Pipeline'       },
            { icon: BarChart3, label: 'GPT-4o VIP Scoring'    },
            { icon: Shield,    label: 'Null-Safe Data Routing' },
            { icon: User,      label: 'Done-For-You Setup'    },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 backdrop-blur-sm">
              <Icon size={11} className="text-violet-400" />
              <span className="text-xs text-white/40 font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 mt-14 pt-8 border-t border-white/[0.04] justify-center">
          {[
            { value: '14,200+', label: 'Leads Enriched'   },
            { value: '$2.4M',   label: 'Pipeline Created' },
            { value: '<3s',     label: 'Avg. Enrich Time' },
            { value: '99.1%',   label: 'Uptime SLA'       },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-lg font-bold text-white/90 tabular-nums">{value}</span>
              <span className="text-[11px] text-white/25 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Slack notification stack */}
      {notifs.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 items-end pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-[#1a1d23]/90 border border-white/[0.08] px-3 py-1 backdrop-blur-xl mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-white/50 tracking-wide uppercase">Live Pipeline Demo</span>
          </div>
          {notifs.map((n) => <SlackNotif key={n.id} notif={n} exiting={exitingAll} />)}
        </div>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050507] to-transparent pointer-events-none z-10" />
    </section>
  );
}
