# Tasks: Design System (Blueprint Lab v5)

**Input**: Design documents from `/specs/006-design-system/`
**Prerequisites**: plan.md, spec.md, research.md

**Organization**: Tasks follow the plan's 5 phases, mapped to spec 006's 3 user stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1=Visual Consistency, US2=Responsive Layout, US3=Dark/Light Contrast

---

## Phase 1: Setup

**Purpose**: Prepare the new CSS file scaffold and config switchover

- [ ] T001 Create `static/custom-v5.css` with section comment skeleton (15 sections per plan architecture) in `static/custom-v5.css`
- [ ] T002 Update `config.toml` to reference `custom-v5.css` instead of `custom-v4.css` — change `stylesheets = ["custom-v4.css"]` to `stylesheets = ["custom-v5.css"]` in `config.toml`
- [ ] T003 Update `scripts/test.sh` if it hardcodes `custom-v4.css` filename — grep for "custom-v4" and replace with "custom-v5" in `scripts/test.sh`

**Checkpoint**: `zola build` succeeds with empty custom-v5.css (site renders with tabi defaults + monochrome skin only)

---

## Phase 2: Foundational — Design Tokens

**Purpose**: Define the token system that all component sections depend on

**⚠️ CRITICAL**: No component styling can begin until tokens are defined

- [ ] T004 [US1] Write Section 1 (dark mode tokens) in `static/custom-v5.css` — override tabi variables (`--background-color`, `--bg-0`, `--bg-2`, `--text-color`, `--text-color-high-contrast`, `--meta-color`, `--divider-color`, `--hover-color`) plus Blueprint Lab decorative tokens (`--blueprint-accent`, `--accent-cyan`, `--accent-amber`, `--accent-green`, `--grid-line`, `--radius-sm/md/lg`, `--shadow-card`, `--shadow-card-hover`, `--measure`) in `:root, [data-theme="dark"]` block
- [ ] T005 [US3] Write Section 2 (light mode tokens) in `static/custom-v5.css` — define `[data-theme="light"]` block with all token overrides per plan (background #f8fafc, text #1a1f2e, primary #2563eb, grid-line with reduced opacity, accent variants for light backgrounds)

**Checkpoint**: Both theme token sets defined. `zola build` succeeds. Theme toggle switches tokens correctly.

---

## Phase 3: User Story 1 — Visual Consistency (Priority: P1) 🎯 MVP

**Goal**: A reader experiences a consistent "field manual / schematic" aesthetic across all pages — dark background, blue accent tones, monospace metadata, grid texture.

**Independent Test**: Build site, navigate all pages. Grid texture visible on body, corner marks on hero, SPEC badges on cards, monospace metadata, consistent accent colors.

### Implementation for User Story 1

- [ ] T006 [US1] Write Section 3 (global/grid texture) in `static/custom-v5.css` — body background with grid lines using `var(--grid-line)`, `::selection` styling, content/navbar/footer max-width and margin-inline
- [ ] T007 [US1] Write Section 4 (typography) in `static/custom-v5.css` — h1/h2 letter-spacing and weight, paragraph line-height and color via `var(--meta-color)`, editorial measure constraint (`max-width: var(--measure)`) on body content
- [ ] T008 [US1] Write Section 5 (navigation) in `static/custom-v5.css` — `.navbar` border-bottom, `.home-title` weight/tracking, `.nav-links` color and hover state (single definition)
- [ ] T009 [US1] Write Section 6 (hero/home banner) in `static/custom-v5.css` — `#banner-container-home` border/radius/padding/background with ruled-line texture, `::before`/`::after` corner marks using `var(--blueprint-accent)`, `#home-banner-header` clamp sizing, `#image-container-home { display: none }`
- [ ] T010 [P] [US1] Write Section 7 (chips/tags) in `static/custom-v5.css` — unified chip styles for `.hero-tags .tag`, `.filter-controls .taxonomy-item a`, `.meta .tag a`, `.tags .tag` — single base rule + single `:hover`/`:focus-visible` rule + single `.active` rule. Use `var(--bg-0)` for base bg, `var(--primary-color)` concepts for hover
- [ ] T011 [P] [US1] Write Section 8 (cards) in `static/custom-v5.css` — `.card` border/radius/background/shadow/transition, `.card::before` SPEC badge using `var(--accent-amber)`, `.card:hover` lift + border-color + shadow change, `.card-title`/`.card-description` colors using tabi variables, `.card-image` aspect-ratio
- [ ] T012 [US1] Write Section 9 (blog list) in `static/custom-v5.css` — `.bloglist-meta`/`time` monospace font-family, link styling within blog list content
- [ ] T013 [US1] Write Section 10 (section/page framing) in `static/custom-v5.css` — title-container/article-title `::after` rule motif, `.admonition.info` cyan accent border, metadata monospace styling
- [ ] T014 [US1] Write Section 11 (links) in `static/custom-v5.css` — `a` base color via `var(--primary-color)`, `.content a:not(.tag):not(.card):not(.nav-links)` underline on hover, `:focus-visible` outline styling
- [ ] T015 [US1] Write Section 12 (footer) in `static/custom-v5.css` — `footer` border-top, `.credits` opacity

**Checkpoint**: Site renders with full Blueprint Lab aesthetic in dark mode. All component families styled. No `!important`. `zola build` succeeds.

---

## Phase 4: User Story 2 — Responsive Layout (Priority: P1)

**Goal**: Mobile reader has fully functional experience — readable content, accessible navigation, no horizontal scrolling.

**Independent Test**: Playwright captures at 375px show no horizontal overflow, cards stacked, nav functional, text readable.

### Implementation for User Story 2

- [ ] T016 [US2] Write Section 13 (responsive ≤768px) in `static/custom-v5.css` — content/navbar/footer max-width 94vw, banner padding reduction, header font-size reduction, card-title size reduction, filter-controls horizontal scroll with `overflow-x: auto`
- [ ] T017 [US2] Write Section 14 (responsive ≤640px) in `static/custom-v5.css` — full-width content with inline padding, banner compact mode, smaller chip/tag sizing, single-column cards (`grid-template-columns: 1fr`), blog list compact spacing, footer centering
- [ ] T018 [US2] Write Section 15 (accessibility/reduced-motion) in `static/custom-v5.css` — `@media (prefers-reduced-motion: reduce)` disable animations/transitions/smooth-scroll (only section where `!important` is allowed)
- [ ] T019 [US2] Add `@container` query for cards in Section 8 — card-title/description font-size adjustment at `max-width: 820px` container width
- [ ] T020 [US2] Add `@supports (grid-template-rows: masonry)` progressive enhancement for cards grid in Section 8

**Checkpoint**: Site is fully responsive at 375px, 768px, 1440px. No horizontal overflow at any viewport. Cards stack on mobile, grid on desktop.

---

## Phase 5: User Story 3 — Dark/Light Mode Contrast (Priority: P2)

**Goal**: Both modes provide sufficient contrast with accent colors remaining legible.

**Independent Test**: Toggle theme. Light mode: card titles dark on white, links visible blue, chips readable. Dark mode: all text legible, links distinguishable from body text.

### Implementation for User Story 3

- [ ] T021 [US3] Verify and adjust light mode token values in Section 2 against rendered output — check card title visibility (must NOT be near-white on light bg), link contrast, chip readability
- [ ] T022 [US3] Add any light-mode-specific component overrides needed in relevant sections — e.g., `[data-theme="light"] .card-title` if tabi's default doesn't provide sufficient contrast with our custom `--bg-2`
- [ ] T023 [US3] Verify grid texture appearance in light mode — `--grid-line` opacity may need tuning to be subtle but visible on light background

**Checkpoint**: Theme toggle works. Both modes pass visual contrast checks. Card titles visible in both modes.

---

## Phase 6: Automated Visual Verification (Playwright)

**Purpose**: Automated regression testing across all pages, viewports, and themes

- [ ] T024 Start `zola serve` in background on port 1111
- [ ] T025 Install Playwright browser if needed via `mcp__plugin_playwright_playwright__browser_install`
- [ ] T026 Create screenshot output directory at `specs/006-design-system/screenshots/`
- [ ] T027 Run Playwright test matrix: 4 pages × 3 viewports × 2 themes = 24 captures with automated checks (overflow, link contrast, card title visibility, grid texture, content measure) — save screenshots to `specs/006-design-system/screenshots/`
- [ ] T028 Review Playwright results — fix any failures found, re-run affected captures
- [ ] T029 Kill `zola serve` background process

**Checkpoint**: All 24 captures pass automated checks. Screenshots available for manual review.

---

## Phase 7: Polish & Cleanup

**Purpose**: Remove dead files, run final validation

- [ ] T030 Delete `static/custom.css` (dead weight — not loaded, identical base to v4)
- [ ] T031 Delete `static/custom-v4.css` (replaced by v5)
- [ ] T032 Run `scripts/test.sh` — all checks must pass (build, HTML structure, feeds, discovery files, CSS presence)
- [ ] T033 Final `zola build` and verify `public/custom-v5.css` exists in output
- [ ] T034 Update spec 006 entity references from `custom-v4.css` to `custom-v5.css` in `.specify/specs/006-design-system/spec.md`

**Checkpoint**: Clean repo. No dead CSS files. All tests pass. Spec updated.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Tokens)**: Depends on T001 (file exists)
- **Phase 3 (US1 Visual)**: Depends on Phase 2 (tokens defined)
- **Phase 4 (US2 Responsive)**: Depends on Phase 3 (components exist to make responsive)
- **Phase 5 (US3 Contrast)**: Depends on Phase 2 (both token sets) + Phase 3 (components to verify)
- **Phase 6 (Playwright)**: Depends on Phases 3-5 (all CSS complete)
- **Phase 7 (Cleanup)**: Depends on Phase 6 (verification passed)

### User Story Dependencies

- **US1 (Visual Consistency)**: Depends on tokens (Phase 2). Core work — must complete first.
- **US2 (Responsive)**: Depends on US1 (need component styles before making them responsive)
- **US3 (Contrast)**: Can partially overlap with US1 (light token definition T005 is in Phase 2), but verification (T021-T023) needs components to exist

### Parallel Opportunities

Within Phase 3 (US1):
- T010 (chips) and T011 (cards) can run in parallel — different selectors, different sections
- T006 (global), T007 (typography), T008 (nav) are sequential since they share the file, but each section is independent

Within Phase 6 (Playwright):
- Individual viewport/theme captures could be parallelized but Playwright MCP is single-browser

---

## Implementation Strategy

### MVP (Phase 1-3 only)

1. Setup → Tokens → Visual Consistency components
2. **STOP and VALIDATE**: Site renders with Blueprint Lab aesthetic in dark mode
3. This alone fixes the 796-line CSS mess and delivers spec 006 FR-001 through FR-008

### Full Delivery (Phase 1-7)

1. MVP (above)
2. Add responsive rules (US2) → site works on mobile
3. Add light mode polish (US3) → both themes work
4. Playwright verification → automated proof
5. Cleanup → production ready

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 34 |
| Phase 1 (Setup) | 3 |
| Phase 2 (Tokens) | 2 |
| Phase 3 (US1 Visual) | 10 |
| Phase 4 (US2 Responsive) | 5 |
| Phase 5 (US3 Contrast) | 3 |
| Phase 6 (Playwright) | 6 |
| Phase 7 (Cleanup) | 5 |
| Parallel opportunities | T010+T011 (chips/cards) |
| MVP scope | Phases 1-3 (15 tasks) |
