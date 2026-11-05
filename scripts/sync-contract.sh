#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${1:-contract-v1.0.0}"
SRC="${DES_DOCS_PATH:-${ROOT}/../des-docs}"
HEADER_OPENAPI="Synced from des-docs@${VERSION}. Do not edit. Update des-docs first."
HEADER_SQL="Synced from des-docs@${VERSION}. Do not edit. Update des-docs first."

for file in openapi.yaml database/schema.sql database/seed.sql; do
  if [[ ! -f "${SRC}/${file}" ]]; then
    echo "Missing ${SRC}/${file}" >&2
    exit 1
  fi
done

mkdir -p "${ROOT}/contract" "${ROOT}/supabase/migrations"

{
  printf '# %s\n' "${HEADER_OPENAPI}"
  cat "${SRC}/openapi.yaml"
} > "${ROOT}/contract/openapi.yaml"

{
  printf '%s\n' "-- ${HEADER_SQL}"
  cat "${SRC}/database/schema.sql"
} > "${ROOT}/contract/schema.sql"

{
  printf '%s\n' "-- ${HEADER_SQL}"
  cat "${SRC}/database/seed.sql"
} > "${ROOT}/contract/seed.sql"

# Migrations are append-only once applied to a hosted project. Create the
# initial snapshot only when it does not exist; later schema changes need a
# new migration file instead of rewriting this one.
INIT_MIGRATION="${ROOT}/supabase/migrations/20261105120000_init.sql"
if [[ ! -f "${INIT_MIGRATION}" ]]; then
  {
    printf '%s\n' "-- ${HEADER_SQL}"
    cat "${SRC}/database/schema.sql"
  } > "${INIT_MIGRATION}"
fi

# Demo seed is applied manually, never by `supabase db push`.
{
  printf '%s\n' "-- ${HEADER_SQL}"
  cat "${SRC}/database/seed.sql"
} > "${ROOT}/supabase/seed.sql"

echo "Synced ${VERSION} into contract/ and supabase/"
