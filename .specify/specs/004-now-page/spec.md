# Feature Specification: Now Page

**Feature Branch**: `004-now-page`
**Created**: 2026-02-10
**Status**: Baseline (documenting existing feature)
**Constitution Refs**: Principles I (Content-First), IV (Low Maintenance)

## User Scenarios & Testing

### User Story 1 - Current Focus (Priority: P1)

A visitor navigates to `/now/` to see what John is currently working on, reading, and focused on — a snapshot of current priorities and activities.

**Why this priority**: The /now page is the single most concise summary of current activity. It answers "what are you doing?" without requiring blog archaeology.

**Independent Test**: Navigate to `/now/` and verify it contains an update date, location, and structured sections for focus areas, reading/learning, and workshop status.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to `/now/`, **When** the page renders, **Then** it displays a "Updated" date and a "Location" line at the top.
2. **Given** a visitor reads the now page, **When** they scan the content, **Then** they find structured sections: current focus (numbered projects/activities), reading/learning, and workshop status.
3. **Given** the now page is updated, **When** the site rebuilds, **Then** the new content is immediately reflected.

---

### User Story 2 - Nownownow.com Convention (Priority: P3)

The page follows the nownownow.com convention, with a footer link explaining the concept for visitors unfamiliar with /now pages.

**Why this priority**: Convention compliance is nice-to-have for community participation but doesn't affect core functionality.

**Independent Test**: Verify the page footer contains a link to `https://nownownow.com/about`.

**Acceptance Scenarios**:

1. **Given** a visitor reads to the bottom of the /now page, **When** they see the footer, **Then** a link to `nownownow.com/about` explains the /now convention.

---

### Edge Cases

- What happens if the now page has no content (empty markdown body)? The page should still render with the title, just no body content.
- What happens if the `path = "now"` is misconfigured? The page would appear at a different URL — test.sh should catch the missing `/now/index.html`.

## Requirements

### Functional Requirements

- **FR-001**: Now page MUST be served at URL path `/now/` (configured via `path = "now"` in front matter).
- **FR-002**: Now page MUST use the `page.html` template.
- **FR-003**: Now page content MUST include a last-updated date and location.
- **FR-004**: Now page content MUST be organized in structured sections (focus, reading/learning, status).
- **FR-005**: Now page MUST include a link to `nownownow.com/about` explaining the convention.

### Key Entities

- **Now Page** (`content/pages/now.md`): A single Markdown file with TOML front matter setting `path = "now"`, containing structured sections about current activities.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `/now/index.html` exists and is non-empty after `zola build`.
- **SC-002**: The page is reachable from the site navigation menu ("Now" as the first menu item).
- **SC-003**: The page contains at least one identifiable section heading (e.g., "The Focus", "Reading", "Workshop").
