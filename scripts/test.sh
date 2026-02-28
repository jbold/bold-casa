#!/usr/bin/env bash
set -euo pipefail

errors=0
warnings=0

echo "==> Building site with Zola"
zola build

echo ""
echo "==> Optional external link check"
if [[ "${STRICT_EXTERNAL_LINKS:-0}" == "1" ]]; then
  if ! zola check; then
    echo "ERROR: zola check failed with STRICT_EXTERNAL_LINKS=1"
    errors=$((errors + 1))
  fi
else
  if ! zola check; then
    echo "WARN: external link check reported issues (non-blocking). Set STRICT_EXTERNAL_LINKS=1 to enforce."
    warnings=$((warnings + 1))
  fi
fi

echo ""
echo "==> Validating required output artifacts"
required_files=(
  "public/index.html"
  "public/blog/index.html"
  "public/projects/index.html"
  "public/now/index.html"
  "public/atom.xml"
  "public/rss.xml"
  "public/sitemap.xml"
  "public/robots.txt"
  "public/llms.txt"
  "public/main.css"
)

for path in "${required_files[@]}"; do
  if [[ ! -s "${path}" ]]; then
    echo "ERROR: missing or empty ${path}"
    errors=$((errors + 1))
  else
    echo "OK: ${path}"
  fi
done

if [[ -f "static/custom.css" ]]; then
  if [[ ! -s "public/custom.css" ]]; then
    echo "ERROR: static/custom.css exists but public/custom.css is missing"
    errors=$((errors + 1))
  else
    echo "OK: public/custom.css"
  fi
fi

echo ""
echo "==> Validating generated HTML files are non-empty"
while IFS= read -r -d '' html; do
  if [[ ! -s "${html}" ]]; then
    echo "ERROR: empty HTML file ${html}"
    errors=$((errors + 1))
  fi
done < <(find public -name "*.html" -print0)

echo ""
echo "==> Validating .nosh companions"
nosh_count=0
while IFS= read -r -d '' nosh_file; do
  nosh_count=$((nosh_count + 1))
  if python3 -c 'import json, pathlib, sys; json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))' "${nosh_file}" 2>/dev/null; then
    echo "OK: ${nosh_file}"
  else
    echo "ERROR: invalid JSON in ${nosh_file}"
    errors=$((errors + 1))
  fi
done < <(find content -name "*.nosh" -print0)

if [[ "${nosh_count}" -eq 0 ]]; then
  echo "WARN: no .nosh files found"
  warnings=$((warnings + 1))
fi

echo ""
page_count="$(find public -name 'index.html' | wc -l | tr -d ' ')"
post_count="$(find public/blog -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"
project_count="$(find public/projects -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"

echo "==> Summary"
echo "Pages:    ${page_count}"
echo "Posts:    ${post_count}"
echo "Projects: ${project_count}"
echo "Warnings: ${warnings}"
echo "Errors:   ${errors}"

if [[ "${errors}" -gt 0 ]]; then
  exit 1
fi

echo "All blocking checks passed."
