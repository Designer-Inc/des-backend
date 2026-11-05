#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Optional: SUPABASE_EXCLUDE=studio,realtime,... to skip heavy services.
if [[ -n "${SUPABASE_EXCLUDE:-}" ]]; then
  bunx supabase start -x "${SUPABASE_EXCLUDE}"
else
  bunx supabase start
fi

bunx supabase db reset

STATUS="$(bunx supabase status -o env)"
get_status() {
  printf '%s\n' "${STATUS}" | grep -E "^$1=" | head -1 | cut -d= -f2- | tr -d '"'
}

API_URL="$(get_status API_URL)"
ANON_KEY="$(get_status ANON_KEY)"
SERVICE_ROLE_KEY="$(get_status SERVICE_ROLE_KEY)"

if [[ -z "${API_URL}" || -z "${ANON_KEY}" || -z "${SERVICE_ROLE_KEY}" ]]; then
  echo "Could not read Supabase status. Run: bunx supabase status -o env" >&2
  exit 1
fi

cat > .dev.vars <<EOF
SUPABASE_URL=${API_URL}
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
APP_ORIGIN=http://localhost:5173
PUBLIC_ASSETS_BASE_URL=http://localhost:5173/assets
COOKIE_SECURE=false
DEMO_MODE=true
EOF

echo "Wrote .dev.vars"
echo "Starting Wrangler on http://127.0.0.1:8787"
exec bunx wrangler dev
