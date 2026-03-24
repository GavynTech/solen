import { useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      "We closed a $34K retainer within the first week. The VIP Slack alert fired at 11 PM — I followed up before any competitor even saw the form fill. That's the Revenue Engine working exactly as advertised.",
    name:  'Marcus Webb',
    title: 'Founder, Apex Digital Agency',
    stars: 5,
  },
  {
    quote:
      "I was skeptical about another AI tool, but Solen is the first one that actually touches revenue. Our SDR now spends zero time on data entry — every lead arrives in HubSpot enriched, scored, and with a draft email ready to send.",
    name:  'Janelle Torres',
    title: 'Head of Growth, Meridian Marketing',
    stars: 5,
  },
  {
    quote:
      "Installed it on a client's site on a Tuesday. By Friday they had two discovery calls booked from leads they would have ghosted in the old system. The ROI conversation became very easy after that.",
    name:  'Derek Ashford',
    title: 'Partner, Signal House Creative',
    stars: 5,
  },
];

function StarRow({ count }) {
  return (
    <div className="flex items-center gap-0.5 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
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
    <section className="relative bg-[#050507] py-24 px-6 overflow-hidden">
      {/* Section divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-violet-700/[0.05] blur-[160px]" />
      </div>

      <div ref={ref} className="relative max-w-6xl mx-auto opacity-0">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Star size={11} className="text-violet-400" />
            <span className="text-xs font-semibold text-violet-300/80 tracking-wide uppercase">
              Agency Results
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.1]">
            Agencies That{' '}
            <span
              className="bg-gradient-to-r from-violet-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              Closed More.
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto leading-relaxed font-light">
            Real results from agency operators who installed Solen on client websites.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ quote, name, title, stars }) => (
            <div
              key={name}
              className="relative flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] p-7 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent rounded-t-2xl" />
              <Quote size={18} className="text-violet-500/40 mb-3" />
              <StarRow count={stars} />
              <p className="text-[13.5px] text-white/60 leading-relaxed flex-1 mb-6">
                "{quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">{name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/85">{name}</p>
                  <p className="text-[11px] text-white/35">{title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
