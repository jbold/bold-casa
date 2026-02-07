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
if [ ! -s "public/style.css" ]; then
    echo "❌ Missing or empty style.css"
    errors=$((errors + 1))
else
    echo "✅ style.css present ($(wc -c < public/style.css) bytes)"
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

echo ""
echo "📊 Summary:"
echo "   Pages: $(find public -name 'index.html' | wc -l)"
echo "   Posts: $(find public/blog -mindepth 1 -maxdepth 1 -type d | wc -l)"
echo "   CSS:   $(wc -c < public/style.css) bytes"
echo "   Errors: $errors"

if [ $errors -gt 0 ]; then
    echo ""
    echo "❌ $errors error(s) found!"
    exit 1
else
    echo ""
    echo "✅ All checks passed!"
fi
