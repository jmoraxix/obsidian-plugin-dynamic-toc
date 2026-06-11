# Roadmap

Prioritized roadmap for the revived Dynamic Table of Contents plugin. Backed by the
[TOC plugin landscape investigation](docs/investigations/toc-landscape.md) (June 2026),
which includes per-feature rationale, competitor comparisons, and upstream issue citations.

All planned features are **additive** — existing codeblock syntax, the plugin id, and the
` ```toc ` identifier never change.

## Completed

- [x] Fork revival: de-archived README, contributor docs, CLAUDE.md
- [x] Toolchain & API modernization: esbuild, TypeScript 5 strict, jest 30, eslint
      (`eslint-plugin-obsidianmd`), `MarkdownRenderer.render`, `minAppVersion 1.3.5`,
      Node 22/24 CI, release workflow with build provenance

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
- [ ] **Static markdown TOC** — "Copy TOC" and "Insert static TOC" commands producing
      plain markdown that survives PDF export and Obsidian Publish (upstream #76)

## Medium priority

- [ ] **Duplicate-heading link disambiguation** — anchors resolve to the correct
      occurrence, not always the first (upstream #27)
- [ ] **Section-scoped TOC** — limit the TOC to headings under/after the block's section
      (upstream #64)
- [ ] **Nested ordered numbering** — `1.1`, `1.2`-style numbering via an additive param
      (upstream #74)
- [ ] **`hide_when_empty`** — suppress the TOC container when no headings match

## Low priority

- [ ] **Alphabetical sort option** (`sort: alphabetical`, upstream #75)
- [ ] **Inline-style prefix/suffix text** (upstream #70)
- [ ] **Manual-refresh mode** — disable live updates + "Refresh TOCs" command
      (upstream #63)

## Bug-fix track (inherited upstream defects)

- [ ] Embedded notes show the parent page's headings (upstream #72)
- [ ] TOC inside callouts does not update (upstream #77)
- [ ] TOC renders for the active pane instead of its own note (upstream #53)
- [ ] TOC position wrong in PDF export (upstream #60)

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
