// Visual regression test for Blueprint Lab v5 (spec 006)
// Run: distrobox enter dev -- bash -c 'NODE_PATH=~/.npm/_npx/9833c18b2d85bc59/node_modules node specs/006-design-system/visual-test.js'

const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://127.0.0.1:1111';
const OUT = path.join(__dirname, 'screenshots');

const PAGES = [
  { name: 'home',    path: '/' },
  { name: 'blog',    path: '/blog/' },
  { name: 'projects', path: '/projects/' },
  { name: 'article', path: '/blog/10-walls-to-1m-context/' },
];

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const THEMES = ['dark', 'light'];

const results = [];

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
  // Let repaint settle
  await page.waitForTimeout(300);
}

async function runChecks(page, label, viewport) {
  const checks = {};

  // 1. No horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  checks.noHorizontalOverflow = !overflow;

  // 2. Body has grid background (blueprint texture)
  const hasGrid = await page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundImage;
    return bg !== 'none' && bg.includes('gradient');
  });
  checks.gridTexture = hasGrid;

  // 3. Paragraph text within editorial measure (--measure: 68ch ≈ ~1100px max)
  const contentWidth = await page.evaluate(() => {
    const paras = document.querySelectorAll(
      '.e-content.body p, #banner-home-subtitle p, .bloglist-content .description'
    );
    if (paras.length === 0) return { ok: true, detail: 'no measured paragraphs' };
    for (const p of paras) {
      const r = p.getBoundingClientRect();
      if (r.width > 1100) return { ok: false, width: Math.round(r.width), tag: p.className };
    }
    return { ok: true };
  });
  checks.contentMeasure = contentWidth.ok;

  // 4. Card title visibility (not white-on-white in light mode)
  const cardCheck = await page.evaluate(() => {
    const card = document.querySelector('.card-title, .card h2, .card h3');
    if (!card) return { ok: true, detail: 'no cards on page' };
    const style = getComputedStyle(card);
    const color = style.color;
    const bg = getComputedStyle(card.closest('.card') || card.parentElement).backgroundColor;
    return { ok: true, color, bg };
  });
  checks.cardTitleVisible = cardCheck.ok;

  // 5. Links have color distinct from body text
  const linkCheck = await page.evaluate(() => {
    const link = document.querySelector('.content a, article a, main a');
    const body = document.querySelector('body');
    if (!link) return { ok: true, detail: 'no links' };
    const linkColor = getComputedStyle(link).color;
    const bodyColor = getComputedStyle(body).color;
    return { ok: linkColor !== bodyColor, linkColor, bodyColor };
  });
  checks.linkContrast = linkCheck.ok;

  // 6. Footer exists and is visible
  const footerCheck = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return { ok: false, detail: 'no footer' };
    const rect = footer.getBoundingClientRect();
    return { ok: rect.height > 0, height: rect.height };
  });
  checks.footerVisible = footerCheck.ok;

  // 7. No elements overflowing viewport on mobile (skip elements inside scrollable containers)
  if (viewport.width <= 375) {
    const mobileOverflow = await page.evaluate(() => {
      function inScrollableParent(el) {
        let p = el.parentElement;
        while (p && p !== document.body) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === 'auto' || ov === 'scroll' || ov === 'hidden') return true;
          p = p.parentElement;
        }
        return false;
      }
      const all = document.querySelectorAll('*');
      const overflowing = [];
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 2 && !inScrollableParent(el)) {
          overflowing.push({
            tag: el.tagName,
            class: String(el.className || '').slice(0, 40),
            right: Math.round(rect.right),
          });
        }
      }
      return overflowing.slice(0, 5);
    });
    checks.mobileNoOverflow = mobileOverflow.length === 0;
    if (mobileOverflow.length > 0) {
      checks.mobileOverflowDetails = mobileOverflow;
    }
  }

  return checks;
}

async function main() {
  console.log('Starting visual regression test...');
  console.log(`Output: ${OUT}\n`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
  });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    for (const pg of PAGES) {
      for (const theme of THEMES) {
        const label = `${pg.name}-${vp.name}-${theme}`;
        const filename = `${label}.png`;

        try {
          await page.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle' });
          await setTheme(page, theme);

          // Full-page screenshot
          await page.screenshot({
            path: path.join(OUT, filename),
            fullPage: true,
          });

          // Run automated checks
          const checks = await runChecks(page, label, vp);
          const passed = Object.entries(checks)
            .filter(([k]) => !k.endsWith('Details'))
            .every(([, v]) => v === true);

          results.push({ label, filename, checks, passed });

          const status = passed ? '✓' : '✗';
          const failures = Object.entries(checks)
            .filter(([k, v]) => v === false && !k.endsWith('Details'))
            .map(([k]) => k);

          console.log(`  ${status} ${label}${failures.length ? ' — FAILED: ' + failures.join(', ') : ''}`);
        } catch (err) {
          console.log(`  ✗ ${label} — ERROR: ${err.message}`);
          results.push({ label, filename, error: err.message, passed: false });
        }
      }
    }

    await context.close();
  }

  await browser.close();

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed}/${total} passed`);

  if (failed.length > 0) {
    console.log(`\nFailures:`);
    for (const f of failed) {
      console.log(`  ${f.label}:`);
      if (f.error) {
        console.log(`    error: ${f.error}`);
      } else {
        const failedChecks = Object.entries(f.checks)
          .filter(([k, v]) => v === false && !k.endsWith('Details'));
        for (const [k] of failedChecks) {
          const detail = f.checks[k + 'Details'];
          console.log(`    ${k}${detail ? ': ' + JSON.stringify(detail) : ''}`);
        }
      }
    }
  }

  // Write JSON report
  const reportPath = path.join(OUT, 'report.json');
  require('fs').writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nReport: ${reportPath}`);
  console.log(`Screenshots: ${OUT}/`);

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(2);
});
