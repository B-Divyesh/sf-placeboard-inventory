# Adversarial first-read review 2 — FAIL

Reviewed 2026-08-28 against commit `c08a86536391b1c2cb9f40fda030c12e363bec69` and the live site at <https://placeboard-inventory.sociobot.in>. This review changed no product code.

## Verdict

**FAIL.** Two blocking findings remain: the desktop first screen does not show a first action, and the documented aggregate quality gate fails from a clean install. Three minor documentation/copy findings also remain. The demo, individual claim tests, privacy interception, core routing, and prior functional repairs otherwise verify.

## Findings

### Blocking

#### F-2-1 — Desktop first screen hides the required first action (reopens F-1-3)

- **Quote/location:** Live `/` at 1440×900. The visible screen contains **“Find household items by where you stored them”** and **“For households that share cupboards, bins, sheds, or homes and need one clear place to look.”** The required **“Try it with sample data”** action, its result, and all three facts are below the viewport.
- **Evidence:** In a fresh Chromium context, the heading occupied y=171–720 and the supporting sentence y=742–844. The primary action begins below y=872. The live desktop screenshot is therefore unable to answer “what should I click first?” without scrolling. At 390×844, all required first-screen content ends at y=776.
- **Why this fails:** A cold desktop visitor can identify the product and audience but cannot see a next step in the first 900px. This regresses the exact first-screen problem identified as F-1-3; the prior closure claimed desktop facts fit above the fold, which does not match the current live page.
- **Concrete fix:** Reduce desktop hero height/type scale or use a two-line desktop headline. Ensure **“Try it with sample data”**, **“Opens a stocked sample. Your inventory is unchanged.”**, and the three fact lines all finish within a 1440×900 viewport. Add a desktop first-screen Playwright assertion alongside the existing mobile-only assertion.

#### F-2-2 — `npm test` does not pass as the documented quality gate

- **Quote/location:** README, **“`npm test` builds the production app and runs Playwright claim, accessibility, mobile, privacy, offline, routing, and keyboard tests.”**
- **Evidence:** After `npm ci`, `npm test` built successfully, then ran 19 tests and exited 1: 8 passed and 11 failed. After the offline test, later tests failed at `http://127.0.0.1:4173` with `net::ERR_CONNECTION_REFUSED`, including `@claim:demo-sandbox`, `@claim:local-data`, `@claim:free-core`, `@claim:place-tree`, and `@claim:quick-search`. Holding `npm run preview -- --host 127.0.0.1` separately makes `npx playwright test` pass 19/19, so the observed failure is in the self-starting test harness rather than those product flows.
- **Why this fails:** The repository’s advertised one-command verification does not reliably verify the product. A clean worker following the README receives failing claim and accessibility tests even though individual checks can pass.
- **Concrete fix:** Make the Playwright `webServer` lifecycle stable under the full suite, then add a CI/local regression check that runs the exact `npm test` script with no pre-existing server. Do not require a manually started preview server.

### Minor

#### F-2-3 — A public negative capability claim has no claims entry

- **Quote/location:** landing, **“There is no cloud sync, product database, insurance valuation, or photo upload.”**
- **Why this fails:** This is a set of observable product/privacy promises, but `.factory/claims.json` has no entry that names or tests any of them. The existing local-data test only observes a demo flow’s network requests; it does not establish that the product offers no sync, valuation, or upload path.
- **Concrete fix:** Prefer the narrower tested rewrite **“Inventory data stays in this browser.”** Remove the untestable list, or add separate claims and observable tests for each retained capability boundary.

#### F-2-4 — README sample-size promise is unlisted

- **Quote/location:** README demo section, **“The demo includes seven places, five items, and three moves.”**
- **Why this fails:** Visitors and verifiers can rely on this concrete sample description. It is indirectly exercised by the JSON-export test but is not a claim in `.factory/claims.json` and that claim does not list the README as a location.
- **Concrete fix:** Add a `sample-data` claim whose demo test asserts 7 places, 5 items, and 3 moves and lists the README location; alternatively remove the counts.

#### F-2-5 — One process heading is not understandable out of context

- **Quote/location:** landing step heading, **“Put items there.”**
- **Why this fails:** In a heading list, “there” has no referent. This conflicts with the plain-words requirement that headings make sense when heard independently.
- **Concrete rewrite:** **“Add items to places.”**

## Cold first-screen record

No scrolling occurred before these observations.

| Viewport | What it does | For whom | What to click first | Result |
| --- | --- | --- | --- | --- |
| 390×844 | Find household items by stored place | Households sharing cupboards, bins, sheds, or homes | Try sample data | All three answers visible; action result and three facts also visible. |
| 1440×900 | Find household items by stored place | Same supporting sentence | Not visible | **Blocking F-2-1.** The primary action begins below the viewport. |

## Copy audit

Counts treat a hyphenated term, URL, or command as one word. Headings and action labels are included because the plain-words review requires them to work independently. No audited copy exceeds 22 words or uses a banned marketing adjective. `F-2-3`, `F-2-4`, and `F-2-5` identify the flags.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Household inventory organized by place | 5 | Pass |
| Find household items by where you stored them | 8 | Pass |
| For households that share cupboards, bins, sheds, or homes and need one clear place to look. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a stocked sample. | 4 | Pass |
| Your inventory is unchanged. | 4 | Pass |
| Start my inventory | 3 | Pass |
| Works offline after your first visit. | 6 | Listed `offline-reload` |
| Inventory data stays on this device. | 6 | Listed `local-data` |
| All inventory tools are free. | 5 | Listed `free-core` |
| Household shelves linked by cyan, amber, and pink lights (image alt) | 9 | Pass |
| See every place | 3 | Pass |
| One item can sit in several places. | 7 | Listed `multi-location-move` |
| Search shows every quantity and its full path. | 8 | Listed `quick-search` |
| Search: AA batteries | 3 | Pass |
| Home / Hall cupboard | 3 | Pass |
| Home / Garage / Red tool bin | 5 | Pass |
| 8 AA batteries | 3 | Pass |
| 4 AA batteries | 3 | Pass |
| How to track an item | 6 | Pass |
| Build the same simple map you use when you tell someone where to look. | 14 | Pass |
| Name your places | 3 | Pass |
| Add a home, room, shelf, or bin. | 7 | Listed `place-tree` |
| Nest bins and shelves inside rooms. | 6 | Listed `place-tree` |
| Put items there | 3 | F-2-5 |
| Add a quantity to one place. | 6 | Listed `multi-location-move` |
| Add the same item to another place later. | 8 | Listed `multi-location-move` |
| Record each move | 3 | Pass |
| Choose the old place and new place. | 7 | Listed `multi-location-move` |
| Placeboard updates both counts and keeps the history. | 8 | Listed `multi-location-move` |
| Made for finding, not valuing | 5 | Pass |
| This household inventory stays in this browser. | 7 | Listed `local-data` |
| It does not value items or run a warehouse. | 9 | Pass: scope disclaimer |
| Keep and export your inventory | 5 | Pass |
| Your inventory uses browser storage. | 5 | Listed `local-data` |
| Export JSON or CSV whenever you want a backup. | 9 | Listed `json-export`, `csv-export` |
| What Placeboard does not do | 5 | Pass |
| There is no cloud sync, product database, insurance valuation, or photo upload. | 12 | F-2-3 |
| Find shared household items by place. | 6 | Pass |
| Original generated imagery · v1.1.0 · polish-1 | 5 | Pass: build/provenance label |
| Privacy / Terms / Built by Param Factory | 6 | Pass: navigation labels |

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Find shared household items by place and record every move. | 10 | Pass |
| Placeboard is for households that use cupboards, shelves, bins, sheds, cars, or multiple homes. | 14 | Pass |
| One item can have quantities in several places. | 8 | Listed `multi-location-move` |
| A move updates both place counts and adds a dated history entry. | 11 | Listed `multi-location-move` |
| Live site | 2 | Pass |
| Try sample data without changing your inventory | 7 | Pass |
| Open `/?demo=1` or `/demo`, or visit the live demo URL. | 9 | Pass |
| The demo includes seven places, five items, and three moves. | 10 | F-2-4 |
| It uses a separate browser database. | 6 | Listed `demo-sandbox` |
| Leaving the demo deletes its changes and never changes the real inventory. | 11 | Listed `demo-sandbox` |
| The sample is bundled with the app. | 7 | Covered by `offline-reload` sandbox |
| The demo works offline after the first visit. | 8 | Listed `offline-reload` |
| Technical note: demo data uses `placeboard-demo-v1`; real data uses `placeboard-real-v1`. | 9 | Pass: maintainer detail |
| What Placeboard Inventory does | 4 | Pass |
| Builds a nested place tree for homes, rooms, shelves, and bins. | 10 | Listed `place-tree` |
| Keeps one item in several places with a quantity at each place. | 12 | Listed `multi-location-move` |
| Records item quantities moving between places or in and out of the inventory. | 12 | Listed `multi-location-move` |
| Lets you edit or archive items and places while keeping move history. | 11 | Listed `record-correction` |
| Requires a destination before archiving an occupied place and offers undo. | 11 | Listed `record-correction` |
| Searches item names, notes, and full place paths. | 8 | Listed `quick-search` |
| Keeps dated move history. | 4 | Listed `multi-location-move` |
| Prints all place labels or one chosen label. | 9 | Listed `print-labels` |
| Exports full data and move history as JSON. | 9 | Listed `json-export` |
| Exports current quantities and place paths as CSV. | 9 | Listed `csv-export` |
| Imports Placeboard JSON and CSV files. | 6 | Listed `file-import` |
| Stores inventory in this browser. | 5 | Listed `local-data` |
| All inventory tools are free. | 5 | Listed `free-core` |
| Placeboard is not an insurance record, valuation tool, barcode catalog, or warehouse system. | 13 | Pass: scope disclaimer |
| Develop and verify | 3 | Pass |
| Requirements: Node.js 22 and npm. | 5 | Pass |
| `npm run test:unit` runs the Vitest data and deployment-policy tests. | 9 | Pass |
| `npm test` builds the production app and runs Playwright claim, accessibility, mobile, privacy, offline, routing, and keyboard tests. | 16 | F-2-2: command currently fails |
| `npm run build` writes the static site to `dist/`, with `dist/index.html` at its root. | 14 | Pass |
| To run one public claim | 5 | Pass |
| The Playwright version is pinned to `1.58.2`. | 7 | Pass |
| Set `PLAYWRIGHT_BROWSERS_PATH` to the worker browser cache when needed. | 9 | Pass |
| Privacy and data ownership | 4 | Pass |
| Inventory use makes no third-party request. | 6 | Listed `local-data` |
| Data stays in local browser storage unless you export it. | 10 | Listed `local-data` |
| See `/privacy` and `/terms` in the app. | 6 | Pass |
| Deployment | 1 | Pass |
| Deploy the contents of `dist/` as a static site. | 9 | Pass |
| `staticwebapp.config.json` enumerates application routes, returns the styled 404 for unknown paths, sets security headers, caches hashed assets, and revalidates HTML and `sw.js`. | 18 | Pass: deployment documentation |
| The factory owns DNS and infrastructure. | 6 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See [LICENSE](./LICENSE). | 2 | Pass |

## Claims and sandbox verification

`npm ci` completed cleanly. Every command named by `.factory/claims.json` was run separately; all 12 passed. `npm run test:unit` passed 6/6 and `npm run build` passed. The failure in F-2-2 is the separate aggregate `npm test` execution, not an individual claim assertion.

| Claim ID | Result | Observed sandbox evidence |
| --- | --- | --- |
| offline-reload | Pass | Demo reload stayed usable offline after service-worker control. |
| demo-sandbox | Pass | A demo edit was discarded on Start for real. |
| local-data | Pass | Demo flow emitted only same-origin requests. |
| free-core | Pass | Creation, move, print, import, and export remained available without a license. |
| multi-location-move | Pass | Counts and dated move history changed for sample batteries. |
| record-correction | Pass | Edit, archive, destination, history, and undo flowed. |
| place-tree | Pass | Nested Home → Garage → Red tool bin appeared. |
| quick-search | Pass | Name, note, and path searches returned matches. |
| csv-export | Pass | Download contained expected header and sample rows. |
| json-export | Pass | Download contained places, items, quantities, and moves. |
| file-import | Pass | Sample CSV and JSON both appeared in demo. |
| print-labels | Pass | All-place and chosen-place label views opened. |

In an additional fresh live context, the demo opened directly at `/demo` with the persistent **“Demo — sample data, nothing is saved to your inventory”** banner, realistic quantities and history, Reset demo, and Start for real. After moving one battery, Reset restored 8/4 batteries; Start for real opened an empty `/inventory`. IndexedDB inspection showed only `placeboard-real-v1` after leaving the demo. Network interception saw no cross-origin request. The demo is therefore a real one-click sandbox, not a blocker.

## Earlier finding verification

The earlier review, polish report, and handoff were read in full. The table records live and source confirmation, rather than accepting a prior “fixed” label.

| Earlier finding | Current check |
| --- | --- |
| F-1-1 | Confirmed fixed: no paid checkout, license UI, or billing endpoint remains in live copy/source. |
| F-1-2 | Confirmed fixed: two arbitrary live routes return HTTP 404 and render the branded header/footer, legal links, one h1, and return link. |
| F-1-3 | **Regressed; reopened as F-2-1.** Mobile fits, but desktop hides the action and facts. |
| F-1-4 | Confirmed fixed: merchant-of-record copy is absent. |
| F-1-5 | Confirmed fixed: billing-routing README copy is absent. |
| F-1-6 | Confirmed fixed: ambiguous product-ID/payment-provider claim is absent. |
| F-1-7 | Confirmed fixed: no license verification path remains; live demo traffic stayed same-origin. |
| F-1-8 | Confirmed fixed: copy now says “Nest bins and shelves inside rooms.” |
| F-1-9 | Confirmed fixed: live mobile interactive controls measured at least 44px in the reviewed routes. |
| F-1-10 | Confirmed fixed: source and tagged test expose item/place edit, archive, destination, history retention, and undo. |
| F-1-11 | Confirmed fixed: headline is “Find household items by where you stored them.” |
| F-1-12 | Confirmed fixed: eyebrow says “Household inventory organized by place.” |
| F-1-13 | Confirmed fixed: fact says “All inventory tools are free.” |
| F-1-14 | Confirmed fixed: heading is “How to track an item.” |
| F-1-15 | Confirmed fixed: limits copy names browser storage and no valuation/warehouse use. |
| F-1-16 | Confirmed fixed: heading is “Keep and export your inventory.” |
| F-1-17 | Confirmed fixed: heading is “What Placeboard does not do.” |
| F-1-18 | Confirmed fixed: README heading is “Try sample data without changing your inventory.” |
| F-1-19 | Confirmed fixed: visitor copy says browser storage/database; namespace is in a technical note. |
| F-1-20 | Confirmed fixed: README heading is “What Placeboard Inventory does.” |
| F-1-21 | Confirmed fixed: README uses item quantities rather than stock. |
| F-1-22 | Confirmed fixed: unavailable paid label-style copy is absent. |

## Structure, routing, and leverage checks

- Each reviewed route (`/`, `/demo`, `/inventory`, `/privacy`, `/terms`, `/print?demo=1`, `/404.html`) had one h1, a route-specific title, description, canonical, OG image, favicon, and a consistent header/footer with Privacy and Terms.
- Deep links rendered the correct content. Privacy navigation moved focus to its h1; the existing full Playwright suite passes route-focus/back metadata when a stable server is supplied. The live crawl found HTTP 200 for all internal and external links and HTTP 404 for arbitrary unknown routes.
- The visual system is distinct rather than generic: night-market storage art, clipped sign controls, cyan/amber/pink routing signals, and the designed 404 match `.factory/design.md`.
- The brief implies no missing AI feature: household inventory’s core task is local tracking, and decorative AI would add privacy and key-management cost without solving the stated job. Import, export, labels, search, multi-place quantities, correction, and offline use are already present.

## What would make this perfect

Make the desktop hero obey the same first-screen contract that mobile does, make `npm test` self-contained and stable, remove or test the unlisted capability boundary and sample-size promise, and replace the context-dependent “Put items there” heading. Re-run the full suite with no manually held preview server after those changes.
