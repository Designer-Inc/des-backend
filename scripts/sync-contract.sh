#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-contract-v1.0.0}"
SRC="${DES_DOCS_PATH:-../des-docs}"
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
} > contract/openapi.yaml

{
  printf '%s\n' "-- ${HEADER}"
  cat "${SRC}/database/schema.sql"
} > contract/schema.sql

{
  printf '%s\n' "-- ${HEADER}"
  cat "${SRC}/database/seed.sql"
} > contract/seed.sql

echo "Synced ${VERSION} into contract/"
