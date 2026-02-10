# bold.casa

Personal site and blog for **John Rembold**.

Built as a fast, low-maintenance publishing stack focused on technical writing, project notes, and experiments.

## What this is

- Personal publishing platform (blog + projects + now page)
- Static site generated with **Zola**
- Deployed on **Cloudflare Pages**
- Theme base: **tabi** (as a git submodule), with local overrides for branding/layout

## Why these technical decisions

### 1) Zola (Rust-based static site generator)
Chosen for:
- fast local build times
- simple content model (`content/` markdown)
- no Node build-chain complexity required for publishing
- clean taxonomy/feed support out of the box

### 2) Cloudflare Pages deployment
Chosen for:
- simple static hosting
- fast global edge delivery
- low operational overhead

### 3) Theme strategy: upstream theme + local customization
- Upstream theme: `themes/tabi` (tracked as submodule)
- Local customizations: templates and CSS overrides (`templates/`, `static/custom-v4.css`)

This keeps the stack maintainable: upstream improvements are available while preserving site-specific design decisions.

### 4) SEO + machine-discovery defaults
Project includes:
- `robots.txt`
- feeds (`atom.xml`, `rss.xml`)
- JSON-LD checks in test script
- `llms.txt` for AI agent discovery workflows

### 5) Nosh: LLM blog-post optimization layer
This blog leverages the novel **Nosh** approach for agent-readable content packaging — a machine-friendly companion format that helps LLMs consume post knowledge with less parsing overhead.

- Goal: improve AI discoverability and citation quality
- Practical effect: cleaner structured content for agent workflows (vs raw HTML scraping)
- Related project: **Nosh GitHub** → https://github.com/jbold/nosh

### 6) Security-conscious CSP settings
`config.toml` includes CSP and allowed domains (including Cloudflare insights) to reduce accidental third-party sprawl.

## Project structure

- `content/` — markdown pages/posts/projects
- `templates/` — template overrides
- `static/` — static assets (CSS, llms.txt, robots.txt)
- `themes/tabi/` — upstream theme submodule
- `scripts/test.sh` — local build + structural checks

## Local development

### Prerequisites
- [Zola](https://www.getzola.org/)

### Run locally
```bash
zola serve
```

### Build
```bash
zola build
```

### Run checks
```bash
./scripts/test.sh
```

## Current status

Live and publishing. Ongoing work includes:
- better test coverage and linting
- additional posts/content cadence
- theme polish and UX refinement

## Notes

Editorial conventions used in recent posts:
- start with TL;DR
- include jump links to solution/code/spec sections
- emphasize measurable outcomes when available
