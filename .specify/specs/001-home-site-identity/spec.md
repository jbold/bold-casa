# Feature Specification: Home Page & Site Identity

**Feature Branch**: `001-home-site-identity`
**Created**: 2026-02-10
**Status**: Baseline (documenting existing feature)
**Constitution Refs**: Principles I (Content-First), II (Fast and Light), III (AI-Discoverable)

## User Scenarios & Testing

### User Story 1 - First-Time Visitor Orientation (Priority: P1)

A new visitor lands on bold.casa and immediately understands who John Rembold is, what he builds, and how to explore the site. The hero section communicates identity and expertise without requiring a scroll.

**Why this priority**: The home page is the primary entry point. If a visitor can't quickly orient, they bounce.

**Independent Test**: Build the site and verify that `public/index.html` contains the hero header title, philosophy statement, toolkit tags, and navigation links.

**Acceptance Scenarios**:

1. **Given** a visitor loads the home page, **When** the page renders, **Then** a hero header displays the title "Builder. Operator. Inventor." with the site image and alt text.
2. **Given** a visitor views the home page, **When** they look below the hero, **Then** they see a one-line philosophy statement ("Take it apart. Understand how it works. Build it better.") and toolkit tags (Rust, Linux/Silverblue, TypeScript, LLM Agents, Ops+Monitoring, Hardware).
3. **Given** a visitor views the home page, **When** they look for navigation, **Then** inline links to "See Projects" and "What I'm doing now" are visible in the body content.

---

### User Story 2 - Recent Content Surfacing (Priority: P1)

A returning visitor sees the most recent blog posts on the home page without navigating to `/blog/`, enabling quick catch-up on new content.

**Why this priority**: Surfacing recent content drives engagement and makes the site feel alive.

**Independent Test**: Publish a new blog post, rebuild, and verify it appears on the home page.

**Acceptance Scenarios**:

1. **Given** the site has blog posts, **When** the home page renders, **Then** up to 5 most recent posts are displayed below the main content, sorted by date (newest first).
2. **Given** the site has fewer than 5 blog posts, **When** the home page renders, **Then** all existing posts are displayed without errors or empty space.
3. **Given** a new blog post is published, **When** the site rebuilds, **Then** the new post appears at the top of the home page list.

---

### User Story 3 - Site Navigation (Priority: P1)

A visitor can reach any major section of the site from the persistent navigation menu on every page.

**Why this priority**: Navigation is the backbone of site usability. Broken or missing nav items strand visitors.

**Independent Test**: Load any page and verify the navigation menu contains exactly: Now, Projects, Blog (in that order).

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they view the navigation menu, **Then** they see menu items in this order: Now, Projects, Blog.
2. **Given** a visitor clicks "Blog" in the nav, **When** the page loads, **Then** they arrive at `/blog/`.
3. **Given** a visitor clicks "Projects" in the nav, **When** the page loads, **Then** they arrive at `/projects/`.

---

### User Story 4 - Dark Mode Default with Toggle (Priority: P2)

The site defaults to dark mode (matching the workshop/technical aesthetic) but provides a toggle for visitors who prefer light mode.

**Why this priority**: Dark mode is a UX preference, not a functional requirement. The site works fine in either mode.

**Independent Test**: Load the site fresh and verify dark theme is active; toggle to light and verify it switches.

**Acceptance Scenarios**:

1. **Given** a first-time visitor loads the site, **When** no theme preference is stored, **Then** the site renders in dark mode.
2. **Given** a visitor clicks the theme toggle, **When** the theme switches, **Then** all pages reflect the new theme immediately.

---

### Edge Cases

- What happens if the hero image (`img/seedling.png`) fails to load? The alt text "bold.casa" should display as fallback.
- What happens with 0 blog posts? The home page should render without errors, showing no post list.
- What happens if `section_path = "blog/_index.md"` is misconfigured? The build should fail with a clear Zola error.

## Requirements

### Functional Requirements

- **FR-001**: Home page MUST display a hero header with `title`, `img`, and `img_alt` from the `[extra.header]` config in `content/_index.md`.
- **FR-002**: Home page MUST display up to `max_posts` (currently 5) recent blog entries, pulled from the section defined by `section_path`.
- **FR-003**: Navigation menu MUST contain exactly three items in order: Now (`/now/`), Projects (`/projects/`), Blog (`/blog/`), as defined in `config.toml [extra] menu`.
- **FR-004**: Navigation menu MUST use trailing slashes on all URLs.
- **FR-005**: Social links section MUST display a GitHub profile link to `https://github.com/jbold`.
- **FR-006**: Theme switcher MUST be enabled (`theme_switcher = true`) with dark as the default theme (`default_theme = "dark"`).
- **FR-007**: The site title MUST be "bold.casa" and the description MUST be "Workshop of John Rembold — builder, maker, inventor."

### Key Entities

- **Home Page Config** (`content/_index.md`): Controls hero header, section path for recent posts, max post count.
- **Site Config** (`config.toml`): Controls title, description, menu items, social links, theme settings.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Home page loads and displays hero, navigation, and recent posts in a single `zola build` without errors.
- **SC-002**: Navigation menu items match the exact order and URLs defined in config.toml.
- **SC-003**: Recent posts section shows the correct number of posts (up to `max_posts`).
- **SC-004**: `scripts/test.sh` validates JSON-LD, meta description, and OG tags are present on `public/index.html`.
