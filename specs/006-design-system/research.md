# Research: Design System (Blueprint Lab v3) Rewrite

**Date:** 2026-02-10
**Feature:** 006-design-system
**Status:** Complete

## Decision 1: Variable System Strategy

**Decision:** Adopt tabi's native CSS custom properties as the primary token system. Remap Blueprint Lab's custom tokens (`--bg`, `--accent-blue`, etc.) to override tabi's variables (`--background-color`, `--primary-color`, etc.) rather than creating a parallel system.

**Rationale:** The monochrome skin only overrides `--primary-color`. If custom-v4 bypasses `--primary-color` with hardcoded values, the skin has no effect on custom-styled components. Aligning with tabi's variable names means skins work automatically.

**Alternatives considered:**
- Keep parallel token system (current approach) — rejected because it breaks skin compatibility and requires double-maintenance
- Override tabi's SCSS variables at source — rejected because constitution Principle IV prohibits forking the theme

## Decision 2: Specificity Strategy

**Decision:** Eliminate all `!important` declarations except within `@media (prefers-reduced-motion)`. Use tabi's established specificity levels (`.component`, `[data-theme="dark"] .component`) instead of escalating override chains.

**Rationale:** The current file has 66 `!important` declarations across 5 cascading override passes. Each pass was a band-aid on the previous. A single-pass architecture with correct specificity eliminates the need for `!important`.

**Alternatives considered:**
- Keep `!important` for "critical" overrides only — rejected because any `!important` invites more
- Use `@layer` CSS cascade layers — rejected as overkill for a single override file

## Decision 3: Light Mode Strategy

**Decision:** Define light-mode tokens for all components using `html[data-theme="light"]` selectors. Current light mode only covers chips and cards (10 lines out of 796). Every dark-mode custom color needs a light-mode counterpart.

**Rationale:** Light mode is currently broken — card titles use #f3f7ff (near-white) which is invisible on light backgrounds. The constitution says both modes should be supported (Spec 006 FR-002).

**Alternatives considered:**
- Drop light mode entirely (dark-only site) — rejected because tabi supports it and the theme switcher is enabled
- Use tabi's light defaults without customization — rejected because it would create a jarring mismatch between custom dark components and default light ones

## Decision 4: File Structure

**Decision:** Create `static/custom-v5.css` as a clean rewrite. Delete `static/custom.css` (dead weight). Update `config.toml` to reference `custom-v5.css`. Keep `custom-v4.css` in repo temporarily for A/B comparison during development.

**Rationale:** Constitution Principle IV mandates a single CSS file. The v5 naming signals a clean break from the accumulated triage in v4.

**Alternatives considered:**
- Edit custom-v4.css in-place — rejected because the file is so tangled that surgical editing risks missing conflicts
- Split into multiple CSS files — rejected by constitution (single file mandate)

## Audit Findings Summary

### Current State: custom-v4.css (796 lines)

**Selector Duplication:**
| Selector Family | Definitions | Dead Code |
|-----------------|-------------|-----------|
| `.card` variants | 12 | 4 |
| `.filter-controls .taxonomy-item a` | 10 | 3 |
| `a:hover` variants | 14 | 5+ |
| `.nav-links` | 4 | 1 |
| `.tag` / `.tags` | 8 | 2 |
| **Total redundant blocks** | **48** | **15+** |

**`!important` count:** 66 declarations

**Override cascade:** 5 passes
1. Blueprint Lab v3 base (lines 1-408) — defines custom tokens and component styles
2. V4 contrast lock (lines 410-454) — redefines via CSS variables
3. HOTFIX dark-mode (lines 471-507) — hardcoded overrides
4. Accent pass (lines 509-572) — yet more dark-mode specifics
5. Global hover normalization (lines 700-795) — kill-switch for all interactive states

**Light mode coverage:** 10 lines (chips and cards only). Card titles, links, tags, nav — all missing.

### Tabi Theme Architecture

**Variable system:** `--background-color`, `--bg-0` through `--bg-3`, `--primary-color`, `--text-color`, `--text-color-high-contrast`, `--meta-color`, `--divider-color`, `--hover-color`

**Dark/light mechanism:** `@mixin theme-variables($theme)` in SCSS, applied via:
- `:root` → light defaults
- `[data-theme='dark']` → explicit dark
- `@media (prefers-color-scheme: dark) :root:not([data-theme='light'])` → system preference fallback

**Component classes used by custom CSS:**
- Cards: `.cards`, `.card`, `.card-info`, `.card-image`, `.card-description`, `.filter-controls`, `.taxonomy-item`
- Tags: `.tag`, `.tags`, `.bloglist-tags`
- Navigation: `.navbar`, `.nav-links`, `.home-title`, `.nav-navs`
- Hero: `#banner-container-home`, `#home-banner-header`, `#banner-home-subtitle`, `#image-container-home`
- Blog list: `.bloglist-container`, `.bloglist-meta`, `.bloglist-content`, `.bloglist-title`
- Footer: `footer`, `.credits`, `.socials`

**Monochrome skin:** Overrides ONLY `--primary-color` (light: #727272, dark: #b3b3b3). All other colors inherit from tabi defaults.

**CSS load order:** font subset → main.css → extra stylesheets (custom-v5.css) → skin (monochrome.css)

### Mapping: Blueprint Lab Tokens → Tabi Variables

| Blueprint Lab (custom) | Tabi Native | Notes |
|------------------------|-------------|-------|
| `--bg: #0f1217` | `--background-color` | Override tabi's dark bg |
| `--surface: #151a22` | `--bg-0` | Lighter surface |
| `--surface-2: #1a2130` | `--bg-2` | Card/widget bg |
| `--text: #e8edf5` | `--text-color` | Override tabi's dark text |
| `--muted: #a8b3c5` | `--meta-color` | Secondary text |
| `--line: rgba(...)` | `--divider-color` | Dividers/borders |
| `--accent-blue: #8bc2ff` | `--primary-color` | Main accent (but conflicts with monochrome skin!) |
| `--accent-cyan: #6fd6de` | (no equivalent) | Keep as custom token |
| `--accent-amber: #f3bd66` | (no equivalent) | Keep as custom token |
| `--accent-green: #96cfa8` | (no equivalent) | Keep as custom token |

**Key insight:** `--accent-blue` should NOT override `--primary-color` because the monochrome skin sets `--primary-color` to gray. Instead, use `--primary-color` where tabi expects it (links, buttons, hover states) and reserve `--accent-blue` for Blueprint Lab-specific decorative elements (grid texture, corner marks, etc.).
