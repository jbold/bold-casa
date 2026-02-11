# Implementation Plan: Design System (Blueprint Lab v5)

**Branch**: `006-design-system` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `.specify/specs/006-design-system/spec.md`

## Summary

Rewrite the design system CSS from scratch as `custom-v5.css`, replacing the 796-line `custom-v4.css` that accumulated 5 override passes, 66 `!important` declarations, 48 redundant selector blocks, and a broken light mode. The new file aligns with tabi's native CSS custom property system so skins (monochrome) work correctly, while preserving the Blueprint Lab aesthetic (dark grid texture, corner marks, card "SPEC" badges, monospace metadata).

## Technical Context

**Language/Version**: CSS3 (no preprocessor — constitution Principle II forbids Node.js toolchain)
**Primary Dependencies**: Tabi theme (git submodule), monochrome skin
**Storage**: N/A (single static CSS file)
**Testing**: `scripts/test.sh` (build validation) + Playwright MCP automated visual regression (screenshots + computed style checks at 375px/768px/1440px across dark/light modes)
**Target Platform**: Desktop + Mobile (Chrome/Chromium — Playwright MCP headless)
**Project Type**: Static site (Zola SSG)
**Performance Goals**: Sub-1s FCP, single CSS file (no additional HTTP requests)
**Constraints**: Single file (`static/custom-v5.css`), no `!important` except reduced-motion, no new template files
**Scale/Scope**: ~300 lines target (down from 796)

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Content-First | PASS | CSS changes only affect presentation, not content structure |
| II. Fast and Light | PASS | Single CSS file, no Node.js, no new dependencies |
| III. AI-Discoverable | PASS | No changes to structured data, feeds, or discovery files |
| IV. Low Maintenance | PASS | Single CSS file override + single template extension (extend_body.html). Theme submodule untouched |
| V. Secure by Default | PASS | No new external resources. CSP unchanged |

**No violations. No complexity tracking needed.**

## Project Structure

### Documentation

```text
specs/006-design-system/
├── plan.md              # This file
├── research.md          # Audit findings + decisions (complete)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (files touched)

```text
static/
├── custom-v5.css        # NEW — clean rewrite (replaces custom-v4.css)
├── custom-v4.css        # KEEP temporarily for A/B comparison, then DELETE
└── custom.css           # DELETE (dead weight, not loaded)

config.toml              # EDIT: stylesheets = ["custom-v5.css"]
scripts/test.sh          # EDIT: update CSS filename check if hardcoded
```

## Architecture: custom-v5.css

### Section Layout (~300 lines target)

```text
/* 1. TOKENS (dark default)              ~25 lines */
/* 2. TOKENS (light mode)                ~15 lines */
/* 3. GLOBAL / GRID TEXTURE              ~20 lines */
/* 4. TYPOGRAPHY                         ~25 lines */
/* 5. NAVIGATION                         ~15 lines */
/* 6. HERO / HOME BANNER                 ~35 lines */
/* 7. CHIPS / TAGS                       ~25 lines */
/* 8. CARDS                              ~40 lines */
/* 9. BLOG LIST                          ~10 lines */
/* 10. SECTION / PAGE FRAMING            ~20 lines */
/* 11. LINKS                             ~20 lines */
/* 12. FOOTER                            ~10 lines */
/* 13. RESPONSIVE (≤768px)               ~30 lines */
/* 14. RESPONSIVE (≤640px)               ~20 lines */
/* 15. ACCESSIBILITY (reduced-motion)    ~8 lines  */
```

### Token Strategy

**Principle:** Override tabi's native variables for theme integration. Keep Blueprint Lab-specific tokens for decorative elements only.

#### Dark Mode (`:root, [data-theme="dark"]`)

Override tabi variables:
```css
--background-color: #0f1217;     /* was tabi's #1f1f1f */
--bg-0: #151a22;                 /* surface */
--bg-2: #1a2130;                 /* card/widget bg */
--text-color: #e8edf5;           /* was tabi's #D4D4D4 */
--text-color-high-contrast: #f2f6fc;
--meta-color: #a8b3c5;           /* was tabi's #B0B0B0 */
--divider-color: rgba(180, 203, 236, 0.14);
--primary-color: #8bc2ff;        /* accent blue — overrides monochrome's #b3b3b3 */
--hover-color: #ffffff;
```

Blueprint Lab-only tokens (decorative, not used by tabi components):
```css
--accent-cyan: #6fd6de;
--accent-amber: #f3bd66;
--accent-green: #96cfa8;
--grid-line: rgba(139, 194, 255, 0.06);
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--shadow-card: 0 2px 14px rgba(0, 0, 0, 0.22);
--shadow-card-hover: 0 14px 36px rgba(0, 0, 0, 0.33);
--measure: 68ch;
```

#### Light Mode (`[data-theme="light"]`)

```css
--background-color: #f8fafc;
--bg-0: #eef2f7;
--bg-2: #ffffff;
--text-color: #1a1f2e;
--text-color-high-contrast: #0f1219;
--meta-color: #5b6577;
--divider-color: rgba(30, 50, 80, 0.12);
--primary-color: #2563eb;        /* visible blue on light bg */
--hover-color: #1e3a5f;
--grid-line: rgba(37, 99, 235, 0.04);
--accent-cyan: #0891b2;
--accent-amber: #d97706;
--accent-green: #059669;
```

### Specificity Rules

1. **No `!important`** except `@media (prefers-reduced-motion)` and responsive overrides where tabi's specificity requires it
2. **One definition per selector** — no duplicate rule blocks
3. **Dark mode** via `:root` (default) — no `html[data-theme="dark"]` prefix needed for base styles
4. **Light mode** via `[data-theme="light"]` prefix only where values differ from dark
5. **Component styles** use class selectors matching tabi's conventions (`.card`, `.tag`, `.nav-links`)
6. **Interactive states** (`:hover`, `:focus-visible`) defined once per component, immediately after base styles

### Key Design Decisions

**1. Monochrome skin interaction:** The monochrome skin sets `--primary-color` to gray. Our `custom-v5.css` overrides `--primary-color` to blue. Since custom-v5.css loads BEFORE the skin in tabi's load order (`stylesheets` → `skin`), the monochrome skin will win and gray out the accent. This is correct behavior — the skin is the user's choice. If we want the Blueprint Lab blue accent regardless of skin, we'd need to stop using `--primary-color` for our accent. **Decision: Accept skin override for now. The monochrome aesthetic is intentional.**

Actually — checking the load order more carefully: `main.css` → `custom-v5.css` (extra stylesheet) → `monochrome.css` (skin). The skin loads LAST and will override `--primary-color`. This means our blue accent gets grayed out by the monochrome skin. Two options:

- **Option A:** Accept it (monochrome site = gray links, gray hover). The Blueprint Lab texture/cards/layout still look custom.
- **Option B:** Use a separate `--blueprint-accent` token for custom elements and leave `--primary-color` to the skin.

**Recommendation: Option B** — use `--primary-color` where tabi components use it (so the skin controls those), and use `--blueprint-accent` for Blueprint Lab-specific decorative elements (grid texture corner marks, card SPEC badge, admonition borders). This gives the best of both worlds.

**2. Grid texture:** Keep the body background grid (it's the signature visual). Define `--grid-line` as a token so light mode can adjust opacity.

**3. Card SPEC badge:** Keep the `::before` content badge. It's a distinctive design element.

**4. Corner marks on hero:** Keep the `::before`/`::after` corner marks. They reinforce the schematic aesthetic.

**5. Hidden home image:** Keep `#image-container-home { display: none }` — the text-only hero is cleaner.

## Implementation Phases

### Phase 1: Write custom-v5.css

Write the clean CSS file following the section layout above. Single-pass, no override chains. Use tabi's variables + Blueprint Lab decorative tokens.

### Phase 2: Config switchover

Update `config.toml` to load `custom-v5.css`. Update `scripts/test.sh` if it references the filename.

### Phase 3: Automated visual verification (Playwright MCP)

Start `zola serve` in background, then use Playwright MCP to run automated visual regression across all pages, viewports, and themes.

#### Test Matrix

| Page | Viewports | Themes | Checks |
|------|-----------|--------|--------|
| `/` (home) | 375px, 768px, 1440px | dark, light | Hero renders, toolkit tags visible, blog list present, no horizontal overflow |
| `/projects/` | 375px, 768px, 1440px | dark, light | Cards grid (desktop) / stack (mobile), SPEC badges visible, filter chips functional |
| `/blog/` | 375px, 768px, 1440px | dark, light | Blog list readable, tags styled, dates in monospace |
| `/now/` | 375px, 768px, 1440px | dark, light | Content within measure, heading rule motif present |

**Total: 4 pages × 3 viewports × 2 themes = 24 screenshot captures**

#### Automated Checks (per capture)

1. **Screenshot** — visual capture at each viewport/theme combo, saved to `specs/006-design-system/screenshots/` for review
2. **No horizontal overflow** — `document.documentElement.scrollWidth <= document.documentElement.clientWidth`
3. **Link contrast** — computed color of `a` elements differs from computed background-color (not invisible)
4. **Card title visibility** — `.card-title` computed color has sufficient contrast against `.card` background (light mode regression check)
5. **Theme toggle** — switch theme via `document.documentElement.setAttribute('data-theme', 'light')`, verify token values update
6. **Grid texture** — `body` computed `background-image` contains `linear-gradient` (signature visual preserved)
7. **Content measure** — `.e-content p` computed `max-width` ≤ 68ch equivalent

#### Playwright Workflow

```text
1. zola serve &                          # background dev server on :1111
2. Playwright: browser_navigate → http://127.0.0.1:1111
3. For each page in [/, /projects/, /blog/, /now/]:
   a. browser_navigate → page URL
   b. For each viewport in [375, 768, 1440]:
      i.  browser_resize → {width: viewport, height: 900}
      ii. browser_take_screenshot → dark mode capture
      iii. browser_evaluate → run contrast/overflow/measure checks
      iv. browser_evaluate → setAttribute('data-theme', 'light')
      v.  browser_take_screenshot → light mode capture
      vi. browser_evaluate → run contrast/overflow checks (light)
      vii. browser_evaluate → setAttribute('data-theme', 'dark')  # reset
4. Kill zola serve
5. Report: pass/fail per check, screenshots for manual review
```

### Phase 4: Cleanup

Delete `static/custom.css` (dead file). Optionally delete `custom-v4.css` after verification.

### Phase 5: Build test

Run `scripts/test.sh` — all checks must pass. This validates:
- Zola build succeeds with new CSS
- HTML structure intact (nav order, meta tags, JSON-LD, OG tags)
- Feeds generated
- Discovery files present (robots.txt, llms.txt, sitemap.xml)
- Custom CSS file exists in build output
