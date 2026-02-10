# Feature Specification: Blog System

**Feature Branch**: `002-blog-system`
**Created**: 2026-02-10
**Status**: Baseline (documenting existing feature)
**Constitution Refs**: Principles I (Content-First), III (AI-Discoverable), IV (Low Maintenance)

## User Scenarios & Testing

### User Story 1 - Read a Blog Post (Priority: P1)

A reader navigates to a blog post and reads well-formatted technical content with syntax-highlighted code blocks, a reading time estimate, and the publication date.

**Why this priority**: Reading individual posts is the core purpose of the blog. Everything else supports this.

**Independent Test**: Navigate to any blog post URL and verify that code blocks use Dracula highlighting, reading time is shown, date is shown, and smart punctuation renders correctly.

**Acceptance Scenarios**:

1. **Given** a reader navigates to a blog post, **When** the page renders, **Then** the title, date, and estimated reading time are displayed.
2. **Given** a blog post contains fenced code blocks, **When** the page renders, **Then** code blocks use the Dracula syntax highlighting theme.
3. **Given** a blog post contains straight quotes or dashes, **When** the page renders, **Then** smart punctuation converts them to curly quotes and em-dashes.
4. **Given** a blog post contains external links, **When** the reader clicks one, **Then** it opens in a new tab with `rel="noreferrer"`.

---

### User Story 2 - Browse Blog Posts (Priority: P1)

A reader browses all blog posts in reverse chronological order with pagination, finding content that interests them.

**Why this priority**: Browsability is essential for content discovery beyond the home page.

**Independent Test**: Navigate to `/blog/` and verify posts are date-sorted with 5-per-page pagination.

**Acceptance Scenarios**:

1. **Given** a reader navigates to `/blog/`, **When** the section page renders, **Then** posts are listed in reverse chronological order (newest first).
2. **Given** more than 5 blog posts exist, **When** the reader views `/blog/`, **Then** only 5 posts are shown with pagination controls to access older posts.
3. **Given** fewer than 5 blog posts exist, **When** the reader views `/blog/`, **Then** all posts are shown without pagination controls.

---

### User Story 3 - Filter by Tag (Priority: P2)

A reader filters posts by topic tags to find content about a specific subject.

**Why this priority**: Tags add navigability but aren't essential for basic reading.

**Independent Test**: Click a tag on any post and verify it shows all posts with that tag.

**Acceptance Scenarios**:

1. **Given** a reader views a blog post with tags, **When** they click a tag, **Then** they see a filtered list of all posts with that tag.
2. **Given** a tag taxonomy page exists, **When** a reader views it, **Then** an RSS/Atom feed is available for that tag.

---

### User Story 4 - Subscribe via Feed (Priority: P2)

A reader or feed aggregator subscribes to the blog via standard Atom or RSS feeds.

**Why this priority**: Feeds are critical for distribution but don't affect the on-site reading experience.

**Independent Test**: Fetch `/atom.xml` and `/rss.xml` and validate they contain all published posts.

**Acceptance Scenarios**:

1. **Given** the site is built, **When** a client fetches `/atom.xml`, **Then** a valid Atom feed is returned containing all blog posts.
2. **Given** the site is built, **When** a client fetches `/rss.xml`, **Then** a valid RSS feed is returned containing all blog posts.
3. **Given** a new post is published, **When** the site rebuilds, **Then** the new post appears in both feeds.

---

### User Story 5 - Nosh Companion Metadata (Priority: P3)

An AI agent consuming a blog post gets structured Nosh metadata embedded in the TOML front matter (and optionally as a companion `.nosh` file), enabling knowledge extraction without HTML parsing.

**Why this priority**: Nosh is an emerging format. Not all posts have it yet — it's additive, not mandatory.

**Independent Test**: Check that posts with `[extra.nosh]` front matter contain valid structured content (type, language, body, key_points/key_findings). Check that `.nosh` companion files parse as valid JSON.

**Acceptance Scenarios**:

1. **Given** a blog post has an `[extra.nosh]` section in front matter, **When** the site builds, **Then** the Nosh metadata is available for template rendering (type, language, content.body, content.key_points or content.key_findings).
2. **Given** a blog post has a companion `.nosh` file (e.g., `post-name.nosh`), **When** the file is fetched, **Then** it parses as valid JSON with `nosh_version`, `content_type`, and `content` fields.
3. **Given** a blog post has no Nosh metadata, **When** the site builds, **Then** the post renders normally without errors.

---

### Edge Cases

- What happens if a post has no `description` in front matter? Meta description and OG tags may be empty — this should be caught by test.sh.
- What happens if a post has no tags? The post should render without a tag section.
- What happens if a `.nosh` companion file contains invalid JSON? This should be caught by test validation.
- What happens if `paginate_by` is set to 0? Zola should error at build time.

## Requirements

### Functional Requirements

- **FR-001**: Blog section MUST be sorted by date (newest first), paginated by 5 posts per page.
- **FR-002**: Each blog post MUST have TOML front matter with at minimum: `title`, `date`, `description`.
- **FR-003**: Each blog post SHOULD have `[taxonomies] tags` for topic categorization.
- **FR-004**: Code blocks MUST use the Dracula highlight theme (`highlight_theme = "dracula"`).
- **FR-005**: Smart punctuation MUST be enabled (`smart_punctuation = true`).
- **FR-006**: External links MUST open in a new tab (`external_links_target_blank = true`) with no referrer (`external_links_no_referrer = true`).
- **FR-007**: Tag taxonomy MUST generate per-tag feeds (`feed = true` on tags taxonomy).
- **FR-008**: The site MUST generate both `atom.xml` and `rss.xml` feed files.
- **FR-009**: Posts with `[extra.nosh]` front matter MUST include `type` and `language` fields at minimum.
- **FR-010**: Companion `.nosh` files MUST be valid JSON.
- **FR-011**: The blog section MUST use `section.html` as the section template and `page.html` as the page template.

### Key Entities

- **Blog Post** (Markdown file in `content/blog/`): Title, date, description, tags, optional Nosh metadata, optional companion `.nosh` file.
- **Blog Section** (`content/blog/_index.md`): Sort order, pagination config, template assignments.
- **Tag Taxonomy**: Auto-generated tag index pages with per-tag feeds.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All blog posts build without errors and produce non-empty HTML files.
- **SC-002**: JSON-LD structured data is present on every blog post page.
- **SC-003**: Meta descriptions and Open Graph tags are present on every blog post page.
- **SC-004**: `atom.xml` and `rss.xml` are generated and non-empty.
- **SC-005**: All `.nosh` companion files parse as valid JSON.
- **SC-006**: `zola check` reports no broken internal links across blog posts.
