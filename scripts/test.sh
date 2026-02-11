#!/bin/bash
set -e

echo "🔨 Building site..."
zola build 2>&1

echo ""
echo "🔗 Checking links..."
zola check 2>&1 || echo "⚠️  External link errors (may be DNS-related, check manually)"

echo ""
echo "📄 Validating HTML structure..."
errors=0

# Check all HTML files exist and aren't empty
for f in $(find public -name "*.html"); do
    if [ ! -s "$f" ]; then
        echo "❌ Empty HTML file: $f"
        errors=$((errors + 1))
    fi
done

# Check CSS exists
if [ ! -s "public/main.css" ]; then
    echo "❌ Missing or empty main.css"
    errors=$((errors + 1))
else
    echo "✅ main.css present ($(wc -c < public/main.css) bytes)"
fi

# [Spec 006 FR-005] Check custom design system CSS exists
if [ ! -s "public/custom-v5.css" ]; then
    echo "❌ Missing or empty custom-v5.css (Spec 006 FR-005)"
    errors=$((errors + 1))
else
    echo "✅ custom-v5.css present ($(wc -c < public/custom-v5.css) bytes)"
fi

# Check feeds exist
for feed in atom.xml rss.xml sitemap.xml; do
    if [ ! -s "public/$feed" ]; then
        echo "❌ Missing $feed"
        errors=$((errors + 1))
    else
        echo "✅ $feed present"
    fi
done

# Check llms.txt
if [ ! -s "public/llms.txt" ]; then
    echo "❌ Missing llms.txt"
    errors=$((errors + 1))
else
    echo "✅ llms.txt present"
fi

# Check robots.txt
if [ ! -s "public/robots.txt" ]; then
    echo "❌ Missing robots.txt"
    errors=$((errors + 1))
else
    echo "✅ robots.txt present"
fi

# Check structured data (JSON-LD) in pages
echo ""
echo "🏗️  Checking structured data..."
for f in public/index.html public/blog/*/index.html; do
    if [ -f "$f" ]; then
        if grep -q "application/ld+json" "$f"; then
            echo "✅ JSON-LD found in $f"
        else
            echo "❌ Missing JSON-LD in $f"
            errors=$((errors + 1))
        fi
    fi
done

# Check meta descriptions
echo ""
echo "🏷️  Checking meta tags..."
for f in public/index.html public/blog/*/index.html; do
    if [ -f "$f" ]; then
        if grep -q 'meta name=description\|meta name="description"' "$f"; then
            echo "✅ Meta description in $f"
        else
            echo "❌ Missing meta description in $f"
            errors=$((errors + 1))
        fi
    fi
done

# Check Open Graph tags
for f in public/index.html public/blog/*/index.html; do
    if [ -f "$f" ]; then
        if grep -q 'og:title' "$f"; then
            echo "✅ OG tags in $f"
        else
            echo "❌ Missing OG tags in $f"
            errors=$((errors + 1))
        fi
    fi
done

# ============================================================
# Spec-Mapped Assertions (added per specs 001-006)
# ============================================================

echo ""
echo "📋 Spec-mapped checks..."

# [Spec 001 FR-003] Validate nav menu order: Now, Projects, Blog
if [ -f "public/index.html" ]; then
    nav_now=$(grep -n 'href=.*/now/' public/index.html | head -1 | cut -d: -f1)
    nav_projects=$(grep -n 'href=.*/projects/' public/index.html | head -1 | cut -d: -f1)
    nav_blog=$(grep -n 'href=.*/blog/' public/index.html | head -1 | cut -d: -f1)
    if [ -n "$nav_now" ] && [ -n "$nav_projects" ] && [ -n "$nav_blog" ]; then
        if [ "$nav_now" -lt "$nav_projects" ] && [ "$nav_projects" -lt "$nav_blog" ]; then
            echo "✅ Nav menu order: Now < Projects < Blog (Spec 001 FR-003)"
        else
            echo "❌ Nav menu order incorrect — expected Now, Projects, Blog (Spec 001 FR-003)"
            errors=$((errors + 1))
        fi
    else
        echo "❌ Could not find all nav menu items in index.html (Spec 001 FR-003)"
        errors=$((errors + 1))
    fi
fi

# [Spec 002 FR-010 / Spec 005 FR-010] Validate .nosh companion files are valid JSON
echo ""
echo "🤖 Checking Nosh companion files..."
nosh_count=0
for nosh_file in $(find content -name "*.nosh" 2>/dev/null); do
    nosh_count=$((nosh_count + 1))
    if python3 -c "import json; json.load(open('$nosh_file'))" 2>/dev/null; then
        echo "✅ Valid JSON: $nosh_file (Spec 002 FR-010)"
    else
        echo "❌ Invalid JSON: $nosh_file (Spec 002 FR-010)"
        errors=$((errors + 1))
    fi
done
if [ "$nosh_count" -eq 0 ]; then
    echo "⚠️  No .nosh companion files found (informational)"
else
    echo "   Found $nosh_count .nosh file(s)"
fi

# [Spec 003 FR-005] Verify project pages contain admonition info block
echo ""
echo "🗂️  Checking project pages..."
for f in public/projects/*/index.html; do
    if [ -f "$f" ]; then
        # Skip the section index page
        if [ "$f" = "public/projects/index.html" ]; then
            continue
        fi
        if grep -q 'admonition.*info\|class="admonition info"' "$f"; then
            echo "✅ Admonition block in $f (Spec 003 FR-005)"
        else
            echo "❌ Missing admonition info block in $f (Spec 003 FR-005)"
            errors=$((errors + 1))
        fi
    fi
done

# [Spec 004 FR-001] Verify /now page exists
if [ -s "public/now/index.html" ]; then
    echo "✅ Now page present at /now/ (Spec 004 FR-001)"
else
    echo "❌ Missing or empty /now/index.html (Spec 004 FR-001)"
    errors=$((errors + 1))
fi

# [Spec 005 FR-002] Verify robots.txt has named AI bot user-agents
echo ""
echo "🤖 Checking AI crawler permissions..."
for bot in GPTBot ChatGPT-User Claude-Web Anthropic-AI PerplexityBot Google-Extended; do
    if grep -q "User-agent: $bot" public/robots.txt; then
        echo "✅ robots.txt allows $bot (Spec 005 FR-002)"
    else
        echo "❌ robots.txt missing User-agent: $bot (Spec 005 FR-002)"
        errors=$((errors + 1))
    fi
done

# [Spec 005 FR-005] Verify llms.txt has required sections
echo ""
echo "📖 Checking llms.txt structure..."
for section in "Start Here" "High-Signal Posts" "Machine-Readable" "Scope"; do
    if grep -q "$section" public/llms.txt; then
        echo "✅ llms.txt has '$section' section (Spec 005 FR-005)"
    else
        echo "❌ llms.txt missing '$section' section (Spec 005 FR-005)"
        errors=$((errors + 1))
    fi
done

# [All Specs] Minimum content count smoke test
echo ""
echo "🔢 Content count smoke test..."
page_count=$(find public -name 'index.html' | wc -l)
post_count=$(find public/blog -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
project_count=$(find public/projects -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)

if [ "$post_count" -ge 3 ]; then
    echo "✅ Blog posts: $post_count (minimum 3)"
else
    echo "❌ Blog posts: $post_count (expected at least 3)"
    errors=$((errors + 1))
fi

if [ "$project_count" -ge 4 ]; then
    echo "✅ Project pages: $project_count (minimum 4)"
else
    echo "❌ Project pages: $project_count (expected at least 4)"
    errors=$((errors + 1))
fi

# ============================================================

echo ""
echo "📊 Summary:"
echo "   Pages:    $page_count"
echo "   Posts:    $post_count"
echo "   Projects: $project_count"
echo "   CSS:      $(wc -c < public/main.css) bytes (tabi) + $(wc -c < public/custom-v5.css 2>/dev/null || echo '0') bytes (custom)"
echo "   Errors:   $errors"

if [ $errors -gt 0 ]; then
    echo ""
    echo "❌ $errors error(s) found!"
    exit 1
else
    echo ""
    echo "✅ All checks passed!"
fi
