# Feature Specification: Design System (Blueprint Lab v3)

**Feature Branch**: `006-design-system`
**Created**: 2026-02-10
**Status**: Baseline (documenting existing feature)
**Constitution Refs**: Principles I (Content-First), II (Fast and Light), IV (Low Maintenance)

## User Scenarios & Testing

### User Story 1 - Visual Consistency (Priority: P1)

A reader experiences a consistent "field manual / schematic" aesthetic across all pages — dark background, blue accent tones, monospace-influenced typography, and a grid texture that evokes a technical workshop.

**Why this priority**: Visual consistency is what distinguishes a designed site from a default theme. It communicates professionalism and attention to detail.

**Independent Test**: Verify that `custom-v4.css` is loaded on every page and that CSS custom properties for all design tokens are defined in `:root`.

**Acceptance Scenarios**:

1. **Given** a visitor loads any page, **When** the page renders, **Then** the custom design system (`custom-v4.css`) is applied on top of the tabi base theme.
2. **Given** the design system is loaded, **When** the page renders in dark mode, **Then** the background shows a subtle grid texture with blue-tinted lines.
3. **Given** the design system defines tokens, **When** any component renders, **Then** it uses CSS custom properties (`--bg`, `--surface`, `--text`, `--accent-blue`, etc.) rather than hardcoded values.

---

### User Story 2 - Responsive Layout (Priority: P1)

A mobile reader has a fully functional experience — content is readable, navigation is accessible, and cards/images adapt to smaller screens without horizontal scrolling.

**Why this priority**: Mobile is a significant portion of web traffic. A broken mobile experience loses readers.

**Independent Test**: Load the site at 375px viewport width and verify content is readable, no horizontal overflow occurs, and navigation is functional.

**Acceptance Scenarios**:

1. **Given** a visitor on a mobile device, **When** they load any page, **Then** content fits within the viewport without horizontal scrolling.
2. **Given** the design system defines `--measure: 68ch`, **When** content renders, **Then** paragraph width never exceeds 68 characters on desktop.
3. **Given** a visitor views the projects page on mobile, **When** the cards render, **Then** they stack vertically in a single column.

---

### User Story 3 - Dark/Light Mode Contrast (Priority: P2)

Both dark and light modes provide sufficient contrast for readability, with accent colors (links, tags, buttons) remaining legible against their respective backgrounds.

**Why this priority**: Contrast affects accessibility. Poor contrast in either mode can make the site unusable for some readers.

**Independent Test**: Verify that the light mode overrides in `[data-theme="light"]` define contrasting values for all key tokens.

**Acceptance Scenarios**:

1. **Given** the site is in dark mode (default), **When** text renders, **Then** primary text (`--text: #e8edf5`) has sufficient contrast against the background (`--bg: #0f1217`).
2. **Given** a visitor switches to light mode, **When** the theme changes, **Then** all tokens update via `[data-theme="light"]` CSS selectors and text remains readable.
3. **Given** link colors use `--accent-blue`, **When** they render in either mode, **Then** they are visually distinct from body text and have hover states.

---

### Edge Cases

- What happens if `custom-v4.css` fails to load (CDN issue)? The tabi base theme should still render a usable (if unstyled) site.
- What happens if a new tabi theme version introduces conflicting CSS? The custom overrides should take precedence due to specificity.
- What happens if a user has `prefers-reduced-motion` set? Smooth scroll should be disabled.

## Requirements

### Functional Requirements

- **FR-001**: Design tokens MUST be defined as CSS custom properties in `:root` for: colors (`--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--line`), accents (`--accent-blue`, `--accent-cyan`, `--accent-amber`, `--accent-green`), spacing (`--s1` through `--s6`), radii (`--radius-sm`, `--radius-md`, `--radius-lg`), shadows (`--shadow-1`, `--shadow-2`), and measure (`--measure: 68ch`).
- **FR-002**: Dark mode MUST be the primary color palette defined in `:root`. Light mode MUST override tokens via `[data-theme="light"]` selectors.
- **FR-003**: The body background MUST display a grid texture using CSS linear and radial gradients with blue-tinted semi-transparent lines.
- **FR-004**: Content width MUST be constrained to `--measure` (68ch) for readability.
- **FR-005**: The design system MUST be contained in a single CSS file (`static/custom-v4.css`) loaded via `config.toml [extra] stylesheets`.
- **FR-006**: Components MUST include: card styles (for projects), tag chips (for toolkit and taxonomy), admonition blocks (for project metadata), hero section (for home page), and code blocks (for blog posts).
- **FR-007**: Link hover states MUST provide visual feedback (color change, underline, or both).
- **FR-008**: The monochrome skin (`skin = "monochrome"`) from tabi MUST be active.

### Key Entities

- **Design Tokens** (CSS custom properties in `:root`): The single source of truth for all visual values.
- **Component Styles** (selectors in `custom-v4.css`): Cards, tags, admonitions, hero, code blocks, buttons, navigation.
- **Theme Overrides** (`[data-theme="light"]`): Light mode token replacements.
- **Config Integration** (`config.toml`): `stylesheets = ["custom-v4.css"]`, `skin = "monochrome"`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `custom-v4.css` is present in the build output and loaded on every page.
- **SC-002**: All design tokens defined in the FR-001 list are present in the CSS file's `:root` block.
- **SC-003**: The CSS file is a single file (not split into multiple imports) to minimize HTTP requests.
- **SC-004**: Dark mode is the default rendering state without JavaScript execution.
