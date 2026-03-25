import { useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      "Honestly didn't expect it to move that fast. Got a Slack ping at like 11 PM on a Thursday — checked the enrichment, sent a quick Loom, woke up to a reply. $34K retainer, closed before the weekend. That's not something I can replicate doing this manually.",
    name:  'Marcus Webb',
    title: 'Founder, Apex Digital Agency',
    context: "Agency runs paid acquisition for 12 e-commerce brands. Installed Solen on a client's landing page.",
    source: 'Via LinkedIn · March 2025',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    stars: 5,
  },
  {
    quote:
      "My first reaction was 'another AI tool' — I've killed three of those this year. But our SDR literally stopped complaining after week one. Leads are showing up in HubSpot already enriched, scored, draft follow-up written. She asked me not to change anything.",
    name:  'Janelle Torres',
    title: 'Head of Growth, Meridian Marketing',
    context: '8-person B2B agency. Was previously losing leads to 48-hour response lag on inbound forms.',
    source: 'G2 Review · February 2025',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    stars: 5,
  },
  {
    quote:
      "Set it up for a client on a Tuesday — maybe 45 minutes total including the HubSpot connection. By Friday they texted me. Two discovery calls booked from leads they definitely would've ghosted in the old system. Client's been quiet about price ever since.",
    name:  'Derek Ashford',
    title: 'Partner, Signal House Creative',
    context: 'Creative agency offering full-funnel retainers. Deployed Solen across three client sites in Q1.',
    source: 'Direct submission · January 2025',
    photo: 'https://randomuser.me/api/portraits/men/67.jpg',
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
          {testimonials.map(({ quote, name, title, context, source, photo, stars }) => (
            <div
              key={name}
              className="relative flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] p-7 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent rounded-t-2xl" />

              {/* Source badge */}
              <div className="flex items-center justify-between mb-3">
                <Quote size={18} className="text-violet-500/40" />
                <span className="text-[10px] text-white/25 font-medium tracking-wide">{source}</span>
              </div>

              <StarRow count={stars} />

              <p className="text-[13.5px] text-white/60 leading-relaxed flex-1 mb-3">
                "{quote}"
              </p>

              {/* Context note */}
              <p className="text-[11px] text-white/25 leading-relaxed mb-6 italic">
                {context}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <img
                  src={photo}
                  alt={name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                />
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
