# bold.casa Constitution

## Core Principles

### I. Content-First

Every decision serves the reader. Content is authored in Markdown with TOML front matter — no build-time transformations that obscure the author's intent. The editorial voice is direct, technical, and honest. Posts follow the TL;DR + jump links pattern for skimmability. If a change doesn't improve the reading experience or content discoverability, it doesn't ship.

### II. Fast and Light

The site must build in under 2 seconds locally. No JavaScript frameworks, no Node.js build chain, no runtime dependencies in production. The stack is static HTML and CSS delivered from an edge CDN. Target: sub-1-second first contentful paint on a cold load. Complexity is measured in dependency count — it should be countable on one hand (Zola, a theme, a CSS file, content).

### III. AI-Discoverable

Content is published for both humans and machines. Every post must be crawlable by AI agents (robots.txt `Allow: /` for named bots). The site maintains an `llms.txt` index for agent discovery, generates Atom and RSS feeds, and supports Nosh structured metadata for machine-readable content consumption. JSON-LD structured data and Open Graph tags are present on all key pages.

### IV. Low Maintenance

The upstream Tabi theme is tracked as a git submodule — never forked. Local overrides are limited to a single CSS file (`custom-v4.css`) and a single template extension (`extend_body.html`). Theme updates should be safe to pull without regressions. There is no database, no server-side processing, no authentication system, and no multi-author workflow.

### V. Secure by Default

Content Security Policy headers are enabled with an explicit allowlist for external resources. No inline scripts are permitted except the Cloudflare analytics beacon (injected via template extension). External links open in new tabs with `no-referrer`. Secrets are never committed (`.env` is gitignored).

## Technical Constraints

- **Static site generator:** Zola (Rust-based, no Node.js dependency)
- **Theme:** Tabi (git submodule from `welpo/tabi`)
- **Hosting:** Cloudflare Pages (static files only, edge delivery)
- **Content format:** Markdown with TOML front matter
- **Design system:** Blueprint Lab v3 (single CSS file, CSS custom properties)
- **Feeds:** Atom (`atom.xml`) and RSS (`rss.xml`), auto-generated
- **Taxonomies:** Tags (with per-tag feed generation)
- **Testing:** Bash validation script (`scripts/test.sh`)
- **No database, no server-side processing, no authentication**
- **Single operator:** John Rembold (no multi-author workflow needed)

## Development Workflow

1. **Local development:** `zola serve` for live preview with hot reload
2. **Testing:** `./scripts/test.sh` must pass before deploy — validates build, links, HTML structure, feeds, JSON-LD, meta descriptions, Open Graph tags, and discovery files
3. **Deploy:** Push to main branch triggers Cloudflare Pages build and deploy
4. **Content changes:** Edit markdown, commit, push
5. **Design changes:** Edit `static/custom-v4.css`, test locally with `zola serve`, commit
6. **Theme updates:** `git submodule update --remote themes/tabi`, run test.sh, check for regressions
7. **Spec workflow:** New features start with `/speckit.specify`, get planned with `/speckit.plan`, broken into tasks with `/speckit.tasks`, validated with `/speckit.checklist`, then implemented with `/speckit.implement`

## Governance

- This constitution governs all development decisions for bold.casa
- Single maintainer: amendments are self-ratified and documented in this file
- All spec artifacts (`.specify/`) are committed alongside the code they describe
- Constitution is reviewed when adding new technology dependencies or changing hosting
- Violations of these principles require an explicit amendment — not silent drift

**Version**: 1.0 | **Ratified**: 2026-02-10 | **Last Amended**: 2026-02-10
