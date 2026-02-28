# Repository Guidelines

## Project Structure & Module Organization
- `content/` stores source Markdown (`content/blog/`, `content/projects/`, `content/now/`).
- `templates/` contains local Tera overrides layered on `themes/tabi/`.
- `static/` contains site assets and overrides (`custom.css`, images, `robots.txt`, `llms.txt`, JS).
- `scripts/` contains automation (`test.sh`, `test-e2e-a11y.sh`).
- `.github/workflows/` contains CI/CD, security scanning, and ops alert automation.
- `public/` is generated build output; never edit it manually.

## Build, Test, and Development Commands
- `zola serve` runs local preview at `http://127.0.0.1:1111`.
- `zola build` creates production output in `public/`.
- `./scripts/test.sh` runs blocking structural checks (build, output artifacts, HTML non-empty, `.nosh` JSON validation).
- `npm ci && ./scripts/test-e2e-a11y.sh` runs Playwright smoke + accessibility checks and writes `test-results/e2e/report.json`.

## Coding Style & Naming Conventions
- Use kebab-case filenames for content and assets (example: `content/blog/my-new-post.md`).
- Keep Markdown front matter consistent with adjacent files.
- Use 2-space indentation in JS/CSS, prefer `const`/`let`, and keep semicolons.
- Avoid direct edits in `themes/tabi/` unless syncing upstream behavior; prefer overrides in `templates/` and `static/`.

## Testing Guidelines
- Run `./scripts/test.sh` before opening a PR.
- For UX and accessibility changes, run `./scripts/test-e2e-a11y.sh` and review `test-results/e2e/report.json`.
- CI currently fails on critical accessibility violations; serious violations are reported in CI summaries.

## Commit & Pull Request Guidelines
- Match current history style with concise Conventional Commit prefixes (`feat:`, `fix:`).
- Keep commits scoped by concern (`content`, `theme`, `infra`, `wasm`) and avoid mixing unrelated changes.
- PRs should include: what changed, why, validation commands run, and screenshots for visual diffs.
- Link related issues/spec docs when applicable.
