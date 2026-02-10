# Test-to-Spec Traceability Mapping

Maps every functional requirement (FR-nnn) from specs 001–006 to the `scripts/test.sh` check that validates it, or notes when validation is manual/not-yet-automated.

**Last updated**: 2026-02-10

## Spec 001: Home Page & Site Identity

| Requirement | Description | test.sh Validation | Status |
|-------------|-------------|-------------------|--------|
| FR-001 | Hero header with title, img, img_alt | HTML file non-empty check (line 16-21) | Indirect |
| FR-002 | Up to max_posts recent blog entries on home | Content count smoke test (line 206-211) | Indirect |
| FR-003 | Nav menu order: Now, Projects, Blog | Nav menu order check (line 112-128) | Direct |
| FR-004 | Trailing slashes on nav URLs | Nav menu order check (line 114-116) — grep patterns include trailing `/` | Direct |
| FR-005 | GitHub social link present | Not automated | Manual |
| FR-006 | Theme switcher enabled, dark default | Not automated (config-level, not build output) | Manual |
| FR-007 | Site title and description | Meta description check (line 82-83) | Indirect |

## Spec 002: Blog System

| Requirement | Description | test.sh Validation | Status |
|-------------|-------------|-------------------|--------|
| FR-001 | Blog sorted by date, paginated by 5 | Not automated (requires page content inspection) | Manual |
| FR-002 | TOML front matter: title, date, description | Meta description check (line 82-83) catches missing descriptions | Indirect |
| FR-003 | Tags taxonomy | Not automated | Manual |
| FR-004 | Dracula highlight theme | Not automated (config-level) | Manual |
| FR-005 | Smart punctuation enabled | Not automated (config-level) | Manual |
| FR-006 | External links: new tab, no-referrer | Not automated (config-level) | Manual |
| FR-007 | Tag taxonomy generates feeds | Feed existence check (line 40-47) | Indirect |
| FR-008 | atom.xml and rss.xml generated | Feed existence check (line 40-47) | Direct |
| FR-009 | Nosh front matter: type, language minimum | Not automated (content-level) | Manual |
| FR-010 | .nosh companion files valid JSON | Nosh JSON validation (line 130-147) | Direct |
| FR-011 | Blog templates: section.html, page.html | Not automated (config-level) | Manual |

## Spec 003: Projects Showcase

| Requirement | Description | test.sh Validation | Status |
|-------------|-------------|-------------------|--------|
| FR-001 | Projects section uses cards.html template | Not automated (config-level) | Manual |
| FR-002 | Projects sorted by date | Not automated | Manual |
| FR-003 | Project front matter: title, date, description, tags | HTML non-empty check (line 16-21) | Indirect |
| FR-004 | Extra fields: repo, local_image | Not automated | Manual |
| FR-005 | Admonition info block with Status, Stack, Role, License | Admonition block check (line 149-165) | Direct |
| FR-006 | "View on GitHub" button | Not automated | Manual |
| FR-007 | Reading time hidden on project pages | Not automated (config-level) | Manual |
| FR-008 | Cover images in static/projects/ | Not automated | Manual |

## Spec 004: Now Page

| Requirement | Description | test.sh Validation | Status |
|-------------|-------------|-------------------|--------|
| FR-001 | Now page served at /now/ | Now page existence check (line 167-173) | Direct |
| FR-002 | Uses page.html template | Not automated (config-level) | Manual |
| FR-003 | Content includes last-updated date and location | Not automated (content inspection) | Manual |
| FR-004 | Organized in structured sections | Not automated (content inspection) | Manual |
| FR-005 | Link to nownownow.com/about | Not automated | Manual |

## Spec 005: AI Discovery & Machine Readability

| Requirement | Description | test.sh Validation | Status |
|-------------|-------------|-------------------|--------|
| FR-001 | robots.txt: User-agent: * with Allow: / | robots.txt existence check (line 57-62) | Indirect |
| FR-002 | robots.txt: named AI bot user-agents | AI bot user-agent check (line 175-185) | Direct |
| FR-003 | robots.txt: Sitemap directive | Not automated | Manual |
| FR-004 | llms.txt is static file at root | llms.txt existence check (line 49-54) | Direct |
| FR-005 | llms.txt required sections | llms.txt structure check (line 187-197) | Direct |
| FR-006 | JSON-LD on index and blog posts | JSON-LD check (line 65-77) | Direct |
| FR-007 | Meta description on index and blog posts | Meta description check (line 80-91) | Direct |
| FR-008 | OG tags on index and blog posts | OG tags check (line 93-103) | Direct |
| FR-009 | sitemap.xml generated and non-empty | Feed existence check (line 40-47, includes sitemap.xml) | Direct |
| FR-010 | atom.xml and rss.xml generated | Feed existence check (line 40-47) | Direct |

## Spec 006: Design System (Blueprint Lab v3)

| Requirement | Description | test.sh Validation | Status |
|-------------|-------------|-------------------|--------|
| FR-001 | Design tokens as CSS custom properties in :root | Not automated (CSS content inspection) | Manual |
| FR-002 | Dark mode primary, light mode via [data-theme] | Not automated (CSS content inspection) | Manual |
| FR-003 | Grid texture background | Not automated (CSS content inspection) | Manual |
| FR-004 | Content width constrained to 68ch | Not automated (CSS content inspection) | Manual |
| FR-005 | Single CSS file loaded via config | custom-v4.css existence check (line 31-37) | Direct |
| FR-006 | Component styles: cards, tags, admonitions, hero, code | Not automated (CSS content inspection) | Manual |
| FR-007 | Link hover states with visual feedback | Not automated (requires browser testing) | Manual |
| FR-008 | Monochrome skin active | Not automated (config-level) | Manual |

## Coverage Summary

| Spec | Total FRs | Direct | Indirect | Manual | Coverage |
|------|-----------|--------|----------|--------|----------|
| 001 - Home | 7 | 2 | 2 | 3 | 57% |
| 002 - Blog | 11 | 2 | 3 | 6 | 45% |
| 003 - Projects | 8 | 1 | 1 | 6 | 25% |
| 004 - Now | 5 | 1 | 0 | 4 | 20% |
| 005 - AI Discovery | 10 | 7 | 2 | 1 | 90% |
| 006 - Design System | 8 | 1 | 0 | 7 | 13% |
| **Total** | **49** | **14** | **8** | **27** | **45%** |

**Notes:**
- "Direct" means test.sh explicitly validates the requirement with a pass/fail check
- "Indirect" means test.sh validates a related property that would catch most regressions
- "Manual" means the requirement is validated by visual inspection or config review
- Config-level requirements (template names, Zola settings) are inherently validated by a successful `zola build` — if the config is wrong, the build fails
- CSS content inspection could be automated with grep-based checks in a future iteration
