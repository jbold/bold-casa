#!/usr/bin/env bash
set -euo pipefail

E2E_HOST="${E2E_HOST:-127.0.0.1}"
E2E_PORT="${E2E_PORT:-1111}"
E2E_BASE_URL="${E2E_BASE_URL:-http://${E2E_HOST}:${E2E_PORT}}"
E2E_SERVER_LOG="${E2E_SERVER_LOG:-/tmp/zola-e2e.log}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

zola serve --interface "${E2E_HOST}" --port "${E2E_PORT}" >"${E2E_SERVER_LOG}" 2>&1 &
SERVER_PID=$!

ready=0
for _ in $(seq 1 120); do
  if curl -fsS "${E2E_BASE_URL}" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 0.25
done

if [[ "${ready}" -ne 1 ]]; then
  echo "zola serve did not become ready at ${E2E_BASE_URL}" >&2
  echo "--- zola serve log ---" >&2
  tail -n 120 "${E2E_SERVER_LOG}" >&2 || true
  exit 1
fi

echo "Running E2E + accessibility smoke tests against ${E2E_BASE_URL}"
node scripts/e2e-a11y-smoke.cjs
