-- Solens Initial Schema
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/sdswdrczapcchajvkgzh/editor

-- 1. enrichment_events — full pipeline telemetry per lead
CREATE TABLE IF NOT EXISTS enrichment_events (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email                 text        NOT NULL,
  name                  text,
  source                text,
  utm_source            text,
  company_name          text,
  industry              text,
  employee_count        integer,
  annual_revenue        bigint,
  funding_stage         text,
  tech_stack            text[],
  vip_score             integer,
  vip_tier              text,
  score_rationale       text,
  outreach_subject      text,
  outreach_body         text,
  recommended_action    text,
  null_fields_patched   text[],
  score_factors         jsonb,
  rationale_object      jsonb,
  trigger_events        jsonb,
  personalization_snippet text,
  hubspot_id            text,
  hubspot_status        text,
  slack_sent            boolean,
  pipeline_latency_ms   integer,
  research_summary      text,
  intent_signals        text[],
  created_at            timestamptz DEFAULT now()
);

-- 2. lead_sequences — email campaign state machine (day0 → day3 → day7)
CREATE TABLE IF NOT EXISTS lead_sequences (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email             text        NOT NULL,
  lead_id           uuid        REFERENCES enrichment_events(id),
  company_name      text,
  vip_score         integer,
  vip_tier          text,
  outreach_subject  text,
  outreach_body     text,
  status            text        DEFAULT 'active',  -- active | completed | replied | won | lost | skipped
  step              integer     DEFAULT 0,          -- 0=day0 sent, 1=day3 sent, 2=day7 sent
  day0_sent_at      timestamptz,
  day3_sent_at      timestamptz,
  day7_sent_at      timestamptz,
  next_send_at      timestamptz,
  created_at        timestamptz DEFAULT now()
);

-- Index for the cron query: active sequences past their send time
CREATE INDEX IF NOT EXISTS idx_lead_sequences_due
  ON lead_sequences (status, next_send_at)
  WHERE status = 'active';

-- 3. research_hooks — Firecrawl website scrape cache (domain-level, 7-day TTL)
CREATE TABLE IF NOT EXISTS research_hooks (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text,
  domain       text        UNIQUE NOT NULL,
  hooks        jsonb,
  raw_markdown text,
  scraped_at   timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- 4. prospect_runs — batch prospecting sessions
CREATE TABLE IF NOT EXISTS prospect_runs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  icp        jsonb,
  status     text        DEFAULT 'running',  -- running | completed | failed
  total      integer,
  high_score integer,
  queued     integer,
  created_at timestamptz DEFAULT now()
);

-- 5. prospects — individual leads found during prospect runs
CREATE TABLE IF NOT EXISTS prospects (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id          uuid        REFERENCES prospect_runs(id),
  email           text,
  first_name      text,
  last_name       text,
  title           text,
  company_name    text,
  apollo_data     jsonb,
  enriched        jsonb,
  vip_score       integer,
  vip_tier        text,
  score_rationale text,
  created_at      timestamptz DEFAULT now()
);

-- Verification query — run after migration to confirm all 5 tables exist:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('enrichment_events','lead_sequences','research_hooks','prospect_runs','prospects')
-- ORDER BY table_name;
