#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const axeModule = require("@axe-core/playwright");

const AxeBuilder = axeModule.default || axeModule.AxeBuilder || axeModule;

const BASE_URL = process.env.E2E_BASE_URL || "http://127.0.0.1:1111";
const REPORT_DIR = process.env.E2E_REPORT_DIR || path.join("test-results", "e2e");
const A11Y_FAIL_IMPACTS = new Set(
  (process.env.A11Y_FAIL_IMPACTS || "critical")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const THEMES = ["dark", "light"];

const ROUTES = [
  { name: "home", path: "/", requiredSelectors: ["main", "header", "footer"] },
  { name: "blog", path: "/blog/", requiredSelectors: ["main"] },
  { name: "projects", path: "/projects/", requiredSelectors: ["main"] },
  { name: "now", path: "/now/", requiredSelectors: ["main"] },
];

function routeUrl(routePath) {
  return new URL(routePath, BASE_URL).toString();
}

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

async function setTheme(page, theme) {
  await page.evaluate((activeTheme) => {
    document.documentElement.setAttribute("data-theme", activeTheme);
    try {
      localStorage.setItem("theme", activeTheme);
      localStorage.setItem("themeSetTimestamp", Date.now().toString());
    } catch (_error) {}
  }, theme);
  await page.waitForTimeout(100);
}

function compactViolation(violation) {
  return {
    id: violation.id,
    impact: violation.impact || "unknown",
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  };
}

async function analyzeAccessibility(page) {
  const analysis = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  const blockingViolations = analysis.violations.filter((violation) =>
    A11Y_FAIL_IMPACTS.has((violation.impact || "").toLowerCase()),
  );

  return {
    violations: analysis.violations.map(compactViolation),
    incomplete: analysis.incomplete.map(compactViolation),
    blockingViolations: blockingViolations.map(compactViolation),
  };
}

async function assertRequiredSelectors(page, selectors) {
  const missing = [];

  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    if (count < 1) {
      missing.push(selector);
    }
  }

  return missing;
}

async function runRouteCheck(page, contextInfo) {
  const consoleErrors = [];
  const pageErrors = [];

  const onConsole = (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  };
  const onPageError = (error) => {
    pageErrors.push(error.message || String(error));
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  const targetUrl = routeUrl(contextInfo.route.path);
  const response = await page.goto(targetUrl, { waitUntil: "networkidle" });

  const issues = [];
  if (!response || !response.ok()) {
    issues.push(`navigation failed (${response ? response.status() : "no response"})`);
  }

  const missingSelectors = await assertRequiredSelectors(page, contextInfo.route.requiredSelectors);
  if (missingSelectors.length > 0) {
    issues.push(`missing selectors: ${missingSelectors.join(", ")}`);
  }

  const a11y = await analyzeAccessibility(page);
  if (a11y.blockingViolations.length > 0) {
    issues.push(`blocking accessibility violations: ${a11y.blockingViolations.length}`);
  }

  if (consoleErrors.length > 0) {
    issues.push(`console errors: ${consoleErrors.length}`);
  }

  if (pageErrors.length > 0) {
    issues.push(`page errors: ${pageErrors.length}`);
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);

  return {
    viewport: contextInfo.viewport.name,
    theme: contextInfo.theme,
    route: contextInfo.route.name,
    url: targetUrl,
    ok: issues.length === 0,
    issues,
    status: response ? response.status() : null,
    consoleErrors,
    pageErrors,
    a11ySummary: {
      totalViolations: a11y.violations.length,
      blockingViolations: a11y.blockingViolations.length,
      seriousViolations: a11y.violations.filter(
        (violation) => (violation.impact || "").toLowerCase() === "serious",
      ).length,
      criticalViolations: a11y.violations.filter(
        (violation) => (violation.impact || "").toLowerCase() === "critical",
      ).length,
    },
    a11y,
  };
}

async function runFlowCheck(page) {
  const issues = [];

  await page.goto(routeUrl("/"), { waitUntil: "networkidle" });

  const navChecks = [
    { name: "blog", selector: "a[href*='/blog/']" },
    { name: "projects", selector: "a[href*='/projects/']" },
    { name: "now", selector: "a[href*='/now/']" },
  ];

  for (const navCheck of navChecks) {
    if ((await page.locator(navCheck.selector).count()) < 1) {
      issues.push(`missing ${navCheck.name} navigation link`);
    }
  }

  await page.goto(routeUrl("/blog/"), { waitUntil: "networkidle" });
  const firstPostHref = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("main a[href*='/blog/']"));
    const match = links.find((link) => {
      const href = link.getAttribute("href") || "";
      return /\/blog\/[^/]+\/?$/.test(href) && !/\/blog\/page\/\d+\/?$/.test(href);
    });
    return match ? match.getAttribute("href") : null;
  });

  if (!firstPostHref) {
    issues.push("blog listing has no discoverable post links");
  } else {
    const postPath = new URL(firstPostHref, BASE_URL).pathname;
    await page.goto(routeUrl(postPath), { waitUntil: "networkidle" });
  }

  if ((await page.locator("article h1, main h1").count()) < 1) {
    issues.push("post page missing a primary heading");
  }

  await page.goto(routeUrl("/"), { waitUntil: "networkidle" });
  const searchToggle = page.locator("#search-button");
  if ((await searchToggle.count()) < 1) {
    issues.push("search toggle button missing");
  } else {
    await searchToggle.first().click();
    const searchInput = page.locator("#searchInput");
    if ((await searchInput.count()) < 1) {
      issues.push("search modal input missing");
    } else {
      await searchInput.fill("agent");
      await page.waitForTimeout(400);
    }

    const resultsContainer = page.locator("#results, #results-container");
    if ((await resultsContainer.count()) < 1) {
      issues.push("search results container missing");
    }
  }

  const mainLandmarkCount = await page.locator("main").count();
  if (mainLandmarkCount < 1) {
    issues.push("page main landmark missing during flow checks");
  }
  const footerLandmarkCount = await page.locator("footer").count();
  if (footerLandmarkCount < 1) {
    issues.push("page footer landmark missing during flow checks");
  }

  if ((await page.locator("#searchInput").count()) > 0) {
    const searchInput = page.locator("#searchInput");
    await searchInput.fill("agent");
    await page.waitForTimeout(250);
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

async function main() {
  ensureReportDir();

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    a11yFailImpacts: Array.from(A11Y_FAIL_IMPACTS),
    checks: [],
    flowChecks: [],
  };

  const browser = await chromium.launch({ headless: true });
  let hasFailures = false;

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();

    for (const theme of THEMES) {
      await page.goto(routeUrl("/"), { waitUntil: "networkidle" });
      await setTheme(page, theme);

      for (const route of ROUTES) {
        await setTheme(page, theme);
        const check = await runRouteCheck(page, { viewport, theme, route });
        report.checks.push(check);
        if (!check.ok) {
          hasFailures = true;
        }
      }

      await setTheme(page, theme);
      const flow = await runFlowCheck(page);
      report.flowChecks.push({
        viewport: viewport.name,
        theme,
        ...flow,
      });
      if (!flow.ok) {
        hasFailures = true;
      }
    }

    await context.close();
  }

  await browser.close();

  const reportPath = path.join(REPORT_DIR, "report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  const totalRouteChecks = report.checks.length;
  const failedRouteChecks = report.checks.filter((check) => !check.ok).length;
  const failedFlowChecks = report.flowChecks.filter((check) => !check.ok).length;

  console.log(`E2E route checks: ${totalRouteChecks - failedRouteChecks}/${totalRouteChecks} passed`);
  console.log(`Flow checks: ${report.flowChecks.length - failedFlowChecks}/${report.flowChecks.length} passed`);
  console.log(`Report: ${reportPath}`);

  if (hasFailures) {
    console.error("E2E/a11y smoke test failed.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
