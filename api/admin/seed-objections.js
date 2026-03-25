import { createClient } from '@supabase/supabase-js';
import { embedText } from '../_services/rag.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SEED_OBJECTIONS = [
  {
    category: 'competitor',
    objection_text: 'We already use ZoomInfo for our data needs.',
    response_text: "ZoomInfo is great for raw data volume. Where Solens is different is the AI layer on top — we don't just find contacts, we score them by ICP fit and auto-generate personalized outreach. Most teams use us alongside ZoomInfo, not instead of it. Happy to show you how they work together.",
  },
  {
    category: 'competitor',
    objection_text: "We're happy with our current data provider.",
    response_text: "That makes sense — data providers are commoditized now. The question isn't really about data, it's about what happens after you have it. Most teams are sitting on lists and not converting them. Solens is the scoring and activation layer that makes your existing data work harder. 15 minutes to see the ROI math?",
  },
  {
    category: 'competitor',
    objection_text: 'We use Apollo/Outreach/Salesloft already.',
    response_text: "Those are great execution tools. Solens plugs in upstream — we identify which leads are actually worth working and draft the first touch, so your reps only see leads that matter. Think of us as the intelligence layer that tells Outreach/Salesloft who to focus on.",
  },
  {
    category: 'budget',
    objection_text: "We don't have budget for this right now.",
    response_text: "Totally fair — budgets are tight. A couple of thoughts: first, we have a pilot structure that fits into discretionary spend. Second, the ROI case is usually pretty fast — if your ACV is $20K and we help you close one extra deal a quarter, the math works. What would the business case need to look like for it to make sense?",
  },
  {
    category: 'budget',
    objection_text: "It's too expensive for what it does.",
    response_text: "I hear you. Can I ask what you're benchmarking against? Most customers find the value when they look at cost-per-qualified-lead rather than platform cost. If we're helping your team spend 80% less time on qualification, the number usually looks different. Happy to walk through the unit economics.",
  },
  {
    category: 'timing',
    objection_text: "We're not looking to make changes until Q3.",
    response_text: "Perfect timing — that gives us runway to set up properly. Most implementations take 2 weeks, so starting the conversation now means you'd hit Q3 fully operational instead of spending Q3 in onboarding. Worth a 20-minute scoping call so we're ready to move when you are?",
  },
  {
    category: 'timing',
    objection_text: 'We just signed a contract with another vendor.',
    response_text: "Congrats on the new tool — hope it delivers. One thing worth knowing: a lot of our customers run us alongside their existing stack. When that contract comes up for renewal, having our data on how we performed makes the decision easy. Would it make sense to run a small pilot now so you have a real comparison at renewal time?",
  },
  {
    category: 'timing',
    objection_text: "We're in a tool freeze until next quarter.",
    response_text: "Completely understand — tool sprawl is a real problem. What we can do is use this time to get you fully evaluated so you're first in line when the freeze lifts. I can also put together the business case so procurement isn't surprised when it comes up. Sound useful?",
  },
  {
    category: 'authority',
    objection_text: "I'm not the decision maker — you need to talk to our VP of Sales.",
    response_text: "Appreciate the transparency. Two questions: first, would you be open to a brief internal demo so you can decide if it's worth escalating? And second, what would make it easy for you to champion this internally if it looked valuable? I can put together a one-pager designed for VP-level review.",
  },
  {
    category: 'authority',
    objection_text: 'We have a committee process for technology decisions.',
    response_text: "That's common at your stage — makes sense to have governance. Happy to support the process: I can prepare an executive summary, ROI model, and security/compliance overview tailored to your committee format. What's the typical timeline for evaluation and who are the key stakeholders I should address?",
  },
  {
    category: 'need',
    objection_text: "We don't need help with prospecting — we have enough leads.",
    response_text: "That's actually a great problem to have. The challenge most teams in that position face isn't lead volume — it's lead quality and rep time spent on the wrong ones. Solens' scoring layer helps you figure out which of those leads are actually worth pursuing. Are you happy with your current lead-to-meeting conversion rate?",
  },
  {
    category: 'need',
    objection_text: 'Our sales team is already at capacity.',
    response_text: "If your team is at capacity, that's exactly when prioritization matters most. Solens helps them work the right deals instead of all the deals. If we can get them spending 70% of their time on the top 20% of leads, capacity becomes less of a constraint. How are they currently deciding which leads get attention?",
  },
  {
    category: 'trust',
    objection_text: 'How do I know this actually works?',
    response_text: "Fair question — don't take my word for it. Here's what I'd suggest: let's run a 2-week pilot with 50 of your actual leads. You'll see exactly how we score them, compare it to how your team would have prioritized them, and measure conversion on the ones we flagged as VIP. Real data, your leads, no risk.",
  },
  {
    category: 'trust',
    objection_text: "We've tried similar tools before and they didn't deliver.",
    response_text: "I'm sorry to hear that — it's a real trust issue and you're right to be skeptical. Can I ask what specifically didn't work? Most of the time it's one of three things: data quality, no workflow integration, or the scoring was too generic. Knowing which issue you hit would help me show you how we're different — or honestly, tell you if we'd hit the same problem.",
  },
  {
    category: 'process',
    objection_text: 'We need to run an RFP process first.',
    response_text: "Absolutely, happy to participate in an RFP. I can send you our standard security questionnaire responses, pricing structure, and customer references in advance so your team has everything they need. One suggestion: would it help to do a brief demo first so you have context for how to frame the evaluation criteria?",
  },
  {
    category: 'fit',
    objection_text: "We're too small — this seems like an enterprise solution.",
    response_text: "Actually our sweet spot is 50-500 employees — that's where the ROI is clearest because you have enough scale to benefit from automation but not a huge ops team to manage it. What's your current headcount? If you're in that range, you're exactly who we built this for.",
  },
  {
    category: 'fit',
    objection_text: "We're an enterprise — this seems SMB-focused.",
    response_text: "We work across the spectrum, but I want to make sure we're the right fit. Enterprise usually means more complex ICP definitions, higher compliance requirements, and integration with existing stacks. Can you tell me more about your specific situation? If you're a good fit, great — if not, I'll tell you honestly rather than waste your time.",
  },
  {
    category: 'technical',
    objection_text: 'We have a CRM and it does lead scoring already.',
    response_text: "Most CRMs have basic scoring, but it's usually rule-based — activity, form fills, page views. That tells you who's engaging, not who fits your ICP. Solens uses Claude AI to score based on company signals: funding stage, tech stack, hiring trends, revenue estimates. It's a different signal entirely and often surfaces leads your CRM would have missed.",
  },
];

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(CORS_HEADERS).json({ ok: false });
  }

  const { pin } = req.body ?? {};
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).set(CORS_HEADERS).json({ ok: false, error: 'Unauthorized' });
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).set(CORS_HEADERS).json({ ok: false, error: 'Supabase not configured' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key);

  const results = { inserted: 0, errors: [] };

  for (const seed of SEED_OBJECTIONS) {
    try {
      const embedding = await embedText(seed.objection_text);
      const { error } = await supabase.from('objection_playbooks').insert([{
        objection_text: seed.objection_text,
        response_text: seed.response_text,
        category: seed.category,
        embedding,
      }]);
      if (error) {
        results.errors.push(`${seed.objection_text.slice(0, 40)}: ${error.message}`);
      } else {
        results.inserted++;
      }
    } catch (err) {
      results.errors.push(`${seed.objection_text.slice(0, 40)}: ${err.message}`);
    }
  }

  return res.status(200).set(CORS_HEADERS).json({
    ok: true,
    inserted: results.inserted,
    total: SEED_OBJECTIONS.length,
    errors: results.errors,
  });
}
