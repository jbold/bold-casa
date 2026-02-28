# Handoff Notes

Last updated: 2026-02-28 (UTC)

## Current Production State
- Latest pushed commit on `main`: `8309ee4` (`fix: correct design-series links to /blog routes`).
- Cloudflare Pages check for `8309ee4`: `completed/success`.
  - Details: https://dash.cloudflare.com/?to=/53bf34ad52ab19e3999d92d08713a892/pages/view/bold-casa/b7663145-dfc4-484c-822b-e1c6a6edc75c
- Verified live: all 5 posts in the “Design in the Agentic Era” series now use `/blog/...` links in the series footer; old root-style links are absent there.

## What Was Finished in This Session
- Created contributor guide: `AGENTS.md`.
- Fixed broken series cross-links and deployed to production.
- Added local (not yet shipped) CI/security/e2e/a11y hardening scaffolding.
- Added deployment/ops hardening refinements:
  - Cloudflare deploy workflow now uses preflight checks (no brittle secret conditionals).
  - New workflow: `.github/workflows/cloudflare-pages-alerts.yml` to open issues on failed native Cloudflare Pages check-runs.
  - Ops alert workflow now deduplicates by run-id marker.
  - CI/security workflows now gate Rust-specific checks on `transition-wasm/Cargo.toml` presence.

## Important: Local Workspace Is Still Dirty
There are many local changes/untracked files not yet committed/pushed (CI workflows, scripts, theme assets, specs, etc.).  
Treat this as a mixed worktree. Before new work, decide whether to:
1. Keep and commit hardening changes in focused commits, or
2. Stash/split them, then continue feature/content work cleanly.

## Pending Decisions
- Deploy model:
  - Keep native Cloudflare GitHub App auto-deploy (current behavior), or
  - Move deploy ownership to GitHub Actions + Cloudflare API tokens.
- If staying native deploy, disable duplicate Actions deploy to avoid split ownership.
- Accessibility policy:
  - Current gate blocks `critical` violations.
  - `serious` currently fails in this theme baseline (12 blocking findings across route/theme/viewport checks); decide whether to fix UI issues now or keep as monitored metric.

## Lessons Learned (Reduce Turns / Token Burn)
1. Fix the immediate production bug first, then do hardening work.
2. Push minimal targeted content fixes early; verify live before broad refactors.
3. For deploy checks, use: GitHub check run status + direct `curl` of affected live page.
4. Keep E2E assumptions aligned with generated site structure (avoid hardcoded routes that may not exist).
5. Keep validation scripts tied to current architecture, not old spec checks.
6. During long sessions, maintain this file incrementally to avoid recap-heavy turns.
7. Make optional module checks conditional in CI/security (avoid assuming local-only dirs are tracked in git).

## Fast Resume Commands
```bash
git status --short
git log --oneline -n 5
gh api /repos/jbold/bold-casa/commits/main/check-runs
curl -sS https://bold.casa/blog/jidoka-trust-levels/ | rg "Part 1:|/blog/product-design-agentic-era/"
```

## About `/new`, `/clear`, `/compact`
- There is no guaranteed automatic in-repo handoff generation from those commands.
- Durable state is what you save to files (like this one) and Git history.
