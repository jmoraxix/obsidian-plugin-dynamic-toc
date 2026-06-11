# Obsidian TOC Plugin Landscape Investigation
> Date: 2026-06-11 · Prepared for: obsidian-plugin-dynamic-toc fork revival (PR #1, Task 4)

## Executive Summary

The Obsidian TOC landscape has split into two distinct niches since upstream `aidurber/obsidian-plugin-dynamic-toc` was archived (last push 2022-08-13) and subsequently removed from the community plugin directory: (1) **inline codeblock TOCs**, now dominated by johansatge's "Automatic Table Of Contents" (~140k downloads, actively maintained, v1.8.0 Feb 2026), and (2) **navigation UIs** (sidebar/floating panels with scroll tracking), led by Quiet Outline (~289k downloads), Floating TOC (~131k), Dynamic Outline (~32k), and newcomer Next TOC (released v2.1.0 today). Our plugin sits squarely in niche (1), where its differentiators remain external marker injection (`[TOC]`, `{{toc}}`, etc.) and the mixed `varied_style` — features no competitor has. The biggest functional gaps versus Automatic TOC are regex include/exclude filtering, `hideWhenEmpty`, and a documented codeblock-identifier collision risk: Automatic TOC also registers the ```` ```toc ```` identifier, so the two plugins conflict when installed together. The most demanded missing features across upstream issues and competitor trackers are heading-text fidelity (links/tags/markdown inside headings), static/copyable markdown TOC output (Publish/export compatibility), section-scoped TOCs, and nested numbering. Two small independent rewrites exist (lpj-app's "Dynamic ToC", not in the directory; Insta TOC, which writes the TOC into the document as text), confirming ongoing demand. All surveyed plugins ship `isDesktopOnly: false`, so mobile parity is table stakes, not a differentiator.

## Plugin Profiles

### 1. Outline (Obsidian core plugin)
- **Trigger:** Built-in sidebar pane (baseline, not inline).
- **Options:** Minimal. Documented features: click heading to navigate, drag headings within the outline to reorganize the document. Recent app versions add collapse and a search filter, but the help page documents only navigation + drag.
- **Rendering modes:** Sidebar pane; independent of editor mode.
- **Unique features:** Drag-to-reorganize actual document sections.
- **Complaints:** Community consensus (motivating Quiet Outline) is that it auto-expands aggressively and lacks search/markdown rendering.
- **Mobile:** Yes (core plugin).
- **Maintenance:** Maintained by Obsidian itself.

### 2. Dynamic Table of Contents (aidurber/obsidian-plugin-dynamic-toc — upstream)
- **Status:** **Archived**, last push 2022-08-13, 279 stars, 20 open issues. **Removed from the community plugin directory** (id `dynamic-toc` absent from `community-plugins.json` and the stats file — no current download count available).
- **Trigger/options:** As our baseline (this is the code we forked).
- **Known bugs (open issues):** see Upstream Issue Harvest below — heading-text fidelity, duplicate headings, embeds, callouts, export rendering.
- **Mobile:** Yes.
- **Maintenance:** Dead; our fork is the revival.

### 3. Automatic Table Of Contents (johansatge/obsidian-automatic-table-of-contents)
- **Trigger:** Codeblocks ```` ```table-of-contents ```` **and shorthand ```` ```toc ````** (collision with our identifier); commands "Insert table of contents" and "Insert table of contents (with available options)".
- **Options (per-block, with global defaults in settings):** `title` (markdown allowed), `style` (`nestedList` | `nestedOrderedList` | `inlineFirstLevel`), `minLevel` (0 = no limit), `maxLevel` (0 = no limit), `include` (regex), `exclude` (regex), `includeLinks` (true/false), `hideWhenEmpty` (true/false), `debugInConsole`.
- **Rendering modes:** Reading + Live Preview (codeblock processor).
- **Unique vs us:** regex include/exclude, `hideWhenEmpty`, `includeLinks` toggle, options-template insert command, second codeblock identifier.
- **Known issues (open):** README-acknowledged Publish/PDF limitation (TOC invisible on export/Publish); #84/#37/#78 section-scoped TOC requests; #82 hide bullets; #76 `include` only matches top-level headings; #75 preserve formatting+links together; #54 renaming open file breaks TOC; #36 regex crash on `[[`; #22 manual-update option; #4 TOC of another document.
- **Mobile:** Yes (`isDesktopOnly: false`).
- **Maintenance:** Active — v1.8.0 (2026-02-07), 271 stars, ~140,333 downloads, 20 open issues.

### 4. Table of Contents (hipstersmoothie/obsidian-plugin-toc)
- **Trigger:** Commands only: "Create full table of contents" and "Create table of contents for next heading level" — inserts **static markdown text** at the cursor, scoped to subheadings of the heading the cursor is under.
- **Options:** List style (bullet/number), Title, Minimum header depth (default 2), Maximum header depth (default 6); README documents a CSS snippet for nested `1.1`-style numbering.
- **Rendering modes:** N/A — output is plain markdown (works everywhere, including Publish/export).
- **Unique vs us:** Static, export-safe output; cursor/section-scoped generation.
- **Known issues:** 35 open issues; stale — no release since 0.2.0 (2023-05-11), last push 2024-07.
- **Mobile:** Yes (`isDesktopOnly: false`).
- **Maintenance:** Effectively unmaintained, yet still ~212,404 downloads (legacy install base, 335 stars).

### 5. Floating TOC (pkm-er/obsidian-floating-toc-plugin, formerly cumany)
- **Trigger:** Always-on floating panel docked at the editor edge; `alt+f` heading search; Ctrl+click to collapse items.
- **Options:** Position/appearance via Style Settings plugin integration, pin, heading-level display settings, scroll-synced current-heading highlight, multi-window/popout support.
- **Rendering modes:** Reading + Source/Live Preview (overlay UI, independent of note content).
- **Unique vs us:** Scroll tracking with current+parent heading highlight, click-to-navigate floating UI, heading search, collapse.
- **Known issues (57 open):** mobile UX problems (#153 oversized touch target, #138 mobile adaptation, #141 iOS sizing); performance (#137); plugin conflicts (#152 Editing Toolbar, #114, #128); headings containing links render incorrectly (#118, #134); requests for per-pane/default-off (#149, #112), hide empty headings (#146).
- **Mobile:** Yes, but the most complained-about area.
- **Maintenance:** Active — v2.7.1 (2026-01-24), 281 stars, ~131,011 downloads.

### 6. Quiet Outline (guopenghui/obsidian-quiet-outline)
- **Trigger:** Replacement sidebar outline pane (no inline insertion).
- **Options/features:** search with regex, markdown rendering of headings in the outline (opt-in "Markdown Render"), level switch bar, default level per note, no auto-expand while editing, remember expand state, drag headings to restructure note, hover preview, copy-all-headings, vim-like keymaps, Canvas/Kanban support.
- **Rendering modes:** Sidebar pane.
- **Unique vs us:** Everything UI: search, level bar, drag restructure, rendered markdown in outline.
- **Known issues (24 open):** iOS tracking problems (#255), Android conflict (#224), state persistence (#296), mobile context menu (#301), strip tags from displayed headings (#217).
- **Mobile:** Yes (`isDesktopOnly: false`), with open mobile bugs.
- **Maintenance:** Very active — v0.5.14 (2026-05-28), 541 stars, ~289,114 downloads (category leader).

### 7. Dynamic Outline (theopavlove/obsidian-dynamic-outline)
- **Trigger:** Floating toggle button in the note header opens a GitHub-style floating TOC panel; hotkey-bindable command.
- **Options:** reveal on file open, toggle on hover, auto-hide, heading-level filtering, search field, highlight active heading, collapsible sections, keyboard navigation, Style Settings color/layout customization.
- **Rendering modes:** Overlay UI in both editing and reading modes.
- **Unique vs us:** Active-heading indication, search, collapse, hover behavior.
- **Known issues (18 open):** `^block-id` anchors leak into outline text (#64); requests for markdown/math rendering of headings (#62, #59, #25); cursor-based instead of scroll-based tracking (#49, #26); headings inside lists not recognized (#13).
- **Mobile:** Yes (`isDesktopOnly: false`).
- **Maintenance:** Maintained — v1.19.0 (2025-05-03), last push 2025-11, 96 stars, ~32,544 downloads.

### 8. Number Headings (onlyafly/number-headings-obsidian) — adjacent
- **Trigger:** Commands ("Number all headings…", "Remove numbering…", "Save settings to front matter"); per-note config via a `number headings` frontmatter property.
- **Options (frontmatter):** `first-level`, `start-at`, `max`, `skip`, `style` (Arabic `1.1` / Roman), `separator`, `off`, `auto` (renumber on edit). Also offers automatic TOC rendering as a side feature.
- **Unique vs us:** Rewrites actual heading text with outline numbers (a TOC then inherits numbering for free); frontmatter-driven per-note config.
- **Mobile:** Yes (`isDesktopOnly: false`).
- **Maintenance:** Stale-ish — v1.16.0 (2023-10-03), last push 2024-06, 154 stars, ~83,973 downloads, 41 open issues.

### 9. Other directory findings (search: "table of contents" / "toc")
- **Insta TOC (iliftalot/insta-toc):** ```` ```insta-toc ```` codeblock that the plugin **rewrites as real text in the file** in real time (export/Publish-safe by design). Options: `title.name/level/center`, `listType` (`number`|`dash`), indent width, `exclude` (chars/regex), `omit` (heading array), `levels.min/max`, `<!-- omit -->` heading comments; handles wiki-links/HTML/special symbols in headings. Active: v7.0.0 (2026-03-25), 48 stars, ~9,145 downloads. The most credible new codeblock-based rival.
- **Next TOC (raven-pensieve/obsidian-next-toc):** floating panel with reading progress + TOC + navigation aids; sparse README. Extremely active: v2.1.0 released 2026-06-11 (today), 33 stars, ~8,564 downloads.
- **TOC compatible with Publish (brmaccath/Table-of-Contents):** exists solely to generate static, Publish-compatible TOCs — evidence of demand for export-safe output.
- **Sspai Style TOC** (641 downloads), **Floating Headings**, **Heading Outliner**: minor floating-UI entrants; not further profiled.
- Strange New Worlds / Headings in Explorer: confirmed not TOC-relevant; excluded.

### 10. Dynamic ToC (lpj-app/obsidian-dynamic-toc-plugin)
- **Exists**, but is an **independent rewrite, not a fork** (no GitHub fork relationship, no attribution to aidurber). Uses the same ```` ```toc ```` codeblock plus command palette and file/context-menu "prepend TOC" entries; settings toggle H1–H6 visibility. v1.0.2 (2026-01-28), 2 stars, 0 open issues, **not in the community plugin directory**. Low threat, but a third claimant to the `toc` codeblock identifier.

## Feature Gap Analysis

| Feature | This repo | Automatic TOC | Floating TOC | Quiet Outline | Dynamic Outline | Notes |
|---|---|---|---|---|---|---|
| Bullet / number / inline style | Yes (all 3 + `varied_style` mix) | Yes (nested/ordered/inlineFirstLevel) | N/A (UI) | N/A | N/A | `varied_style` is unique to us |
| Custom title | Yes (`title`) | Yes (`title`, markdown allowed) | No | No | No | Markdown-in-title is a small parity gap |
| Min/max depth | Yes (`min_depth`/`max_depth`) | Yes (`minLevel`/`maxLevel`) | Level display settings | Level switch bar | Level filtering | Parity |
| Per-block override | Yes | Yes | N/A | N/A | N/A | Validation/inline errors = Task 5 (already planned) |
| External markers (`[TOC]`, `{{toc}}`…) | **Yes** | No | No | No | No | Our unique feature; keep promoting |
| Live update on edit | Yes (metadataCache) | Yes | Yes | Yes | Yes | Upstream bugs: callouts #77, active-pane #53 |
| Collapsible / interactive TOC | No | No | Yes | Yes | Yes | Inherent to UI-niche plugins |
| Scroll tracking / highlight current section | No | No | Yes | No (cursor locate) | Yes | Out of scope for codeblock niche (see Rejected) |
| Click-to-navigate sidebar/floating UI | No | No | Yes | Yes | Yes | Different niche |
| Include/exclude headings by pattern | No | **Yes (regex `include`/`exclude`)** | No | Search only | Search only | Biggest direct-competitor gap; Insta TOC has `omit` too |
| Frontmatter config | No | No | Partial (per-note disable) | Default level per note | No | Number Headings shows the pattern |
| Heading numbering (1.1.2) | No (style: number = flat) | Via `nestedOrderedList` | No | No | No | Upstream #74; hipstersmoothie via CSS |
| Copy-TOC / static markdown insert | No | No | No | Copy all headings | No | hipstersmoothie + Insta TOC + brmaccath own this; upstream #76 |
| Hide when empty | No | Yes (`hideWhenEmpty`) | Requested (#146) | N/A | N/A | Easy parity win |
| Handles duplicate headings | **No (upstream #27)** | Unverified | Bug #154 (dupes across H1s) | N/A | N/A | Common pain point |
| Handles special chars / markdown in headings | **No (upstream #45/#62/#66/#69)** | Partial (issues #92/#36) | Bugs #118/#134 | Yes (Markdown Render) | Requested (#25/#59/#62) | Industry-wide weak spot; chance to lead |
| Section-scoped TOC | No | Requested (#84/#37/#78) | N/A | N/A | N/A | Upstream #64; hipstersmoothie has it (static) |
| Mobile | Yes | Yes | Yes (buggy) | Yes | Yes | All `isDesktopOnly: false` — table stakes |
| Maintained (June 2026) | Yes (revived) | Yes (Feb 2026) | Yes (Jan 2026) | Yes (May 2026) | Yes (Nov 2025) | hipstersmoothie + Number Headings stale; upstream dead |

## Upstream Issue Harvest

From `aidurber/obsidian-plugin-dynamic-toc` (20 open issues, all still unresolved at archive time):

**Feature requests worth adopting**
- **#76** — Generate a plain-markdown, future-proof TOC (VS Code Markdown-All-in-One style). High demand; also solves the export/Publish problem Automatic TOC documents as a limitation.
- **#74** — Nested numbering in TOC (`1.1`, `1.2`).
- **#75** — Alphabetical sort option for TOC items.
- **#70** — Prefix/suffix text control for inline rendering style.
- **#64** — Section-scoped TOC ("only under this header" / "after the TOC block"). Echoed by Automatic TOC #84/#37/#78.
- **#63** — Option to disable automatic updates (manual refresh).
- **#59** — Wikipedia-style TOC box (cosmetic; pairs with #74).
- **#67** — Support headers inside list items (low value, see Rejected).
- **#65** — TOC of an external page (see Rejected).

**Bugs worth fixing in the fork**
- **#69 / #66 / #45 / #62** — Heading text fidelity: links, tags, markdown, and MathJax in headings render wrong or as plain text in the TOC. The single largest bug cluster.
- **#27** — Links to duplicate heading names resolve to the wrong (first) heading.
- **#72** — Embedding a note containing a TOC shows the *parent* page's headings.
- **#77** — TOC inside callouts does not update.
- **#53** — TOC renders for the active pane rather than the note it belongs to.
- **#60** — TOC renders at the bottom of the document when exported to PDF.
- **#51** — Compatibility break with Day Planner plugin (verify still relevant; Day Planner has since been rewritten).
- **#34** — "Funky Live Preview" (2021-era; likely stale, retest before acting).

## Feature Proposal List

*(Task 5 — per-block option validation + inline error rendering — is already planned and intentionally not re-proposed. Automatic TOC #36 — a regex crash rendering a raw error — shows why inline error UX matters.)*

### Feature: Heading text fidelity (strip/render links, tags, markdown, math in TOC entries)
**What it does:** Sanitizes or renders heading content (wiki/markdown links, `#tags`, bold/italic/code, MathJax) so TOC entries show clean text while links still resolve to the real heading.
**Complexity:** Medium
**Implementation path:** new module (heading-text normalizer used by all renderers); no API surface change
**Breaking?:** No
**Recommended priority:** High
**Rationale:** Largest upstream bug cluster (#69, #66, #45, #62) and an industry-wide weak spot (Floating TOC #118/#134, Dynamic Outline #25/#59/#62, Automatic TOC #92) — fixing it leapfrogs every codeblock competitor.

### Feature: Include/exclude headings by regex
**What it does:** Optional `include` / `exclude` codeblock params (regex or plain substring) to filter which headings appear.
**Complexity:** Medium (regex validation must feed Task 5's inline-error path)
**Implementation path:** new codeblock params + global settings
**Breaking?:** No (additive YAML keys)
**Recommended priority:** High
**Rationale:** Direct parity gap with Automatic TOC (`include`/`exclude`) and Insta TOC (`exclude`/`omit`); their issue #76 (top-level-only matching) shows where to do it better.

### Feature: Static markdown TOC — "Copy TOC" and "Insert static TOC" commands
**What it does:** Generates the same TOC as plain markdown text, copied to clipboard or inserted at cursor (export-, PDF-, and Publish-safe).
**Complexity:** Medium
**Implementation path:** new module + two commands (reuses existing renderer logic to emit markdown)
**Breaking?:** No
**Recommended priority:** High
**Rationale:** Upstream #76; Automatic TOC documents Publish/export as an unsolved limitation; hipstersmoothie's 212k installs and the brmaccath/Insta TOC plugins prove demand.

### Feature: Duplicate-heading link disambiguation
**What it does:** When multiple headings share text, generates anchors that resolve to the correct occurrence instead of always the first.
**Complexity:** Medium (constrained by Obsidian's `[[#heading]]` resolution; may require nearest-unique-parent paths)
**Implementation path:** renderer module change
**Breaking?:** No
**Recommended priority:** Medium
**Rationale:** Upstream #27; same bug class open in Floating TOC (#154).

### Feature: Section-scoped TOC
**What it does:** Optional param (e.g. `scope: section` or `from_here: true`) limiting the TOC to headings under the heading containing the codeblock (or after the block).
**Complexity:** High (needs block-position awareness, not just metadataCache headings)
**Implementation path:** new codeblock param + renderer change
**Breaking?:** No
**Recommended priority:** Medium
**Rationale:** Upstream #64 plus three independent requests on Automatic TOC (#84, #37, #78); hipstersmoothie ships it (static only).

### Feature: Nested ordered numbering (1.1, 1.2)
**What it does:** Optional `numbering: nested` (additive param; `style` values stay frozen) rendering hierarchical numbers, ideally via CSS counters.
**Complexity:** Low–Medium
**Implementation path:** new codeblock param + styles.css
**Breaking?:** No
**Recommended priority:** Medium
**Rationale:** Upstream #74 and #59; Automatic TOC covers it with `nestedOrderedList`; hipstersmoothie resorts to a documented CSS hack.

### Feature: `hide_when_empty`
**What it does:** Suppresses the TOC container entirely (no title, no empty list) when no headings match.
**Complexity:** Low
**Implementation path:** new codeblock param + settings toggle
**Breaking?:** No
**Recommended priority:** Medium
**Rationale:** Direct parity with Automatic TOC `hideWhenEmpty`; same request open on Floating TOC (#146).

### Feature: Alphabetical sort option
**What it does:** `sort: alphabetical` (default `document`) reorders sibling entries A–Z.
**Complexity:** Low
**Implementation path:** new codeblock param
**Breaking?:** No
**Recommended priority:** Low
**Rationale:** Upstream #75; no competitor offers it (cheap differentiation).

### Feature: Inline-style prefix/suffix text
**What it does:** Optional `inline_prefix` / `inline_suffix` strings wrapping the inline-rendered TOC (e.g. "Jump to: …").
**Complexity:** Low
**Implementation path:** new codeblock params
**Breaking?:** No
**Recommended priority:** Low
**Rationale:** Upstream #70; complements our existing `delimiter` option.

### Feature: Manual-refresh mode
**What it does:** Setting (and per-block param) to disable live updates, with a "Refresh TOCs" command, for very large notes.
**Complexity:** Low
**Implementation path:** settings toggle + command
**Breaking?:** No
**Recommended priority:** Low
**Rationale:** Upstream #63 and Automatic TOC #22; also a performance escape hatch (cf. Floating TOC #137 lag complaints).

### Bug-fix track (adopt as roadmap items alongside features)
Embeds showing parent headings (#72), TOC in callouts not updating (#77), active-pane mis-rendering (#53), PDF export position (#60) — all unfixed upstream defects our fork inherits; each is a correctness fix, no API impact.

## Out of Scope / Rejected

- **Floating panel / sidebar UI with scroll tracking:** Quiet Outline, Floating TOC, Dynamic Outline, and Next TOC saturate this niche with dedicated, actively maintained plugins; building it would dilute our codeblock identity and explode mobile-QA surface.
- **Drag-to-reorganize document via TOC:** core Outline + Quiet Outline territory; high risk (rewrites user notes).
- **Heading auto-numbering that rewrites note text:** Number Headings exists; our nested-numbering proposal achieves the visual result without touching user content.
- **TOC of another/external document (upstream #65, Automatic TOC #4):** niche, conflicts with the "TOC of this note" mental model, and embeds make caching/update semantics messy.
- **Headers inside list items (upstream #67, Dynamic Outline #13):** not indexed by Obsidian's metadataCache; would require custom markdown parsing for a non-standard authoring pattern.
- **Renaming/aliasing the codeblock identifier:** frozen per constraints. However, note the **compatibility risk**: Automatic TOC registers ```` ```toc ```` as a shorthand (and lpj-app's plugin uses it too), so co-installation conflicts; document this in the README rather than changing our identifier.
- **Reading-progress indicators:** Next TOC's differentiator; pure UI-niche feature.
