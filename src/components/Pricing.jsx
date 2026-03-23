import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2, Minus, ArrowRight, Zap, Star, Crown,
  Sparkles, ShieldCheck, Database, BrainCircuit,
  Bell, PhoneCall, BarChart3, MessageSquare,
  Newspaper, Users, ChevronDown, TrendingUp,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   PLAN DATA
───────────────────────────────────────────────────────────────────────── */
const plans = [
  {
    id:       'core',
    icon:     Zap,
    name:     'Core Routing',
    tag:      'Monthly Add-On',
    tagline:  'Essential automation for agencies that want clean data in their CRM from day one.',
    price:    '$297',
    period:   '/mo',
    cta:      'Get Core Routing',
    accent:   'blue',
    features: [
      { icon: Database,     label: 'Basic CRM data routing from your website',        in: true  },
      { icon: ShieldCheck,  label: 'Advanced spam filtration (auto-drops @gmail.com)', in: true  },
      { icon: MessageSquare,label: 'Standard email support',                           in: true  },
      { icon: Database,     label: 'Apollo.io real-time lead enrichment',              in: false },
      { icon: BrainCircuit, label: 'GPT-4o VIP scoring & email drafting',             in: false },
      { icon: Bell,         label: 'Instant Slack alerts for high-value leads',        in: false },
      { icon: PhoneCall,    label: 'Missed call text-back automation',                 in: false },
      { icon: Newspaper,    label: 'Daily competitor intel briefs',                    in: false },
    ],
  },
  {
    id:          'revenue',
    icon:        Star,
    name:        'The Revenue Engine',
    tag:         'Monthly Add-On',
    tagline:     'The full AI sales layer. Enriches leads, scores them, drafts outreach, and pings your team — automatically.',
    price:       '$497',
    period:      '/mo',
    cta:         'Build My Revenue Engine',
    accent:      'violet',
    recommended: true,
    features: [
      { icon: Zap,          label: 'Everything in Core Routing',                       in: true },
      { icon: Database,     label: 'Apollo.io real-time lead enrichment & profiling',  in: true },
      { icon: BrainCircuit, label: 'GPT-4o VIP lead scoring & email drafting',        in: true },
      { icon: Bell,         label: 'Instant Slack alerts for high-value leads',        in: true },
      { icon: PhoneCall,    label: 'Missed call text-back automation',                 in: true },
      { icon: BarChart3,    label: 'Monthly AI prompt optimization',                   in: true },
      { icon: Newspaper,    label: 'Daily competitor intel briefs',                    in: false },
      { icon: Users,        label: 'Dedicated Slack Connect support channel',          in: false },
    ],
  },
  {
    id:       'enterprise',
    icon:     Crown,
    name:     'Enterprise RevOps',
    tag:      'Custom Monthly',
    tagline:  'A fully autonomous revenue operations layer for agencies managing high-volume, high-stakes client pipelines.',
    price:    'Custom',
    period:   '',
    cta:      'Book a Discovery Call',
    accent:   'amber',
    features: [
      { icon: Star,         label: 'Everything in The Revenue Engine',                 in: true },
      { icon: Sparkles,     label: 'Automated Google post-sale review generation',     in: true },
      { icon: Newspaper,    label: 'Daily competitor intel briefs via Perplexity AI',  in: true },
      { icon: Users,        label: 'Dedicated Slack Connect support channel',          in: true },
      { icon: TrendingUp,   label: 'Segment behavioral intent scoring',                in: true },
      { icon: BrainCircuit, label: 'Custom ICP scoring model trained on your data',   in: true },
      { icon: BarChart3,    label: 'Weekly AI system audit & prompt re-tuning',        in: true },
      { icon: ShieldCheck,  label: 'Priority SLA: 99.5% uptime · <2h incident response', in: true },
    ],
  },
];

const faqs = [
  {
    q: 'What exactly is a "Monthly Add-On"?',
    a: 'Solen is a proprietary software layer your agency installs on top of a client\'s new website. The monthly add-on covers all API usage (Apollo.io, OpenAI, Slack), system monitoring, and our ongoing AI optimization work. There\'s no hardware or hosting for you to manage.',
  },
  {
    q: 'Do my clients need any technical knowledge?',
    a: 'None. Your client only sees the outputs — a Slack ping when a VIP lead signs up, a CRM contact auto-created, and an AI-drafted email ready to send. Everything else runs invisibly in the background.',
  },
  {
    q: 'Can I white-label Solen for my agency?',
    a: 'Yes. Enterprise RevOps includes white-label reporting and a dedicated Slack Connect channel where your agency appears as the primary contact. Your clients never need to know the underlying tooling.',
  },
  {
    q: 'How quickly is the add-on live after signup?',
    a: 'Core Routing: 48–72 hours. Revenue Engine: 5–7 business days including prompt calibration. Enterprise: 2–3 weeks including custom ICP model training and full workflow testing.',
  },
  {
    q: 'What happens if I want to cancel?',
    a: 'Cancel anytime on 30 days\' notice. All workflow files and documentation are yours — we hand everything over so your team or another developer can maintain it independently.',
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   ACCENT STYLE MAP
───────────────────────────────────────────────────────────────────────── */
const A = {
  blue: {
    icon:    'bg-blue-500/15 border-blue-500/30 text-blue-400',
    tag:     'bg-blue-500/10 border-blue-500/20 text-blue-300',
    price:   'text-blue-300',
    check:   'text-blue-400',
    cardBg:  'border-blue-500/[0.18] from-blue-500/[0.06]',
    btn:     'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 hover:shadow-blue-500/40',
    divider: 'via-blue-500/20',
  },
  violet: {
    icon:    'bg-violet-500/15 border-violet-500/30 text-violet-400',
    tag:     'bg-violet-500/10 border-violet-500/25 text-violet-300',
    price:   'text-violet-300',
    check:   'text-violet-400',
    cardBg:  'border-violet-500/30 from-violet-500/[0.08]',
    btn:     'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/30 hover:shadow-violet-500/50',
    divider: 'via-violet-500/25',
  },
  amber: {
    icon:    'bg-amber-500/15 border-amber-500/30 text-amber-400',
    tag:     'bg-amber-500/10 border-amber-500/20 text-amber-300',
    price:   'text-amber-300',
    check:   'text-amber-400',
    cardBg:  'border-amber-500/[0.18] from-amber-500/[0.05]',
    btn:     'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/40',
    divider: 'via-amber-500/20',
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   FEATURE ROW
───────────────────────────────────────────────────────────────────────── */
function FeatureRow({ icon: Icon, label, included, checkClass }) {
  return (
    <li className="flex items-start gap-2.5">
      {included
        ? <CheckCircle2 size={14} className={`${checkClass} shrink-0 mt-px`} />
        : <Minus        size={14} className="text-white/20 shrink-0 mt-px" />}
      <span className={`text-[12.5px] leading-snug ${included ? 'text-white/65' : 'text-white/45'}`}>
        {label}
      </span>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PLAN CARD
───────────────────────────────────────────────────────────────────────── */
function PlanCard({ plan }) {
  const s    = A[plan.accent];
  const Icon = plan.icon;

  return (
    <div className={`
      bento-card relative flex flex-col rounded-2xl border
      bg-gradient-to-b ${s.cardBg} to-transparent
      overflow-hidden
      transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
      ${plan.recommended
        ? 'recommended-glow z-10 shadow-2xl shadow-violet-500/10'
        : 'shadow-lg shadow-black/40'}
    `}>
      {/* Top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Recommended pill — sits on top edge */}
      {plan.recommended && (
        <div className="absolute -top-px inset-x-0 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-b-xl border border-t-0 border-violet-500/40 bg-violet-500/20 backdrop-blur-sm px-4 py-1">
            <Sparkles size={10} className="text-violet-300" />
            <span className="text-[10px] font-bold tracking-widest text-violet-300 uppercase">Most Popular</span>
          </div>
        </div>
      )}

      <div className={`flex flex-col flex-1 p-7 ${plan.recommended ? 'pt-10' : ''}`}>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${s.icon}`}>
            <Icon size={19} strokeWidth={1.8} />
          </div>
          <div>
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase mb-1 ${s.tag}`}>
              {plan.tag}
            </div>
            <h3 className="text-sm font-bold text-white/95 leading-tight">{plan.name}</h3>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-[12.5px] text-white/45 leading-relaxed mb-6">{plan.tagline}</p>

        {/* Price block */}
        <div className={`rounded-xl border border-white/[0.06] bg-black/20 px-5 py-4 mb-6 text-center bg-gradient-to-b from-white/[0.03] to-transparent`}>
          {plan.price === 'Custom' ? (
            <>
              <p className={`text-2xl font-bold ${s.price}`}>Custom Pricing</p>
              <p className="text-[11px] text-white/30 mt-1">Scoped to your client volume & stack</p>
            </>
          ) : (
            <>
              <div className="flex items-end justify-center gap-1">
                <span className={`text-[40px] font-bold leading-none tabular-nums ${s.price}`}>{plan.price}</span>
                <span className="text-sm text-white/35 font-medium mb-1.5">{plan.period}</span>
              </div>
              <p className="text-[11px] text-white/25 mt-1.5">per client · billed monthly · cancel anytime</p>
            </>
          )}
        </div>

        {/* Divider */}
        <div className={`h-px bg-gradient-to-r from-transparent ${s.divider} to-transparent mb-5`} />

        {/* Feature list */}
        <ul className="space-y-2.5 flex-1 mb-7">
          {plan.features.map((f) => (
            <FeatureRow key={f.label} {...f} included={f.in} checkClass={s.check} />
          ))}
        </ul>

        {/* CTA */}
        <button
          type="button"
          className={`btn-shine relative overflow-hidden w-full flex items-center justify-center gap-2
            rounded-xl px-6 py-3.5 text-sm font-semibold text-white
            shadow-lg transition-all duration-200 group ${s.btn}`}
        >
          <span>{plan.cta}</span>
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-150" />
        </button>

        <p className="text-center text-[10.5px] text-white/20 mt-2.5">
          {plan.id === 'enterprise'
            ? 'No commitment · 30-min scoping call'
            : '30-day satisfaction guarantee · Cancel anytime'}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FAQ ACCORDION ITEM
───────────────────────────────────────────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.05] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm font-semibold text-white/70 group-hover:text-white/95 transition-colors duration-150">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`text-white/30 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-[13px] text-white/45 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function Pricing() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add('fade-up-anim'); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="pricing" className="relative bg-[#050507] py-28 px-6 overflow-hidden">

      {/* Section divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-violet-700/[0.06] blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-amber-600/[0.03] blur-[100px]" />
      </div>

      <div ref={ref} className="relative max-w-6xl mx-auto opacity-0">

        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Zap size={11} className="text-violet-400" />
            <span className="text-xs font-semibold text-violet-300/80 tracking-wide uppercase">
              Monthly Software Add-On
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.1]">
            Plug In Once.{' '}
            <br className="hidden md:block" />
            <span
              className="bg-gradient-to-r from-violet-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              Close More, Every Month.
            </span>
          </h2>

          <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Solen is a proprietary AI layer your agency installs directly into a client's
            website. One monthly add-on. Zero servers to manage. Revenue-generating from week one.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {[
              '14,200+ Leads Enriched',
              '$2.4M Pipeline Created',
              'Cancel Anytime',
              'No Setup Fees',
            ].map((label) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-white/40 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pricing cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
        </div>

        {/* ── ROI callout ────────────────────────────────────────────── */}
        <div className="mt-10 relative rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.05] to-transparent backdrop-blur-sm p-6 flex flex-col sm:flex-row items-center gap-5 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0 glow-emerald">
            <TrendingUp size={20} className="text-emerald-400" strokeWidth={1.8} />
          </div>

          <div className="text-center sm:text-left flex-1">
            <p className="text-sm font-bold text-white/90 mb-1">
              Our clients close an average of 1.3 additional deals per month from VIP alerts alone.
            </p>
            <p className="text-xs text-white/40 leading-relaxed">
              At a typical B2B deal size of $10–50K, a single recovered lead covers 6+ months of
              the add-on. The system keeps running — the cost doesn't scale with your close rate.
            </p>
          </div>

          <a
            href="#"
            className="btn-shine relative overflow-hidden shrink-0 flex items-center gap-2 rounded-xl
              bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
              px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20
              transition-all duration-200 group whitespace-nowrap"
          >
            See Case Studies
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </a>
        </div>

        {/* ── "Included in every plan" mini grid ─────────────────────── */}
        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-7">
          <p className="text-[11px] font-bold tracking-widest text-white/25 uppercase text-center mb-6">
            Included in every tier
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ShieldCheck,  label: 'Spam & bot filtration',          color: 'text-violet-400' },
              { icon: Zap,          label: 'Sub-3s pipeline execution',       color: 'text-blue-400'   },
              { icon: MessageSquare,label: 'Full workflow documentation',      color: 'text-indigo-400' },
              { icon: Users,        label: 'Onboarding & team walkthrough',   color: 'text-emerald-400'},
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="bento-card flex flex-col items-center gap-2.5 text-center rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                <div className={`w-8 h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] flex items-center justify-center ${color}`}>
                  <Icon size={15} strokeWidth={1.8} />
                </div>
                <span className="text-[11.5px] text-white/50 font-medium leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold tracking-widest text-white/25 uppercase mb-2">FAQ</p>
            <h3 className="text-2xl font-bold text-white/80">Questions We Always Get</h3>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm px-6">
            {faqs.map((f) => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>

        {/* ── Bottom ghost CTA ────────────────────────────────────────── */}
        <div className="mt-14 text-center">
          <p className="text-white/30 text-sm mb-4">Not sure which tier fits your clients?</p>
          <a
            href="#"
            className="btn-shine relative overflow-hidden inline-flex items-center gap-2 rounded-full
              border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20
              px-8 py-3 text-sm font-semibold text-white/75 hover:text-white
              backdrop-blur-sm transition-all duration-200 group"
          >
            Book a Free 20-Minute Strategy Call
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </a>
          <p className="text-white/20 text-[11px] mt-3">
            No pitch. We'll tell you exactly which add-on fits your agency's current client base.
          </p>
        </div>

      </div>
    </section>
  );
}
