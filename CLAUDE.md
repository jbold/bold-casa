# CLAUDE.md — bold.casa

## Project Overview

Personal website and blog for John Rembold, built with **Zola** (Rust-based static site generator). The site lives at https://bold.casa and covers AI tooling, self-hosted infrastructure, debugging, and building in public.

## Tech Stack

- **Static site generator**: [Zola](https://www.getzola.org) (standalone binary, no Node.js/npm)
- **Content**: Markdown with TOML frontmatter (`+++` delimiters)
- **Templates**: Tera (Jinja2-like) templates
- **Styling**: SCSS (compiled by Zola, single file: `sass/style.scss`)
- **Feeds**: Atom and RSS, auto-generated
- **No JavaScript** — pure static HTML/CSS site

## Directory Structure

```
bold-casa/
├── content/              # Markdown content (blog posts, pages)
│   ├── blog/             # Blog section (sorted by date, paginated)
│   │   ├── _index.md     # Section config (sort_by, paginate_by)
│   │   └── *.md          # Individual posts
│   └── projects/         # Projects section
│       └── _index.md     # Section config
├── templates/            # Tera/Jinja2 templates
│   ├── base.html         # Master layout (nav, footer, head, meta)
│   ├── index.html        # Homepage
│   ├── page.html         # Single post/page
│   ├── section.html      # Section listing (blog index, projects index)
│   ├── taxonomy_list.html
│   └── taxonomy_single.html
├── sass/
│   └── style.scss        # All styles (dark theme, CSS custom properties)
├── static/               # Copied as-is to public/
│   ├── llms.txt          # AI/LLM crawler info
│   └── robots.txt        # Crawler permissions
├── scripts/
│   └── test.sh           # Build validation & test suite
├── config.toml           # Zola site configuration
└── public/               # Build output (gitignored)
```

## Commands

### Build the site
```bash
zola build
```
Output goes to `public/`.

### Local development server
```bash
zola serve
```
Serves at `http://127.0.0.1:1111` with live reload.

### Run tests
```bash
bash scripts/test.sh
```
This builds the site, then validates: HTML files, CSS output, feeds (atom.xml, rss.xml, sitemap.xml), static assets (llms.txt, robots.txt), JSON-LD structured data, meta descriptions, and Open Graph tags. Exits non-zero on failure.

### Check links
```bash
zola check
```
Validates internal and external links (external may fail due to DNS/network).

## Content Conventions

### Blog post frontmatter format
```toml
+++
title = "Post Title Here"
date = 2026-02-06
description = "Short description for SEO and previews."
[taxonomies]
tags = ["lowercase", "hyphenated-tags"]
[extra]
og_image = ""
+++
```

- **Frontmatter**: Always TOML (`+++` delimiters), never YAML
- **Dates**: ISO format `YYYY-MM-DD`
- **Tags**: Lowercase, hyphenated (e.g., `ai-infrastructure`, `building-in-public`)
- **Descriptions**: Short, one-sentence summaries for meta tags and previews
- **New posts**: Create as `content/blog/slug-name.md`
- **Sections**: Each directory under `content/` needs a `_index.md` with section config

### Writing style
- Technical, first-person, conversational tone
- Long-form posts with detailed debugging narratives
- Use `---` for section dividers
- Anchor links for internal navigation within posts
- Code blocks with language hints for syntax highlighting (Dracula theme)

## Template Conventions

- Templates use Tera syntax (similar to Jinja2)
- Inheritance chain: all templates extend `base.html` via `{% extends "base.html" %}`
- Override blocks: `content`, `title`, `description`, `structured_data`, `og_title`, `og_description`, `og_type`, `og_url`
- Use `get_url(path=...)` for internal links, `get_section(path=...)` for section queries
- Every page type includes JSON-LD structured data and Open Graph meta tags

## Styling Conventions

- **Single SCSS file**: `sass/style.scss` — no partials or imports
- **Dark theme by default**: Background `#0d1117`, accent `#f0883e` (orange), links `#58a6ff` (blue)
- **CSS custom properties** (variables) defined on `:root` for colors and layout
- **Max content width**: 720px, centered
- **Responsive breakpoint**: 600px (mobile)
- **Class naming**: BEM-lite (e.g., `post-preview`, `site-nav`, `post-content`, `nav-links`)
- **System font stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`

## Configuration (config.toml)

Key settings:
- `base_url = "https://bold.casa"`
- `compile_sass = true` — SCSS auto-compilation
- `generate_feeds = true` — Atom + RSS
- `minify_html = true` — production HTML minification
- `build_search_index = true`
- `highlight_theme = "dracula"` — code block syntax theme
- Taxonomies: `tags` and `categories` (both with feeds)
- Author metadata in `[extra]`: name, email, GitHub username

## SEO Checklist (enforced by test.sh)

Every page must include:
- JSON-LD structured data (`<script type="application/ld+json">`)
- `<meta name="description">` tag
- Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`)
- Atom and RSS feed `<link>` tags (in base.html)

## Things to Know

- **No package manager**: Zola is a single binary. No `npm install` or similar needed.
- **Build output is gitignored**: `public/` is in `.gitignore`; never commit it.
- **No `.env` needed**: Configuration is static in `config.toml`. `.env` is gitignored as a precaution.
- **llms.txt**: A machine-readable file in `static/` describing the site for AI crawlers. Update it when site scope changes.
- **robots.txt**: Explicitly allows AI crawlers (GPTBot, Claude-Web, etc.). Located in `static/`.
- **Test script must pass**: Always run `bash scripts/test.sh` after making changes to templates, config, or content to catch missing meta tags, broken feeds, or empty pages.
