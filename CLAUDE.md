# CLAUDE.md — AI Agent Instructions for obsidian-dynamic-toc

## Project Overview

Dynamic Table of Contents is an Obsidian plugin that renders a table of contents inside a note — via a ` ```toc ` codeblock or external markers like `[TOC]` — and keeps it in sync with the document outline. This repository is an actively maintained fork of [aidurber/obsidian-plugin-dynamic-toc](https://github.com/aidurber/obsidian-plugin-dynamic-toc) (archived upstream in 2022), maintained by [@jmoraxix](https://github.com/jmoraxix).

## Repo Structure

```
src/
  main.ts                        — plugin entry point; registers the `toc` codeblock processor,
                                   the external-marker post processor, and the insert command
  constants.ts                   — DEFAULT_SETTINGS, dynamic-toc CSS class names, matcher list
  types.ts                       — TableOptions / DynamicTOCSettings interfaces,
                                   EXTERNAL_MARKDOWN_PREVIEW_STYLE marker table
  settings-tab.ts                — PluginSettingTab UI for all global settings
  insert-command.modal.ts        — FuzzySuggestModal for the "Insert Table of Contents" command
  obsidian-ex.d.ts               — module augmentation (TFile.deleted hack)
  styles.css                     — Live Preview styling for rendered TOCs
  models/heading.ts              — Heading wrapper over HeadingCache (wiki-link href generation)
  renderers/
    code-block-renderer.ts       — MarkdownRenderChild rendering ```toc blocks
    dynamic-injection-renderer.ts — MarkdownRenderChild replacing external markers ([TOC], {{toc}}, …)
  utils/
    config.ts                    — codeblock YAML parsing (obsidian parseYaml) + settings merge
    extract-headings.ts          — pure function: CachedMetadata + options → TOC markdown string
  models/__tests__/, utils/__tests__/ — jest unit tests (heading model, extract-headings snapshots)
scripts/
  manifest-updater.js            — commit-and-tag-version custom updater for manifest.json
  versions-updater.js            — commit-and-tag-version custom updater for versions.json
.github/workflows/release.yml    — release CI, triggered by tag push (Node 24, gh release create)
.github/workflows/lint.yml       — CI build + lint on push/PR (Node 22 & 24 matrix)
esbuild.config.mjs               — build config (official sample-plugin pattern + styles.css copy)
eslint.config.mts                — eslint flat config (typescript-eslint + eslint-plugin-obsidianmd)
manifest.json                    — Obsidian plugin metadata (id, version, minAppVersion)
versions.json                    — plugin version ↔ minAppVersion compatibility map
package.json                     — deps and npm scripts
tsconfig.json                    — TypeScript compiler config (strict)
jest.config.js                   — test runner config (ts-jest transform)
.versionrc.js                    — commit-and-tag-version config wiring the custom updaters
media/                           — README screenshots
```

## Build & Dev Commands

Requires Node.js >= 22 (CI runs 22 and 24).

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (lockfile is committed; CI uses `npm ci`) |
| `npm run dev` | Watch-mode esbuild build → `main.js` + `styles.css` at repo root |
| `npm run build` | Tests (prebuild) + `tsc -noEmit` + production esbuild build |
| `npm test` | Run jest tests |
| `npm run test:watch` | Jest watch mode |
| `npm run type-check` | `tsc --noEmit` (strict mode) |
| `npm run lint` | eslint (typescript-eslint + eslint-plugin-obsidianmd) |
| `npm run release` | `commit-and-tag-version` bump (package.json + manifest.json + versions.json) |

**Live development:** clone the repo into `<vault>/.obsidian/plugins/obsidian-dynamic-toc/`, run `npm run dev`, then reload Obsidian after changes.

## Architecture Notes

- `src/main.ts` registers three integration points:
  1. `registerMarkdownCodeBlockProcessor("toc", …)` — parses the block's YAML via `parseConfig` and attaches a `CodeBlockRenderer` through `ctx.addChild()`.
  2. `registerMarkdownPostProcessor(…)` — scans rendered markdown for external markers (`[TOC]`, `__TOC__`, `_TOC_`, `{{toc}}`, `[/toc/]`; table in `EXTERNAL_MARKDOWN_PREVIEW_STYLE`, `src/types.ts`) and attaches a `DynamicInjectionRenderer` that hides the marker and injects a TOC in its place.
  3. An "Insert Table of Contents" editor command backed by `src/insert-command.modal.ts`.
- Both renderers extend `MarkdownRenderChild`; lifecycle cleanup is automatic via `registerEvent`. They re-render on:
  - `metadataCache.on("changed")` — file content changed
  - custom `"dynamic-toc:settings"` event — fired through `app.metadataCache.trigger(…)` in `main.ts` when settings save
  - `workspace.on("active-leaf-change")` — code-block renderer only
- **Codeblock content is parsed as YAML** using Obsidian's built-in `parseYaml` (`src/utils/config.ts`). `mergeSettings` prefers defined (non-null) block values over global settings. Malformed YAML currently falls back to global settings silently — hardening this is the Task 5 roadmap item.
- **Known precedence bug (Task 5 target):** `main.ts` merges block options with global settings once at processor time and stores the fully-merged result; the settings-change handler re-merges against that already-complete config, so later global-settings changes never propagate to keys the user didn't set in the block. Fix direction: store the sparse parsed block options and merge lazily on each render.
- TOC generation is a pure function: `extractHeadings(CachedMetadata, TableOptions)` (`src/utils/extract-headings.ts`) reads `fileMetaData.headings` (no manual markdown parsing) and emits a markdown list string; `src/models/heading.ts` wraps `HeadingCache` and produces `[[#…]]` wiki-link hrefs. The string is rendered with `MarkdownRenderer`, so TOC links behave like native links.
- Settings persist via the standard `loadData()` / `saveData()` plugin API; defaults in `src/constants.ts`.
- Hacks to be aware of: `src/obsidian-ex.d.ts` augments `TFile` with the undocumented runtime prop `deleted` (roadmap: replace with vault delete events) and adds a typed `MetadataCache.on("dynamic-toc:settings", …)` overload for the custom event.
- Tests cover only pure functions (extract-headings snapshots, heading model) — nothing imports Obsidian runtime values except `parseYaml` in `config.ts`. Keep the obsidian-coupled surface thin so tests need no mocks.

## Conventions

- **Commit format:** Conventional Commits — `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:` prefixes required on every commit (release notes are generated from them).
- **TypeScript:** typed code only; no `any` unless documented with a comment explaining why.
- **YAML config format:** the `toc` codeblock uses YAML. Do not change the format or the language identifier.
- **No breaking changes** to existing codeblock syntax without owner approval.
- **Plugin ID** (`obsidian-dynamic-toc`) and codeblock identifier (` ```toc `) must never be renamed.
- **Mobile compatibility:** no Node.js/Electron APIs in the rendering path.
- **Branch strategy:**
  - `main` — stable, production-ready; never pushed to directly
  - `chore/fork-revival` — initial docs + audit PR
  - `feat/*` — feature branches, one per feature, branched from `main`
  - `fix/*` — bug fix branches

## AI Agent Operating Instructions

### Before starting any task

1. Read this file completely.
2. Run `git status` and `git branch` to confirm which branch you are on.
3. Confirm the task scope with the owner before writing code.

### Context hygiene — keep context windows clean

**Use subagents / spawned tasks for investigations.** When the task requires researching external sources (other repos, npm, Obsidian docs, community forums), spawn a separate agent or a new conversation for that research. Return a summary, not raw dumps. Pasting entire GitHub repos or npm READMEs into context is wasteful and degrades output quality.

**One task per conversation.** Do not carry implementation context from a research task into a coding task in the same thread. Start a new conversation for each phase.

**Summarize before continuing.** If a conversation exceeds ~40 messages or you feel context pressure, stop and produce a structured summary of decisions made so far. Paste that summary into a new conversation rather than continuing in the same thread.

### Token efficiency rules

- **Never `cat` the entire source tree speculatively.** Read specific files when you know you need them.
- **Never paste full file contents into your reasoning** when only a function or interface matters — quote the relevant section only.
- **Research tasks:** use targeted web searches with specific queries. Do not read entire documentation sites — fetch the specific page you need.
- **When writing code:** write the function, then the test, then stop. Do not generate alternative implementations speculatively.

### Git discipline

- Commit after every completed task, before moving to the next.
- Never commit `node_modules/`, built `main.js` / `styles.css` (root-level build artifacts), or `.obsidian/`.
- Always run `npm test` before committing code changes.
- Use `git diff --staged` to review what you are about to commit.

### Running investigations

When asked to research other plugins or external resources:

1. Open a **new conversation** (or isolated subagent) dedicated to the investigation.
2. Research the target and produce a structured markdown report.
3. Save the report to `docs/investigations/[topic].md` in the repo.
4. Return to the main task conversation with a link to the file, not the full content pasted inline.

### Approval gates

Stop and surface output for human review at every gate marked in the task list. Do not proceed past a gate without an explicit "approved" or "proceed" message from the owner. When in doubt, stop and ask.

### What NOT to do

- Do not rename plugin IDs, codeblock identifiers, or manifest IDs.
- Do not add dependencies without owner approval.
- Do not modify `versions.json` without also updating `manifest.json`.
- Do not push to `main` directly — all changes go through PRs.
- Do not implement features from investigations without explicit approval of the feature proposal list.

## Current Roadmap

See `README.md` for the user-facing roadmap. The items below are implementation-level tracking.

### PR #1 — `chore/fork-revival` (in progress)

- [x] Remove archive notice from README (Task 1)
- [x] Create CLAUDE.md (Task 2)
- [x] Compatibility audit and fixes (Task 3)
- [ ] TOC landscape investigation and feature proposal (Task 4)

### PR #2 — `feat/per-block-override` (pending PR #1 merge)

- [ ] Per-codeblock YAML parameter override system (Task 5) — includes fixing the settings-precedence bug documented in Architecture Notes

### Backlog (pending owner approval of feature proposal)

- [ ] TBD — populated after Task 4 investigation
- [ ] Replace `TFile.deleted` hack with `vault.on("delete")` subscriptions
- [ ] Community plugin directory re-listing (note: id `obsidian-dynamic-toc` contains "obsidian", which current submission rules prohibit for new submissions — needs a conversation with the Obsidian team about grandfathering)
