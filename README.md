# VeyraAI — Autonomous Revenue Operations Engine

[![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen?style=flat-square)](https://github.com)
[![Stack](https://img.shields.io/badge/Frontend-React_%2B_Vite_%2B_Tailwind-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Orchestration](https://img.shields.io/badge/Orchestration-n8n-EA4B71?style=flat-square)](https://n8n.io)
[![Database](https://img.shields.io/badge/Data_Lake-PostgreSQL_%2F_Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![ML](https://img.shields.io/badge/ML_Roadmap-XGBoost_%7C_HMM_%7C_Embeddings-FF6F00?style=flat-square)](https://xgboost.readthedocs.io)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](LICENSE)

---

## Table of Contents

1. [Project Vision & Overview](#1-project-vision--overview)
2. [Current Architecture — V1 API Engine](#2-current-architecture--v1-api-engine)
   - [Frontend Layer](#frontend-layer)
   - [Backend Orchestration](#backend-orchestration)
   - [Core Pipeline](#core-pipeline)
   - [Null-Safe Default Routing](#null-safe-default-routing)
3. [Data Infrastructure & Collection — The Moat](#3-data-infrastructure--collection--the-moat)
4. [Machine Learning & Modeling Roadmap — V2](#4-machine-learning--modeling-roadmap--v2)
   - [Phase A — Predictive Lead Scoring](#phase-a--predictive-lead-scoring-xgboost--gradient-boosting)
   - [Phase B — Semantic Vector Embeddings](#phase-b--semantic-vector-embeddings-nlp)
   - [Phase C — Behavioral Intent Modeling](#phase-c--behavioral-intent-modeling-hidden-markov-models)
5. [Local Setup & Development](#5-local-setup--development)

---

## 1. Project Vision & Overview

**VeyraAI** (internally referenced as *FlowOps*) is a fully automated, AI-native **Revenue Operations Engine** engineered to replace the traditional Sales Development Representative (SDR) function end-to-end.

The moment an inbound lead or free-trial signup enters the system, VeyraAI autonomously executes a multi-step enrichment, scoring, and outreach pipeline in under 90 seconds — a workflow that previously consumed 45–60 minutes of manual SDR time per lead.

### Core Value Proposition

| Traditional SDR Workflow | VeyraAI Automated Pipeline |
|---|---|
| Manual lead research (30–45 min) | Apollo.io firmographic enrichment (< 2s) |
| Google/LinkedIn web research (15–30 min) | Perplexity live web scraping (< 5s) |
| Heuristic gut-feel scoring | Probabilistic ML classifier (V2 target) |
| Generic templated outreach | GPT-4o hyper-personalized email draft |
| Manual CRM data entry | Autonomous HubSpot CRM upsert |
| Inconsistent follow-up | Deterministic Slack alert routing |

VeyraAI is not a CRM add-on. It is a **proprietary decisioning engine** that converts raw intent signals into closed revenue — without human intervention in the loop.

---

## 2. Current Architecture — V1 API Engine

The V1 architecture is deliberately designed with two simultaneous objectives: (1) deliver immediate, production-grade automation value, and (2) operate as a **structured data-collection instrument** that builds the proprietary dataset powering V2 machine learning.

### Frontend Layer

The client-facing application is a high-fidelity **React (Vite) + Tailwind CSS** single-page application engineered to interactively demonstrate and sell the backend pipeline logic in real time.

**Technical Characteristics:**

- **Bundler:** Vite — sub-300ms hot module replacement (HMR) for accelerated iteration cycles
- **Styling:** Tailwind CSS with a custom design token system enforcing brand consistency at the utility class level
- **Component Architecture:** Modular, atomic-design component tree structured for stateless rendering and predictable prop-drilling patterns
- **Visualization Layer:** Interactive pipeline diagrams, live enrichment status indicators, and animated data-flow representations that map directly to the backend processing stages
- **State Management:** React Context API scoped to enrichment session state, eliminating unnecessary global re-renders

The frontend is not a passive dashboard. It is a **living sales tool** — every UI interaction is instrumented with anonymous clickstream telemetry that feeds directly into the Phase C behavioral intent modeling pipeline.

### Backend Orchestration

All backend workflow logic is governed by **n8n** — a self-hostable, node-based workflow automation engine that provides deterministic execution graphs over complex, multi-provider API orchestration.

n8n was selected over alternatives (Zapier, Make) for three non-negotiable architectural reasons:

1. **Self-Hosted Execution Environment** — Full control over compute, data residency, and API secret management with zero third-party data leakage
2. **Custom Code Nodes** — Native JavaScript execution within workflow nodes allows implementation of custom algorithms (e.g., Null-Safe Default Routing) without leaving the orchestration layer
3. **Structured JSON Workflow Blueprints** — Entire pipeline logic is serialized into version-controlled JSON, enabling reproducible deployments and complete audit trails

### Core Pipeline

The V1 pipeline executes as a directed acyclic graph (DAG) of API calls triggered by a single webhook event:

```
[Webhook Trigger]
       │
       ▼
[Apollo.io Enrichment]         ← Firmographic telemetry: revenue, headcount,
       │                          industry SIC code, tech stack, funding stage
       ▼
[Perplexity API Scrape]        ← Live web/news context: recent press, hiring
       │                          signals, leadership changes, product launches
       ▼
[Null-Safe Default Router]     ← Custom algorithm: validates payload integrity,
       │                          injects canonical defaults for null fields
       ▼
[GPT-4o Decisioning Engine]    ← Synthesizes enriched context, outputs:
       │                          (a) VIP probability score [0.0 – 1.0]
       │                          (b) Hyper-personalized cold email draft
       │                          (c) Structured JSON decision object
       │
  ┌────┴────┐
  ▼         ▼
[Slack    [HubSpot
 Block     CRM
 Kit]      Upsert]
```

**Apollo.io Firmographic Payload (representative schema):**

```json
{
  "company_name": "Acme Corp",
  "annual_revenue": 4200000,
  "employee_count": 87,
  "industry": "SaaS / B2B Software",
  "tech_stack": ["Salesforce", "HubSpot", "Segment", "Intercom"],
  "funding_stage": "Series A",
  "headquarters": "Austin, TX",
  "linkedin_url": "https://linkedin.com/company/acme-corp"
}
```

**GPT-4o Structured Decision Output:**

```json
{
  "vip_score": 0.84,
  "vip_tier": "TIER_1",
  "score_rationale": "Series A SaaS, Salesforce/HubSpot stack indicates existing GTM budget. Recent hiring signals (3 AE postings) confirm active sales expansion. 87-person headcount in ideal ICP range.",
  "outreach_draft": {
    "subject": "The revenue gap between your AEs and your pipeline",
    "body": "..."
  },
  "recommended_action": "IMMEDIATE_OUTREACH",
  "confidence_interval": [0.79, 0.91]
}
```

### Null-Safe Default Routing

Enterprise-grade pipeline resilience requires deterministic behavior under partial data conditions. The **Null-Safe Default Routing** algorithm is a custom middleware layer, implemented as a native n8n Code Node, that intercepts all upstream API payloads before they reach the GPT-4o decisioning stage.

**The Problem:** Apollo.io returns incomplete firmographic data for ~23% of records — particularly for private companies where revenue is not publicly disclosed. A raw `null` passed to a GPT-4o prompt produces degraded, hallucination-prone output or outright pipeline failure.

**The Solution:** A field-level validation and canonical default injection system:

```javascript
// n8n Code Node — Null-Safe Default Router
const payload = $input.first().json;

const CANONICAL_DEFAULTS = {
  annual_revenue:  "Not publicly disclosed",
  employee_count:  "Estimated 1–50",
  funding_stage:   "Bootstrapped / Unknown",
  tech_stack:      [],
  industry:        "Software / Technology",
};

const safeEnrich = (data, defaults) =>
  Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [
      key,
      (data[key] !== null && data[key] !== undefined && data[key] !== "")
        ? data[key]
        : fallback
    ])
  );

return [{ json: { ...payload, ...safeEnrich(payload, CANONICAL_DEFAULTS) } }];
```

This ensures 100% payload completeness entering the decisioning stage, with null fields replaced by semantically meaningful defaults that preserve GPT-4o prompt coherence without fabricating factual claims.

---

## 3. Data Infrastructure & Collection — The Moat

V1 is not merely an automation product. At the infrastructure layer, its primary architectural mandate is to function as a **high-fidelity, structured data-collection engine** that accumulates the proprietary training corpus required for V2 machine learning.

Every execution of the V1 pipeline writes a complete, structured record to a **PostgreSQL data lake hosted on Supabase**, capturing the full telemetry chain:

```
Apollo Payload  →  Perplexity Scrape  →  GPT-4o Output  →  CRM Outcome
     │                    │                    │                  │
     └────────────────────┴────────────────────┴──────────────────┘
                                    │
                          [Supabase PostgreSQL]
                          Table: enrichment_events
```

**Core Schema — `enrichment_events` table:**

```sql
CREATE TABLE enrichment_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Firmographic Telemetry (Apollo)
    company_name        TEXT,
    annual_revenue      BIGINT,
    employee_count      INT,
    industry            TEXT,
    tech_stack          JSONB,
    funding_stage       TEXT,

    -- Contextual Intelligence (Perplexity)
    perplexity_summary  TEXT,
    intent_signals      JSONB,

    -- Decisioning Output (GPT-4o)
    vip_score           FLOAT,
    vip_tier            TEXT,
    outreach_subject    TEXT,
    outreach_body       TEXT,
    score_rationale     TEXT,

    -- Ground Truth Labels (HubSpot CRM)
    hubspot_deal_id     TEXT,
    deal_stage          TEXT,          -- 'closed_won' | 'closed_lost' | 'in_progress'
    deal_value          BIGINT,
    closed_at           TIMESTAMPTZ,

    -- Pipeline Metadata
    null_fields_patched TEXT[],        -- Tracks which fields hit the default router
    pipeline_latency_ms INT
);
```

### Why This Is the Moat

The `enrichment_events` table creates something no competitor can purchase on the open market: **a labeled dataset that directly correlates firmographic telemetry to real-world "Closed-Won" CRM outcomes** in our specific customer segment.

As V1 processes leads, every `vip_score` produced by GPT-4o is eventually reconciled against a binary ground truth label (`closed_won: true/false`) when HubSpot CRM updates. This creates a continuously growing supervised learning dataset with the following properties:

- **Feature Vector:** Apollo firmographics + Perplexity intent signals + tech stack composition
- **Label:** Binary closed-won outcome + deal value (for regression targets)
- **Volume Growth:** Compound — every new free-trial signup enriches the dataset automatically

Once this dataset reaches statistical sufficiency (target: ~2,000 labeled records), the V2 ML pipeline activates.

---

## 4. Machine Learning & Modeling Roadmap — V2

V2 represents the transition from **rule-based heuristic automation** to **probabilistic, self-improving intelligence.** The three phases below are sequential and interdependent — each phase's output becomes a feature input to the next.

---

### Phase A — Predictive Lead Scoring (XGBoost / Gradient Boosting)

**Objective:** Replace GPT-4o's heuristic VIP scoring with a trained probabilistic ML classifier that outputs a statistically calibrated probability: `P(closed_won | firmographic_features)`.

**The Limitation of V1 Scoring:**

GPT-4o's scoring is powerful but non-deterministic. The same input prompt can return `vip_score: 0.82` on one invocation and `0.79` on the next. More critically, GPT-4o cannot learn from historical outcomes — it has no feedback loop. Its scores are linguistic approximations, not statistical probabilities.

**The XGBoost Solution:**

We are training an **XGBoost gradient-boosted decision tree ensemble** on the labeled `enrichment_events` dataset. XGBoost was selected for this workload based on:

1. **Tabular Data Performance** — Gradient boosting consistently outperforms deep neural networks on structured tabular feature sets of this dimensionality
2. **Interpretability** — SHAP (SHapley Additive exPlanations) values provide per-prediction feature attribution, enabling sales teams to understand *why* a lead was scored high
3. **Calibration** — Platt scaling post-processing on the classifier's output sigmoid ensures `predict_proba()` outputs are true statistical probabilities, not uncalibrated scores

**Feature Engineering Pipeline:**

```python
# Feature matrix construction from Supabase enrichment_events
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import StratifiedKFold
from sklearn.calibration import CalibratedClassifierCV

FEATURE_COLS = [
    "annual_revenue",           # Continuous
    "employee_count",           # Continuous
    "funding_stage_encoded",    # Ordinal: Bootstrapped < Seed < Series A < Series B+
    "industry_encoded",         # One-hot: SaaS, FinTech, HealthTech, etc.
    "tech_stack_hubspot",       # Binary: HubSpot in stack
    "tech_stack_salesforce",    # Binary: Salesforce in stack
    "tech_stack_segment",       # Binary: Segment in stack (high-intent signal)
    "has_intent_signal",        # Binary: Perplexity detected hiring/expansion signals
    "null_fields_count",        # Proxy for data quality / company obscurity
]

TARGET_COL = "closed_won"       # Binary label from HubSpot CRM reconciliation

# Stratified K-Fold ensures class balance across all validation splits
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

model = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    use_label_encoder=False,
    eval_metric="logloss",
    early_stopping_rounds=50,
)

# Platt scaling for probability calibration
calibrated_model = CalibratedClassifierCV(model, method="sigmoid", cv=cv)
```

**Target Performance Metrics:**
- AUC-ROC ≥ 0.82 on held-out test set
- Brier Score ≤ 0.15 (calibration quality)
- SHAP feature attribution reports delivered per prediction via API response

---

### Phase B — Semantic Vector Embeddings (NLP)

**Objective:** Move beyond template-based email generation to a mathematically grounded **retrieval-augmented outreach system** that matches incoming lead profiles against a vector database of historically high-performing sales emails using cosine similarity in high-dimensional embedding space.

**The Architecture:**

Every sales email that contributes to a `closed_won` outcome in HubSpot is retroactively embedded and stored in a **pgvector**-extended PostgreSQL table (Supabase supports this natively). Incoming lead profiles are embedded at runtime and the system retrieves the most semantically proximate historical success patterns.

**Embedding & Similarity Pipeline:**

```python
import openai
import numpy as np
from supabase import create_client

# Step 1: Embed the incoming lead's enriched profile
def embed_lead_profile(profile: dict) -> list[float]:
    profile_text = f"""
    Company: {profile['company_name']}
    Industry: {profile['industry']}
    Stage: {profile['funding_stage']}
    Stack: {', '.join(profile['tech_stack'])}
    Context: {profile['perplexity_summary']}
    """
    response = openai.embeddings.create(
        model="text-embedding-3-large",   # 3072-dimensional embedding space
        input=profile_text
    )
    return response.data[0].embedding

# Step 2: Retrieve top-K nearest historical winning emails via pgvector
def retrieve_similar_emails(query_embedding: list[float], top_k: int = 3):
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    result = supabase.rpc("match_winning_emails", {
        "query_embedding": query_embedding,
        "match_threshold": 0.78,
        "match_count": top_k
    }).execute()
    return result.data

# Cosine Similarity = (A · B) / (||A|| × ||B||)
# Where A = query_embedding, B = stored email embedding
# Perfect match = 1.0, orthogonal = 0.0, opposite = -1.0
```

**The pgvector SQL function powering retrieval:**

```sql
CREATE OR REPLACE FUNCTION match_winning_emails (
    query_embedding  vector(3072),
    match_threshold  float,
    match_count      int
)
RETURNS TABLE (
    id              uuid,
    email_subject   text,
    email_body      text,
    deal_value      bigint,
    similarity      float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        id,
        email_subject,
        email_body,
        deal_value,
        1 - (embedding <=> query_embedding) AS similarity
    FROM winning_emails
    WHERE 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;
```

The retrieved emails are injected into the GPT-4o system prompt as **few-shot exemplars** — providing the model with mathematically proven tonal and structural patterns rather than relying on zero-shot generation. This is not prompt engineering; it is **mathematically grounded retrieval-augmented generation (RAG)** anchored to empirical revenue outcomes.

---

### Phase C — Behavioral Intent Modeling (Hidden Markov Models)

**Objective:** Ingest anonymous frontend clickstream telemetry to construct a **probabilistic state machine** that predicts, in real time, the exact moment a free-trial user transitions from passive browsing behavior to active buying intent — triggering autonomous outreach at the optimal conversion window.

**The Core Insight:**

A user's navigation path through a SaaS product is not random. It follows **latent behavioral states** — Exploration, Evaluation, Intent, Conversion — that are not directly observable but whose transitions leave measurable fingerprints in clickstream sequences. Hidden Markov Models (HMMs) are the canonical mathematical framework for inferring these latent states from observable event sequences.

**Formal Model Definition:**

A discrete-time HMM is defined by the tuple `λ = (N, M, A, B, π)`:

- `N` = number of hidden states (e.g., 4: Browsing, Evaluating, Intending, Converting)
- `M` = number of observable event symbols (page views, feature interactions, pricing page hits)
- `A` = **State Transition Matrix** — `A[i][j] = P(state_j at t+1 | state_i at t)`
- `B` = **Emission Matrix** — `B[i][k] = P(observable_k | hidden_state_i)`
- `π` = **Initial State Distribution** — `π[i] = P(state_i at t=0)`

**Clickstream Event Taxonomy:**

```python
# Observable event alphabet (M symbols)
CLICKSTREAM_EVENTS = {
    "E01": "homepage_view",
    "E02": "features_page_view",
    "E03": "pricing_page_view",          # Strong Evaluation signal
    "E04": "pricing_page_view_repeat",   # Strong Intent signal
    "E05": "integration_docs_view",      # Deep Evaluation signal
    "E06": "dashboard_feature_interact", # Product-qualified lead signal
    "E07": "upgrade_cta_hover",          # Intent signal
    "E08": "upgrade_cta_click",          # Conversion precursor
    "E09": "checkout_page_view",         # Conversion state entry
}
```

**Training the HMM — Baum-Welch Algorithm:**

The model parameters `(A, B, π)` are learned from historical clickstream sequences of users who eventually converted (`closed_won = true`) using the **Baum-Welch Expectation-Maximization algorithm**:

```python
from hmmlearn import hmm
import numpy as np

# Training corpus: sequences of observable event IDs from converted users
X_train = build_clickstream_sequences(
    supabase_client,
    filter_outcome="closed_won"
)

model = hmm.CategoricalHMM(
    n_components=4,          # 4 latent behavioral states
    n_iter=200,              # EM iterations
    tol=1e-4,
    algorithm="viterbi"      # Viterbi decoding for most-likely state path
)

model.fit(X_train)

# At inference time: given a live user's current clickstream sequence,
# decode the most probable current hidden state
def predict_intent_state(session_events: list[str]) -> dict:
    obs_sequence = encode_events(session_events)
    log_prob, state_sequence = model.decode(obs_sequence, algorithm="viterbi")
    current_state = state_sequence[-1]

    return {
        "current_state": STATE_LABELS[current_state],
        "log_likelihood": log_prob,
        "trigger_outreach": current_state >= INTENT_STATE_THRESHOLD,
    }
```

**Triggering Logic:**

When `predict_intent_state()` returns `trigger_outreach: true`, the system fires a real-time webhook back into the n8n pipeline — initiating a personalized outreach sequence at the mathematically optimal conversion window, before the user has explicitly expressed intent through any traditional conversion event.

This is **predictive conversion** — acting on latent behavioral probability rather than reactive form submissions.

---

## 5. Local Setup & Development

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x
- n8n (self-hosted via Docker or `npx n8n`)
- Supabase project (free tier sufficient for development)

### Frontend (React + Vite)

```bash
# Clone the repository
git clone https://github.com/your-org/veyra-ai.git
cd veyra-ai

# Install dependencies
npm install

# Start development server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build
```

### n8n Workflow Blueprints

The entire V1 pipeline logic is serialized as version-controlled JSON blueprints located in `/n8n-blueprints/`.

```bash
# Start a local n8n instance
npx n8n start
# Access the n8n editor at: http://localhost:5678
```

**To import a workflow blueprint:**
1. Open the n8n editor at `http://localhost:5678`
2. Navigate to **Workflows → Import from File**
3. Select the target `.json` file from `/n8n-blueprints/`
4. Configure the following credential slots under **Settings → Credentials**:
   - `Apollo.io API Key`
   - `Perplexity API Key`
   - `OpenAI API Key` (GPT-4o access required)
   - `HubSpot Private App Token`
   - `Slack Bot OAuth Token`
   - `Supabase Service Role Key`

### Environment Variables (Frontend)

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/your-webhook-id
```

---

## Architecture Decision Log

| Decision | Rationale |
|---|---|
| n8n over Zapier/Make | Self-hosted, custom code nodes, JSON-serializable workflow state |
| Supabase over raw PostgreSQL | Native pgvector support, real-time subscriptions, Row Level Security |
| XGBoost over Neural Network | Superior tabular performance, SHAP interpretability, lower data requirements |
| `text-embedding-3-large` | 3072-dim space maximizes cosine discrimination at tolerable latency cost |
| HMM over LSTM for clickstream | Explicit latent state semantics; interpretable transitions for business logic |
| Vite over CRA | 10–100x faster HMR; native ESM; zero webpack configuration overhead |

---

*VeyraAI — Built to make the SDR role obsolete.*
