#!/usr/bin/env bash
# Solens End-to-End Smoke Test
# Usage: bash scripts/smoke-test.sh [BASE_URL]
# Example (local):  bash scripts/smoke-test.sh http://localhost:3000
# Example (prod):   bash scripts/smoke-test.sh https://solens.vercel.app
#
# Pass a real business email as second arg to use live Apollo enrichment:
# bash scripts/smoke-test.sh https://solens.vercel.app test@stripe.com

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
TEST_EMAIL="${2:-demo@acme.io}"
CRON_SECRET="${CRON_SECRET:-solens-cron-local-dev}"

PASS="✓"
FAIL="✗"

echo ""
echo "=== Solens Smoke Test ==="
echo "Base URL : $BASE_URL"
echo "Test email: $TEST_EMAIL"
echo ""

# ── 1. Pipeline ──────────────────────────────────────────────────────────────
echo "1. POST /api/pipeline ..."
PIPELINE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/pipeline" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"name\":\"Test User\",\"source\":\"smoke_test\"}")

echo "$PIPELINE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PIPELINE_RESPONSE"

PIPELINE_OK=$(echo "$PIPELINE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ok',''))" 2>/dev/null || echo "")
VIP_SCORE=$(echo "$PIPELINE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('score',{}).get('vip_score','?'))" 2>/dev/null || echo "?")
ENRICH_MODE=$(echo "$PIPELINE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('enrichment_mode','?'))" 2>/dev/null || echo "?")
SLACK_SENT=$(echo "$PIPELINE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('slack_sent','?'))" 2>/dev/null || echo "?")

if [ "$PIPELINE_OK" = "True" ]; then
  echo "$PASS  Pipeline: ok=true | vip_score=$VIP_SCORE | mode=$ENRICH_MODE | slack=$SLACK_SENT"
else
  echo "$FAIL  Pipeline returned ok=false or errored"
  exit 1
fi

echo ""

# ── 2. Sequence cron (manual trigger) ────────────────────────────────────────
echo "2. GET /api/sequence (manual cron trigger) ..."
SEQ_RESPONSE=$(curl -s -X GET "$BASE_URL/api/sequence" \
  -H "Authorization: Bearer $CRON_SECRET")

echo "$SEQ_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SEQ_RESPONSE"

SEQ_OK=$(echo "$SEQ_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ok',''))" 2>/dev/null || echo "")
if [ "$SEQ_OK" = "True" ]; then
  echo "$PASS  Sequence cron: ok=true"
else
  echo "$FAIL  Sequence cron returned ok=false or errored"
fi

echo ""

# ── 3. Admin auth + leads ─────────────────────────────────────────────────────
echo "3. POST /api/admin/auth + /api/admin/leads ..."
ADMIN_PIN="${ADMIN_PIN:-7971}"

AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/auth" \
  -H "Content-Type: application/json" \
  -d "{\"pin\":\"$ADMIN_PIN\"}")

AUTH_OK=$(echo "$AUTH_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ok',''))" 2>/dev/null || echo "")
if [ "$AUTH_OK" = "True" ]; then
  echo "$PASS  Admin auth: ok=true"
else
  echo "$FAIL  Admin auth failed: $AUTH_RESPONSE"
fi

LEADS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/leads" \
  -H "Content-Type: application/json" \
  -d "{\"pin\":\"$ADMIN_PIN\"}")

LEADS_OK=$(echo "$LEADS_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ok',''))" 2>/dev/null || echo "")
if [ "$LEADS_OK" = "True" ]; then
  echo "$PASS  Admin leads: ok=true (real Supabase data flowing)"
else
  echo "!    Admin leads returned ok=false — DB may be empty or Supabase not connected"
fi

echo ""
echo "=== Smoke test complete ==="
echo ""
echo "Next steps if all checks pass:"
echo "  1. Open Slack — you should see a Solens alert for $TEST_EMAIL"
echo "  2. Open Supabase → enrichment_events — confirm a row was inserted"
echo "  3. If vip_score >= 60, check lead_sequences for a new active row"
echo "  4. Run the ProspectRunner from /#admin → Prospect tab"
