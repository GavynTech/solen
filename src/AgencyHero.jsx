import { useState, useEffect } from 'react';
import {
  Loader2,
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const N8N_WEBHOOK_URL = 'https://your-n8n-domain.com/webhook/trial-signup';

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function AgencyHero() {
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Subtle radial glow that follows cursor
  useEffect(() => {
    const handler = (e) =>
      setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const isValidEmail = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const payload = {
      email:     email.toLowerCase().trim(),
      event:     'free_trial_signup',
      source:    'hero_cta_form',
      timestamp: new Date().toISOString(),
      utmSource: new URLSearchParams(window.location.search).get('utm_source') ?? 'direct',
    };

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050507] text-white overflow-hidden flex flex-col">

      {/* ── Cursor glow ─────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px,
            rgba(99,102,241,0.06) 0%,
            transparent 70%)`,
        }}
      />

      {/* ── Static ambient gradients ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] rounded-full bg-indigo-500/8 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] rounded-full bg-purple-700/8 blur-[100px]" />
      </div>

      {/* ── Dot grid ─────────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #4f46e5 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── Top gradient line ─────────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent z-10" />

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            Veyra<span className="text-violet-400">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-white/40">
          {['Product', 'Integrations', 'Pricing', 'Docs'].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-white/80 transition-colors duration-150"
            >
              {item}
            </a>
          ))}
        </div>

        <a
          href="#"
          className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white/90 border border-white/[0.08] hover:border-white/20 rounded-full px-4 py-1.5 transition-all duration-200 bg-white/[0.02] hover:bg-white/[0.05]"
        >
          Sign in <ChevronRight size={12} />
        </a>
      </nav>

      {/* ── HERO CONTENT ─────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-4 py-1.5 mb-8 backdrop-blur-sm">
          <Sparkles size={12} className="text-violet-400" />
          <span className="text-xs font-medium text-violet-300/90 tracking-wide">
            Now in Public Beta — 200 seats remaining
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          <span className="text-white">Unlock Revenue</span>
          <br />
          <span
            className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-300 bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: 'text' }}
          >
            Intelligence.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-xl text-base md:text-lg text-white/40 leading-relaxed mb-10 font-light">
          VeyraAI enriches every signup in real-time — scoring leads, drafting
          personalized outreach, and alerting your sales team before your
          competitor even knows they exist.
        </p>

        {/* ── FORM CARD ──────────────────────────────────────────────────────── */}
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 backdrop-blur-xl shadow-2xl shadow-black/60">

            {/* Inner glow on card */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

            <div className="relative p-6">
              {status === 'success' ? (
                // ── SUCCESS STATE ───────────────────────────────────────────
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    You&apos;re on the list.
                  </p>
                  <p className="text-xs text-white/40 text-center leading-relaxed">
                    Our team has been notified. Expect a personalized email
                    within 15 minutes.
                  </p>
                </div>
              ) : (
                // ── FORM STATE ───────────────────────────────────────────────
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <label className="text-left text-xs font-medium text-white/40 tracking-wide uppercase">
                    Work Email
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="you@company.com"
                      autoComplete="email"
                      disabled={status === 'loading'}
                      className={`w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white placeholder-white/20
                        outline-none transition-all duration-200
                        focus:bg-white/[0.06] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${status === 'error'
                          ? 'border-red-500/40 focus:border-red-500/60'
                          : 'border-white/[0.07] hover:border-white/[0.12]'
                        }`}
                    />
                  </div>

                  {/* Error message */}
                  {status === 'error' && errorMsg && (
                    <div className="flex items-center gap-2 text-xs text-red-400/90">
                      <AlertCircle size={12} />
                      {errorMsg}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={status === 'loading' || !email}
                    className="relative w-full flex items-center justify-center gap-2 rounded-xl
                      bg-gradient-to-r from-violet-600 to-indigo-600
                      hover:from-violet-500 hover:to-indigo-500
                      disabled:from-violet-800 disabled:to-indigo-800 disabled:cursor-not-allowed
                      px-6 py-3 text-sm font-semibold text-white
                      shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
                      transition-all duration-200
                      overflow-hidden group"
                  >
                    {/* Button shine sweep */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                    {status === 'loading' ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Securing your spot...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Free Trial</span>
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-150" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-white/20 mt-1">
                    No credit card required · Free 14-day trial · Cancel anytime
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── FEATURE PILLS ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {[
            { icon: Zap,       label: 'Real-time Enrichment' },
            { icon: BarChart3, label: 'VIP Lead Scoring'     },
            { icon: Shield,    label: 'SOC 2 Type II'        },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 backdrop-blur-sm"
            >
              <Icon size={12} className="text-violet-400" />
              <span className="text-xs text-white/40 font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* ── SOCIAL PROOF ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-6 mt-14 pt-8 border-t border-white/[0.04] w-full max-w-sm justify-center">
          {[
            { value: '14K+',  label: 'Leads Enriched'  },
            { value: '$2.4M', label: 'Pipeline Created' },
            { value: '98%',   label: 'Uptime SLA'       },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-lg font-bold text-white/90 tabular-nums">
                {value}
              </span>
              <span className="text-[11px] text-white/25 font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* ── BOTTOM GRADIENT FADE ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050507] to-transparent pointer-events-none z-10" />
    </div>
  );
}
