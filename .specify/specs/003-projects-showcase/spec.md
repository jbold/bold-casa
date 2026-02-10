# Feature Specification: Projects Showcase

**Feature Branch**: `003-projects-showcase`
**Created**: 2026-02-10
**Status**: Baseline (documenting existing feature)
**Constitution Refs**: Principles I (Content-First), II (Fast and Light)

## User Scenarios & Testing

### User Story 1 - Discover Projects (Priority: P1)

A visitor navigates to the Projects page and sees a visual card layout of all projects with cover images, titles, and descriptions, giving them a quick overview of the breadth of work.

**Why this priority**: The projects page is the primary portfolio — it shows capability and range.

**Independent Test**: Navigate to `/projects/` and verify each project renders as a card with image, title, and description.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to `/projects/`, **When** the page renders, **Then** all projects are displayed as cards using the `cards.html` template.
2. **Given** a project has a `local_image` in its front matter, **When** the card renders, **Then** the project's cover image is displayed.
3. **Given** a project has a `description` in its front matter, **When** the card renders, **Then** the description text is visible on the card.
4. **Given** multiple projects exist, **When** the page renders, **Then** projects are sorted by date (newest first).

---

### User Story 2 - Understand Project Status (Priority: P2)

A visitor clicks into a project page and sees its current status (Active, Prototype, Beta, Stable, Live), tech stack, and role, helping them assess the project's maturity.

**Why this priority**: Status metadata adds context but isn't required to understand the project itself.

**Independent Test**: Navigate to any project page and verify the admonition info block contains Status, Stack, Role, and License fields.

**Acceptance Scenarios**:

1. **Given** a visitor views a project page, **When** the page renders, **Then** an admonition info block is displayed with Status, Stack, Role, and License fields.
2. **Given** a project has status "Active", **When** the visitor reads the info block, **Then** the status shows a green indicator and "Active" text.

---

### User Story 3 - Access Source Code (Priority: P2)

A developer viewing a project page can click directly through to the GitHub repository to browse code, file issues, or contribute.

**Why this priority**: Source access is important for developers but secondary to understanding the project.

**Independent Test**: Navigate to a project page and verify the "View on GitHub" button links to the correct repo URL.

**Acceptance Scenarios**:

1. **Given** a project has a `repo` URL in its front matter, **When** the visitor views the project page, **Then** a "View on GitHub" button links to the repository and opens in a new tab.
2. **Given** a project has tags, **When** the visitor views the project page, **Then** the tags are displayed and clickable.

---

### Edge Cases

- What happens if a project has no cover image (`local_image`)? The card should render with a placeholder or no image, without breaking the layout.
- What happens if a project has no `repo` URL? The "View on GitHub" button should not appear.
- What happens if only one project exists? The card layout should still render correctly.

## Requirements

### Functional Requirements

- **FR-001**: Projects section MUST use the `cards.html` template for the section listing.
- **FR-002**: Projects section MUST be sorted by date (newest first).
- **FR-003**: Each project page MUST have TOML front matter with: `title`, `date`, `description`, `tags`.
- **FR-004**: Each project page SHOULD have `[extra]` fields: `repo` (GitHub URL), `local_image` (cover image path).
- **FR-005**: Each project page MUST contain an HTML admonition info block with Status, Stack, Role, and License metadata. The expected syntax is:
  ```html
  <div class="admonition info">
      <div class="admonition-icon admonition-icon-info"></div>
      <div class="admonition-content">
          <strong class="admonition-title">Specs</strong>
          <ul>
              <li><strong>Status:</strong> [emoji] [Active|Prototype|Beta|Stable|Live]</li>
              <li><strong>Stack:</strong> [comma-separated technologies]</li>
              <li><strong>Role:</strong> [role description]</li>
              <li><strong>License:</strong> [license name]</li>
          </ul>
      </div>
  </div>
  ```
- **FR-006**: Each project page with a `repo` URL MUST display a "View on GitHub" button that opens in a new tab.
- **FR-007**: Reading time MUST be hidden on project pages (`show_reading_time = false` in section config).
- **FR-008**: Project cover images MUST be stored in `static/projects/`.

### Key Entities

- **Project Page** (Markdown file in `content/projects/`): Title, date, description, tags, repo URL, cover image, admonition block with status/stack/role/license.
- **Projects Section** (`content/projects/_index.md`): Card template, sort order, reading time disabled.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All project pages build without errors and produce non-empty HTML files.
- **SC-002**: Every project page contains an admonition info block with Status, Stack, Role, and License fields.
- **SC-003**: The projects section renders as a card grid (not a list) on `/projects/`.
- **SC-004**: Cover images referenced in project front matter exist in `static/projects/`.
