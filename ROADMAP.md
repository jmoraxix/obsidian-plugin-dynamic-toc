# Roadmap

Prioritized roadmap for the revived Dynamic Table of Contents plugin. Backed by the
[TOC plugin landscape investigation](docs/investigations/toc-landscape.md) (June 2026),
which includes per-feature rationale, competitor comparisons, and upstream issue citations.
Owner decisions recorded 2026-06-11.

All planned features are **additive** — existing codeblock syntax, the plugin id, and the
` ```toc ` identifier never change.

## Guiding principles

- **Dynamic-first.** The TOC is always a live, auto-updating render (the
  hipstersmoothie-style static-text insertion is explicitly not our model). Plain-markdown
  generation exists only as an *export tool* on top of the dynamic core, never as the
  default behavior.
- **Codeblock identity, plus a floating companion.** The ` ```toc ` block stays the heart
  of the plugin; the planned floating panel augments it rather than replacing it.

## Completed

- [x] Fork revival: de-archived README, contributor docs, CLAUDE.md
- [x] Toolchain & API modernization: esbuild, TypeScript 5 strict, jest 30, eslint
      (`eslint-plugin-obsidianmd`), `MarkdownRenderer.render`, `minAppVersion 1.3.5`,
      Node 22/24 CI, release workflow with build provenance, branch protection with
      required CI checks

## Next up

- [ ] **Per-block config override hardening** *(in design — PR #2)* — validate codeblock
      YAML (types, depth ranges, style enum), render an inline error instead of failing
      silently, and fix the settings-precedence bug so global setting changes propagate
      to keys not set in the block

## High priority

- [ ] **Heading text fidelity** — clean rendering of wiki/markdown links, `#tags`,
      formatting, and math inside headings (upstream #69/#66/#45/#62; weak spot in every
      competitor)
- [ ] **`include` / `exclude` heading filters** — regex or substring params to control
      which headings appear (parity with Automatic TOC)
- [ ] **Plain-markdown TOC generation (export tool)** — "Copy TOC" and "Insert static
      TOC" commands producing markdown that survives PDF export and Obsidian Publish
      (upstream #76). Per the dynamic-first principle this is an explicit user action,
      not a rendering mode.
- [ ] **PDF export page break before the TOC** — global true/false setting that, when
      enabled, always inserts `<div style="page-break-after: always;"></div>` before the
      TOC title, so exports separate the cover page from the index. Pairs with the
      upstream PDF-position bug (#60).

## Floating TOC panel (owner-approved 2026-06-11)

> The investigation originally marked floating/sidebar UIs as out of scope; the owner
> overrode that — the goal is a Google Docs/Sheets-style companion panel beside the
> content (NOT the native sidebar Outline pane), merging the best of Floating TOC
> (pkm-er) and Dynamic Outline (theopavlove). Known risk from competitor issue trackers:
> mobile UX needs deliberate QA.

- [ ] **Panel display mode setting:** `floating` | `inline` | `hidden`
- [ ] **Show-only-with-block toggle (t/f):** display the panel only when the note
      contains a ` ```toc ` codeblock
- [ ] **Embedded search** in the panel bar (Quiet Outline / Dynamic Outline inspiration)
- [ ] **Indentation-level slider** to show/hide heading depth levels (Quiet Outline's
      level switch bar)

## Medium priority

- [ ] **`hide_when_empty`** — global true/false setting (+ per-block param) suppressing
      the TOC container entirely when no headings match
- [ ] **Duplicate-heading link disambiguation** — anchors resolve to the correct
      occurrence, not always the first (upstream #27)
- [ ] **Section-scoped TOC** — limit the TOC to headings under/after the block's section
      (upstream #64)
- [ ] **Nested ordered numbering** — `1.1`, `1.2`-style numbering via an additive param
      (upstream #74)
- [ ] **Wikipedia-style TOC box** — bordered/boxed cosmetic style, pairs with nested
      numbering (upstream #59)

## Low priority

- [ ] **Alphabetical sort option** (`sort: alphabetical`, upstream #75)
- [ ] **Inline-style prefix/suffix text** (upstream #70)
- [ ] **Manual-refresh mode** — disable live updates + "Refresh TOCs" command
      (upstream #63)

## Bug-fix track (inherited upstream defects)

- [ ] Heading text fidelity bug cluster (upstream #69/#66/#45/#62 — tracked as the High
      priority feature above)
- [ ] Embedded notes show the parent page's headings (upstream #72)
- [ ] TOC inside callouts does not update (upstream #77)
- [ ] TOC renders for the active pane instead of its own note (upstream #53)
- [ ] TOC position wrong in PDF export (upstream #60)
- [ ] Verify Day Planner plugin compatibility break still applies — Day Planner has been
      rewritten since (upstream #51)
- [ ] Retest 2021-era "funky Live Preview" report; likely stale (upstream #34)

## Declined (from upstream requests)

Kept for the record; revisit only on renewed demand — see the
[investigation](docs/investigations/toc-landscape.md) for rationale:

- TOC of another/external document (upstream #65)
- Headers inside list items (upstream #67 — not indexed by Obsidian's metadataCache)
- Static-insertion-as-default model (hipstersmoothie approach — conflicts with the
  dynamic-first principle)

## Known compatibility note

The **Automatic Table Of Contents** plugin (johansatge) also registers the ` ```toc `
codeblock identifier, so the two plugins conflict when installed together. Our identifier
is frozen for backwards compatibility; if you use both plugins, use Automatic TOC's
` ```table-of-contents ` identifier for its blocks.

## Long term / administrative

- [ ] Community plugin directory re-listing (the id `obsidian-dynamic-toc` predates the
      current naming rules; requires a conversation with the Obsidian team)
- [ ] Replace the `TFile.deleted` internal-property check with `vault.on("delete")`
      subscriptions
- [ ] Update README *Releasing* section to the branch-based release flow (branch
      protection blocks direct pushes to main) and document the BRAT beta channel
