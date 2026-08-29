# Adversarial first-read review 4 — PASS

Reviewed 2026-08-29 UTC against the live site at <https://placeboard-inventory.sociobot.in> and a fresh local clone. No product code was changed.

## Verdict

**PASS.** There are zero findings, blocking or minor. The page explains the job, audience, and first action before scrolling at both required viewports. The one-click sample is realistic, isolated, resettable, and does not contact another origin. All thirteen declared claim commands passed independently from a clean clone. Aggregate unit, browser, build, audit, route, metadata, keyboard, link, and visual-identity checks also passed.

## Cold first-read record

No scrolling occurred before this record. Fresh Chromium contexts recorded no console errors and only `https://placeboard-inventory.sociobot.in` requests.

| Viewport | What it does | For whom | First click | Result |
| --- | --- | --- | --- | --- |
| 390×844 | Finds household items by where they were stored. | Households sharing cupboards, bins, sheds, or homes. | **Try it with sample data**. | All three answers, the post-click result, and the three facts were visible. |
| 1440×900 | Finds household items by where they were stored. | The same stated household audience. | **Try it with sample data**. | All three answers, the post-click result, and the three facts were visible. |

Exact first-screen copy: **“Find household items by where you stored them”**; **“For households that share cupboards, bins, sheds, or homes and need one clear place to look.”**; **“Try it with sample data”**; and **“Opens a stocked sample. Your inventory is unchanged.”** The visible facts are **“Works offline after your first visit.”**, **“Inventory data stays on this device.”**, and **“All inventory tools are free.”**

The captured first screens are [mobile](./review-4-mobile.png) and [desktop](./review-4-desktop.png). The night-market sign treatment, generated storage-wall art, clipped controls, and cyan/amber/pink place signals are distinct from a generic SaaS template and match `.factory/design.md`.

## Copy audit

Word counts treat hyphenated words, URLs, and commands as one word. Buttons, headings, labels, and alt text are included because they must make sense when read independently. No public sentence exceeds 22 words, uses a banned marketing adjective, relies on a metaphor, uses inconsistent inventory terms, or has a non-result-naming action. All functional reliance claims are listed in `.factory/claims.json`; no unlisted claim was found.

### Landing page

| Copy unit | Words | Check |
| --- | ---: | --- |
| Placeboard Inventory | 2 | Pass |
| Inventory | 1 | Pass |
| Demo | 1 | Pass |
| Privacy | 1 | Pass |
| Household inventory organized by place | 5 | Pass |
| Find household items by where you stored them | 8 | Pass |
| For households that share cupboards, bins, sheds, or homes and need one clear place to look. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a stocked sample. Your inventory is unchanged. | 8 | Pass: `demo-sandbox` |
| Start my inventory | 3 | Pass |
| Works offline after your first visit. | 6 | Pass: `offline-reload` |
| Inventory data stays on this device. | 6 | Pass: `local-data` |
| All inventory tools are free. | 5 | Pass: `free-core` |
| Household shelves linked by cyan, amber, and pink lights | 9 | Pass: useful alt text |
| See every place | 3 | Pass |
| One item can sit in several places. | 7 | Pass: `multi-location-move` |
| Search shows every quantity and its full path. | 8 | Pass: `quick-search`, `multi-location-move` |
| Search: AA batteries | 3 | Pass: sample label |
| Home / Hall cupboard | 3 | Pass: sample path |
| Home / Garage / Red tool bin | 5 | Pass: sample path |
| 8 AA batteries | 3 | Pass: sample quantity |
| 4 AA batteries | 3 | Pass: sample quantity |
| How to track an item | 6 | Pass |
| Build the same simple map you use when you tell someone where to look. | 14 | Pass |
| Name your places | 3 | Pass |
| Add a home, room, shelf, or bin. | 7 | Pass: `place-tree` |
| Nest bins and shelves inside rooms. | 6 | Pass: `place-tree` |
| Add items to places | 4 | Pass |
| Add a quantity to one place. | 6 | Pass: `multi-location-move` |
| Add the same item to another place later. | 8 | Pass: `multi-location-move` |
| Record each move | 3 | Pass |
| Choose the old place and new place. | 7 | Pass: `multi-location-move` |
| Placeboard updates both counts and keeps the history. | 8 | Pass: `multi-location-move` |
| Keep your inventory in this browser | 6 | Pass |
| Inventory data stays in this browser unless you export it. | 10 | Pass: `local-data` |
| Back up your inventory | 4 | Pass |
| Export JSON or CSV whenever you want a backup. | 9 | Pass: `json-export`, `csv-export` |
| Bring in an existing inventory | 5 | Pass |
| Import a Placeboard JSON or CSV file. | 7 | Pass: `file-import` |
| Find household items by place. | 6 | Pass |
| Original generated imagery · v1.1.1 · polish-3 | 5 | Pass: provenance/build label |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |

### README

| Copy unit | Words | Check |
| --- | ---: | --- |
| Find shared household items by place and record every move. | 10 | Pass: `multi-location-move` |
| Placeboard is for households that use cupboards, shelves, bins, sheds, cars, or multiple homes. | 14 | Pass |
| One item can have quantities in several places. | 8 | Pass: `multi-location-move` |
| A move updates both place counts and adds a dated history entry. | 12 | Pass: `multi-location-move` |
| Live site: https://placeboard-inventory.sociobot.in | 3 | Pass |
| Try sample data without changing your inventory | 7 | Pass |
| Open `/?demo=1` or `/demo`, or visit the live demo URL. | 9 | Pass |
| The demo includes seven places, five items, and three moves. | 10 | Pass: `sample-data` |
| It uses a separate browser database. | 6 | Pass: `demo-sandbox` |
| Leaving the demo deletes its changes and never changes the real inventory. | 11 | Pass: `demo-sandbox` |
| The sample is bundled with the app. | 7 | Pass: offline fixture |
| The demo works offline after the first visit. | 8 | Pass: `offline-reload` |
| Technical note: demo data uses `placeboard-demo-v1`; real data uses `placeboard-real-v1`. | 9 | Pass: maintainer detail |
| What Placeboard Inventory does | 4 | Pass |
| Builds a nested place tree for homes, rooms, shelves, and bins. | 11 | Pass: `place-tree` |
| Keeps one item in several places with a quantity at each place. | 12 | Pass: `multi-location-move` |
| Records item quantities moving between places or in and out of the inventory. | 13 | Pass: `multi-location-move` |
| Lets you edit or archive items and places while keeping move history. | 12 | Pass: `record-correction` |
| Requires a destination before archiving an occupied place and offers undo. | 11 | Pass: `record-correction` |
| Searches item names, notes, and full place paths. | 8 | Pass: `quick-search` |
| Keeps dated move history. | 4 | Pass: `multi-location-move` |
| Prints all place labels or one chosen label. | 8 | Pass: `print-labels` |
| Exports full data and move history as JSON. | 8 | Pass: `json-export` |
| Exports current quantities and place paths as CSV. | 8 | Pass: `csv-export` |
| Imports Placeboard JSON and CSV files. | 6 | Pass: `file-import` |
| Stores inventory in this browser. | 5 | Pass: `local-data` |
| All inventory tools are free. | 5 | Pass: `free-core` |
| Inventory data stays in this browser unless you export it. | 10 | Pass: `local-data` |
| Requirements: Node.js 22 and npm. | 5 | Pass: maintainer instruction |
| `npm run test:unit` runs the Vitest data and deployment-policy tests. | 9 | Pass: observed |
| `npm test` builds the production app and runs Playwright claim, accessibility, mobile, privacy, offline, routing, and keyboard tests. | 16 | Pass: observed |
| `npm run build` writes the static site to `dist/`, with `dist/index.html` at its root. | 14 | Pass: observed |
| To run one public claim | 5 | Pass |
| The Playwright version is pinned to `1.58.2`. | 7 | Pass |
| Set `PLAYWRIGHT_BROWSERS_PATH` to the worker browser cache when needed. | 9 | Pass |
| Inventory use makes no third-party request. | 6 | Pass: `local-data` |
| Data stays in local browser storage unless you export it. | 10 | Pass: `local-data` |
| See `/privacy` and `/terms` in the app. | 6 | Pass |
| Deploy the contents of `dist/` as a static site. | 9 | Pass: maintainer instruction |
| `staticwebapp.config.json` enumerates application routes, returns the styled 404 for unknown paths, sets security headers, caches hashed assets, and revalidates HTML and `sw.js`. | 18 | Pass: deployment test |
| The factory owns DNS and infrastructure. | 6 | Pass: repository responsibility |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

Terminology remains consistent: **place**, **item**, **quantity**, **move**, **demo**, and **export** each refer to one concept throughout.

## Demo, privacy, and claims

The landing action reached `/demo` in one click. Its first screen already showed the inventory in use: five realistic household items, seven nested places, three moves, and the persistent **“Demo — sample data, nothing is saved to your inventory”** banner with **Reset demo** and **Start for real**. After a two-battery change, Reset restored the sample. A real-only place created before demo entry remained after leaving; demo items did not. The browser then listed only `placeboard-real-v1`, confirming that the demo database was discarded. The complete flow made same-origin requests only.

From fresh clone `/tmp/placeboard-review4-D4Z9Gp/repo`, `npm ci` completed with zero vulnerabilities. Each exact command in `.factory/claims.json` was then run separately, and passed:

| Claim | Result |
| --- | --- |
| `offline-reload` | Pass |
| `demo-sandbox` | Pass |
| `sample-data` | Pass |
| `local-data` | Pass |
| `free-core` | Pass |
| `multi-location-move` | Pass |
| `record-correction` | Pass |
| `place-tree` | Pass |
| `quick-search` | Pass |
| `csv-export` | Pass |
| `json-export` | Pass |
| `file-import` | Pass |
| `print-labels` | Pass |

The clean clone also passed `npm run test:unit` (10/10), `npm test` (21/21), `npm run build`, and `npm audit --audit-level=high` (zero vulnerabilities). The offline claim specifically verified service-worker-controlled `/demo` reload after the first visit.

## History verification

Every earlier review, polish report, verification report, and handoff was read. The following confirms fixes on the live site and in the current source; none was accepted merely because a prior report marked it fixed.

| Earlier findings | Current confirmation |
| --- | --- |
| F-1-1, F-1-4 to F-1-7, F-1-22 | No checkout, merchant, license, billing, or paid-style copy/runtime remains; all tools are free. |
| F-1-2 | An arbitrary live path returned HTTP 404 with the designed header, footer, legal links, one h1, and recovery action. |
| F-1-3 / F-2-1 | Required action, result, and facts end at 730 px mobile and 840 px desktop. |
| F-1-8, F-1-10, F-1-11 to F-1-21, F-2-5 | Current copy is bounded/plain and the edit/archive, tree, move, export, import, and label flows are covered by current tests. |
| F-1-9 | Reviewed visible controls meet the 44 px mobile target in the browser suite. |
| F-2-2 | Clean-clone aggregate `npm test` passed without a manually held server. |
| F-2-3 / F-3-1 | No unlisted negative capability boundary remains; static offline/404 documents have full route metadata. |
| F-2-4 | Sample counts are now the declared and passing `sample-data` claim. |
| F-3-2 | Package, manifest, worker, footer, and fallback pages report version 1.1.1. |

## Structure and leverage checks

`/`, `/demo`, `/inventory`, `/privacy`, `/terms`, `/print?demo=1`, `/offline.html`, and `/404.html` each had one h1, one main landmark, a route-specific title, description, canonical, OG/Twitter metadata, favicon, and consistent header/footer with Privacy and Terms. The unknown route returned HTTP 404. All discovered navigable links returned HTTP 200, except explicit `mailto:` links; the 404 page’s own `#main` skip link correctly remains on the already-404 document. Privacy navigation focused its h1; browser Back focused the landing h1. The browser suite found no serious or critical Axe result.

The brief does not imply a missing AI feature: private, offline household tracking benefits more from the existing search, import/export, labels, and correction flows. Adding a key-bearing or decorative model action would not improve this job-to-be-done.

## What would make this perfect

Keep the current evidence discipline as future features are added: add a declared observable claim before making a new public promise, preserve the one-click sandbox boundary, and rerun the cold first-screen checks at both viewports after any landing-page layout change.
