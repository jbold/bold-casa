# Feature Specification: AI Discovery & Machine Readability

**Feature Branch**: `005-ai-discovery`
**Created**: 2026-02-10
**Status**: Baseline (documenting existing feature)
**Constitution Refs**: Principle III (AI-Discoverable) — this spec is the primary implementation of that principle

## User Scenarios & Testing

### User Story 1 - AI Agent Crawlability (Priority: P1)

AI agents (GPTBot, Claude-Web, ChatGPT-User, Anthropic-AI, PerplexityBot, Google-Extended) are explicitly permitted to crawl all pages via named user-agent blocks in `robots.txt`.

**Why this priority**: If AI agents can't crawl the site, none of the other discovery features matter.

**Independent Test**: Fetch `/robots.txt` and verify it contains `Allow: /` for both the default user-agent and all named AI bot user-agents.

**Acceptance Scenarios**:

1. **Given** an AI agent checks `robots.txt`, **When** it parses the file, **Then** it finds `User-agent: *` with `Allow: /`.
2. **Given** GPTBot checks `robots.txt`, **When** it looks for its named block, **Then** it finds `User-agent: GPTBot` with `Allow: /`.
3. **Given** Claude-Web checks `robots.txt`, **When** it looks for its named block, **Then** it finds `User-agent: Claude-Web` with `Allow: /`.
4. **Given** any supported AI bot checks `robots.txt`, **When** it parses the file, **Then** a `Sitemap:` directive points to `https://bold.casa/sitemap.xml`.

---

### User Story 2 - LLM Content Index (Priority: P1)

An AI agent performing discovery finds `/llms.txt` — a concise index of high-signal content, start points, and machine-readable resources, enabling efficient site navigation.

**Why this priority**: `llms.txt` is the AI-equivalent of a site's "about" page — it tells agents where to go first.

**Independent Test**: Fetch `/llms.txt` and verify it contains "Start Here", "High-Signal Posts", "Machine-Readable", and "Scope" sections.

**Acceptance Scenarios**:

1. **Given** an AI agent fetches `/llms.txt`, **When** it parses the file, **Then** it finds a "Start Here" section with links to `/projects/`, `/now/`, and `/blog/`.
2. **Given** an AI agent reads llms.txt, **When** it looks for high-signal content, **Then** it finds a "High-Signal Posts" section with direct links to recommended posts.
3. **Given** an AI agent reads llms.txt, **When** it looks for structured data, **Then** it finds a "Machine-Readable" section listing `.nosh` files and feed URLs.
4. **Given** an AI agent reads llms.txt, **When** it reads the scope, **Then** it understands the site focuses on "practical build logs: AI infrastructure, Linux hardening, operations, and real-world execution."

---

### User Story 3 - JSON-LD Structured Data (Priority: P1)

Search engines and knowledge graphs find JSON-LD structured data (`application/ld+json`) on the home page and all blog posts, enabling rich search results and knowledge extraction.

**Why this priority**: JSON-LD is the standard for structured web data. Without it, search engines treat the site as unstructured content.

**Independent Test**: Build the site and grep for `application/ld+json` in `public/index.html` and all `public/blog/*/index.html` files.

**Acceptance Scenarios**:

1. **Given** the site is built, **When** a search engine parses `public/index.html`, **Then** it finds at least one `<script type="application/ld+json">` tag.
2. **Given** the site is built, **When** a search engine parses any blog post's `index.html`, **Then** it finds at least one `<script type="application/ld+json">` tag.

---

### User Story 4 - SEO Metadata (Priority: P2)

Search engines find meta descriptions and Open Graph tags on the home page and all blog posts, enabling accurate search result snippets and social media previews.

**Why this priority**: SEO metadata improves discoverability but the content works without it.

**Independent Test**: Build the site and grep for `meta name="description"` and `og:title` in key pages.

**Acceptance Scenarios**:

1. **Given** the site is built, **When** a search engine parses the home page, **Then** it finds a `<meta name="description">` tag with the site description.
2. **Given** the site is built, **When** a social platform fetches a blog post URL, **Then** it finds `og:title` Open Graph tags for rich previews.
3. **Given** every blog post has a `description` in its front matter, **When** the site builds, **Then** that description is used for both the meta description and OG description.

---

### User Story 5 - Sitemap (Priority: P2)

Crawlers find a sitemap.xml listing all pages on the site, enabling comprehensive indexing.

**Why this priority**: Sitemaps are a standard crawler aid but not strictly required for a small site.

**Independent Test**: Build the site and verify `public/sitemap.xml` exists and is non-empty.

**Acceptance Scenarios**:

1. **Given** the site is built, **When** a crawler fetches `/sitemap.xml`, **Then** it receives a valid XML sitemap containing URLs for all pages.
2. **Given** `robots.txt` references the sitemap, **When** a crawler reads robots.txt, **Then** it finds `Sitemap: https://bold.casa/sitemap.xml`.

---

### Edge Cases

- What happens if `llms.txt` references a post that has been deleted? The link would 404 — llms.txt must be manually updated when removing high-signal posts.
- What happens if the tabi theme stops generating JSON-LD? test.sh should catch this as a regression.
- What happens if a blog post has no `description`? Meta description and OG tags may render empty — this is a content authoring error that test.sh can flag.

## Requirements

### Functional Requirements

- **FR-001**: `robots.txt` MUST contain `User-agent: *` with `Allow: /`.
- **FR-002**: `robots.txt` MUST contain named user-agent blocks with `Allow: /` for: GPTBot, ChatGPT-User, Claude-Web, Anthropic-AI, PerplexityBot, Google-Extended.
- **FR-003**: `robots.txt` MUST contain a `Sitemap:` directive pointing to `https://bold.casa/sitemap.xml`.
- **FR-004**: `llms.txt` MUST be a static file served at the root (`/llms.txt`), stored in `static/llms.txt`.
- **FR-005**: `llms.txt` MUST contain sections: Start Here, High-Signal Posts, Machine-Readable, and Scope.
- **FR-006**: JSON-LD (`<script type="application/ld+json">`) MUST be present on `index.html` and all blog post pages.
- **FR-007**: Meta description (`<meta name="description">`) MUST be present on `index.html` and all blog post pages.
- **FR-008**: Open Graph tags (`og:title` at minimum) MUST be present on `index.html` and all blog post pages.
- **FR-009**: `sitemap.xml` MUST be generated by `zola build` and be non-empty.
- **FR-010**: Atom feed (`atom.xml`) and RSS feed (`rss.xml`) MUST be generated and contain all blog posts.

### Key Entities

- **robots.txt** (`static/robots.txt`): Static file with crawler permissions and sitemap reference.
- **llms.txt** (`static/llms.txt`): Static file with AI agent discovery index.
- **JSON-LD**: Auto-generated by tabi theme in page `<head>`.
- **Meta/OG Tags**: Auto-generated by tabi theme from front matter `description`.
- **Sitemap**: Auto-generated by Zola.
- **Feeds**: Auto-generated by Zola from `feed_filenames` config.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `robots.txt` is present and contains all 6 named AI bot user-agent blocks.
- **SC-002**: `llms.txt` is present and contains all 4 required sections.
- **SC-003**: JSON-LD is present on home page and 100% of blog post pages.
- **SC-004**: Meta descriptions are present on home page and 100% of blog post pages.
- **SC-005**: OG tags are present on home page and 100% of blog post pages.
- **SC-006**: `sitemap.xml` is generated and non-empty.
- **SC-007**: `atom.xml` and `rss.xml` are generated and non-empty.
