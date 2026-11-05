#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${1:-contract-v1.0.0}"
SRC="${DES_DOCS_PATH:-${ROOT}/../des-docs}"
HEADER="Synced from des-docs@${VERSION}. Do not edit. Update des-docs first."

for file in openapi.yaml database/schema.sql database/seed.sql; do
  if [[ ! -f "${SRC}/${file}" ]]; then
    echo "Missing ${SRC}/${file}" >&2
    exit 1
  fi
done

{
  printf '# %s\n' "${HEADER}"
  cat "${SRC}/openapi.yaml"
} > "${ROOT}/contract/openapi.yaml"

{
  printf '%s\n' "-- ${HEADER}"
  cat "${SRC}/database/schema.sql"
} > "${ROOT}/contract/schema.sql"

{
  printf '%s\n' "-- ${HEADER}"
  cat "${SRC}/database/seed.sql"
} > "${ROOT}/contract/seed.sql"

echo "Synced ${VERSION} into contract/"
