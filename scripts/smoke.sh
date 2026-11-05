#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://127.0.0.1:8787}"
COOKIE_JAR="${COOKIE_JAR:-/tmp/des-backend-cookies.txt}"
PASSWORD="${DEMO_PASSWORD:-DemoPass123!}"

json() {
  python3 -m json.tool
}

login() {
  local email="$1"
  curl -sS -c "$COOKIE_JAR" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${email}\",\"password\":\"${PASSWORD}\"}" \
    "$API_BASE/auth/login"
}

echo "== health =="
curl -sS -o /tmp/des-health.json -w "HTTP %{http_code}\n" "$API_BASE/health"
cat /tmp/des-health.json | json

echo "== config =="
curl -sS "$API_BASE/config" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("fonts:", len(d["fonts"]), "currency:", d["currency"])'

echo "== categories =="
curl -sS "$API_BASE/categories" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("categories:", len(d["items"])); [print("-", x["name"]) for x in d["items"]]'

echo "== products =="
curl -sS "$API_BASE/products?limit=3" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("products:", d["total"]); [print("-", x["name"]) for x in d["items"]]'

echo "== customer login =="
customer_login="$(login "customer@demo.dyzainer.ua")"
echo "$customer_login" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("user:", d["user"]["email"], "role:", d["user"]["role"], "permissions:", len(d["permissions"]))'
customer_token="$(echo "$customer_login" | python3 -c 'import json,sys; print(json.load(sys.stdin)["accessToken"])')"

echo "== customer /auth/me =="
curl -sS -H "Authorization: Bearer ${customer_token}" "$API_BASE/auth/me" | json

echo "== admin login =="
admin_login="$(login "admin@demo.dyzainer.ua")"
admin_token="$(echo "$admin_login" | python3 -c 'import json,sys; print(json.load(sys.stdin)["accessToken"])')"
curl -sS -H "Authorization: Bearer ${admin_token}" "$API_BASE/auth/me" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("admin role:", d["role"], "permissions:", len(d["permissions"]))'

echo "== refresh =="
curl -sS -b "$COOKIE_JAR" -X POST "$API_BASE/auth/refresh" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("accessToken:", bool(d.get("accessToken")), "expiresIn:", d.get("expiresIn"))'

echo "== logout =="
curl -sS -o /dev/null -w "HTTP %{http_code}\n" -b "$COOKIE_JAR" -H "Authorization: Bearer ${customer_token}" -X POST "$API_BASE/auth/logout"

echo "Smoke test passed."
