import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Returns the UUID of the inserted row (awaitable)
export async function logEnrichmentEvent(record) {
  try {
    const supabase = getClient();
    if (!supabase) {
      console.warn('[supabase] missing env vars, skipping log');
      return null;
    }
    const { data, error } = await supabase
      .from('enrichment_events')
      .insert([record])
      .select('id')
      .single();
    if (error) {
      console.error('[supabase] insert error:', error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error('[supabase] error:', err.message);
    return null;
  }
}

export async function createLeadSequence({
  email, lead_id, company_name, vip_score, vip_tier,
  outreach_subject, outreach_body,
}) {
  try {
    const supabase = getClient();
    if (!supabase) return null;

    // Deduplicate: skip if active/pending sequence already exists for this email
    const { data: existing } = await supabase
      .from('lead_sequences')
      .select('id')
      .eq('email', email)
      .in('status', ['pending', 'active'])
      .maybeSingle();

    if (existing) {
      console.log('[supabase] sequence already active for', email);
      return null;
    }

    const next_send_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('lead_sequences')
      .insert([{
        email, lead_id, company_name, vip_score, vip_tier,
        outreach_subject, outreach_body,
        status: 'active',
        step: 0,
        day0_sent_at: new Date().toISOString(),
        next_send_at,
      }])
      .select('id')
      .single();

    if (error) {
      console.error('[supabase] createLeadSequence error:', error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error('[supabase] createLeadSequence error:', err.message);
    return null;
  }
}

export async function getSequencesDue() {
  try {
    const supabase = getClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('lead_sequences')
      .select('*')
      .eq('status', 'active')
      .lte('next_send_at', new Date().toISOString());
    if (error) {
      console.error('[supabase] getSequencesDue error:', error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error('[supabase] getSequencesDue error:', err.message);
    return [];
  }
}

export async function advanceSequence(id, { step, next_send_at, sent_at_field }) {
  try {
    const supabase = getClient();
    if (!supabase) return false;
    const { error } = await supabase
      .from('lead_sequences')
      .update({ step, next_send_at, [sent_at_field]: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('[supabase] advanceSequence error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[supabase] advanceSequence error:', err.message);
    return false;
  }
}

export async function updateSequenceStatus(id, status) {
  try {
    const supabase = getClient();
    if (!supabase) return false;
    const update = { status };
    if (status === 'completed') update.day7_sent_at = new Date().toISOString();
    const { error } = await supabase
      .from('lead_sequences')
      .update(update)
      .eq('id', id);
    if (error) {
      console.error('[supabase] updateSequenceStatus error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[supabase] updateSequenceStatus error:', err.message);
    return false;
  }
}

export async function getLeadsWithSequences() {
  try {
    const supabase = getClient();
    if (!supabase) return { leads: [], sequences: [], metrics: {} };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [leadsResult, sequencesResult] = await Promise.all([
      supabase
        .from('enrichment_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('lead_sequences')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    const leads = leadsResult.data ?? [];
    const sequences = sequencesResult.data ?? [];

    const leads_today = leads.filter(l => new Date(l.created_at) >= todayStart).length;
    const avg_score = leads.length
      ? Math.round(leads.reduce((sum, l) => sum + (l.vip_score ?? 0), 0) / leads.length)
      : 0;
    const sequences_active = sequences.filter(s => s.status === 'active').length;
    const emails_sent = sequences.filter(s =>
      ['active', 'completed', 'replied', 'won'].includes(s.status)
    ).length;

    return {
      leads,
      sequences,
      metrics: { leads_today, avg_score, sequences_active, emails_sent },
    };
  } catch (err) {
    console.error('[supabase] getLeadsWithSequences error:', err.message);
    return { leads: [], sequences: [], metrics: {} };
  }
}

export async function performSequenceAction(sequence_id, action) {
  try {
    const supabase = getClient();
    if (!supabase) return false;

    const statusMap = { skip: 'skipped', mark_won: 'won', mark_lost: 'lost' };

    if (action === 'send_now') {
      const { error } = await supabase
        .from('lead_sequences')
        .update({ next_send_at: new Date().toISOString() })
        .eq('id', sequence_id);
      return !error;
    }

    if (statusMap[action]) {
      const { error } = await supabase
        .from('lead_sequences')
        .update({ status: statusMap[action] })
        .eq('id', sequence_id);
      return !error;
    }

    return false;
  } catch (err) {
    console.error('[supabase] performSequenceAction error:', err.message);
    return false;
  }
}

export async function createProspectRun(icp) {
  try {
    const supabase = getClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('prospect_runs')
      .insert([{ icp, status: 'running' }])
      .select('id')
      .single();
    if (error) {
      console.error('[supabase] createProspectRun error:', error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error('[supabase] createProspectRun error:', err.message);
    return null;
  }
}

export async function updateProspectRun(id, stats) {
  try {
    const supabase = getClient();
    if (!supabase) return false;
    const { error } = await supabase
      .from('prospect_runs')
      .update({ ...stats, status: 'completed' })
      .eq('id', id);
    if (error) {
      console.error('[supabase] updateProspectRun error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[supabase] updateProspectRun error:', err.message);
    return false;
  }
}

export async function upsertResearchHooks({ email, domain, hooks, raw_markdown }) {
  try {
    const supabase = getClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('research_hooks')
      .upsert(
        { email, domain, hooks, raw_markdown, scraped_at: new Date().toISOString() },
        { onConflict: 'domain' }
      )
      .select('id')
      .single();
    if (error) {
      console.error('[supabase] upsertResearchHooks error:', error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error('[supabase] upsertResearchHooks error:', err.message);
    return null;
  }
}

export async function insertProspect(record) {
  try {
    const supabase = getClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('prospects')
      .insert([record])
      .select('id')
      .single();
    if (error) {
      console.error('[supabase] insertProspect error:', error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error('[supabase] insertProspect error:', err.message);
    return null;
  }
}
