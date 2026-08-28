# Adversarial first-read review 3 — FAIL

Reviewed 2026-08-28 against commit `6c7dccae1d873b68924e1312f065adaedc3f8d47`
and the live site at <https://placeboard-inventory.sociobot.in>. No product
code was changed.

## Verdict

**FAIL.** One blocking and two minor findings remain. The cold first screen,
one-click demo, demo isolation, every declared claim test, aggregate quality
gate, routing, accessibility smoke check, and dead-link crawl pass. However,
the earlier unlisted negative-capability finding was only narrowed: the live
landing page and README still make valuation/warehouse capability claims with
no `.factory/claims.json` entry or tagged test. The offline and 404 documents
also have incomplete social metadata, and the visible release version differs
from the package and manifest version.

## Findings

### Blocking

#### F-2-3 — Negative capability claims remain unlisted (reopened)

- **Quote/location:** live landing page, twice: **“It does not value items or
  run a warehouse.”** README: **“Placeboard is not an insurance record,
  valuation tool, barcode catalog, or warehouse system.”**
- **Evidence:** `.factory/claims.json` has no entry for valuation, insurance,
  barcode, or warehouse boundaries. None of the 13 tagged claim tests asserts
  those observable boundaries. The prior F-2-3 sentence was removed, but its
  untested valuation/warehouse promise remains in narrower wording.
- **Why this fails:** a visitor can rely on a capability boundary just as they
  can rely on a positive feature. The claims contract does not exempt scope
  disclaimers. Because this is a half-fix of an earlier finding, it is blocking
  again under the review-history rule.
- **Concrete fix:** remove the two capability sentences and keep the tested
  positive statement **“Inventory data stays in this browser.”** If the limits
  must remain, add one `scope-boundaries` claims entry and exactly one tagged
  test that crawls every product route and exported schema and confirms there
  are no value, proof-of-ownership, barcode, or warehouse fields or actions.

### Minor

#### F-3-1 — The offline and 404 documents have incomplete route metadata

- **Quote/location:** live `/offline.html` and `/404.html`, plus an arbitrary
  missing route rewritten to the 404 document.
- **Evidence:** `/offline.html` has no Open Graph or Twitter title,
  description, or image tags. `/404.html` has complete Open Graph tags and
  `twitter:card`, but lacks `twitter:title`, `twitter:description`, and
  `twitter:image`. The offline route is also absent from `sitemap.xml` and is
  not marked `noindex`.
- **Why this fails:** these are user-facing routes, but their shared previews
  do not meet the per-route metadata contract. The offline document also has
  ambiguous indexing intent.
- **Concrete fix:** give both static documents the same complete OG and Twitter
  metadata set as application routes. Either list `/offline.html` in the
  sitemap or add `noindex` and document it as an operational fallback.

#### F-3-2 — The displayed and packaged versions disagree

- **Quote/location:** every live footer says **“v1.1.1 · polish-2”**;
  `package.json`, `package-lock.json`, and the PWA manifest start URL still say
  `1.1.0`.
- **Why this fails:** the required footer build identifier cannot be trusted
  for support or cache diagnosis when three release sources identify a
  different version.
- **Concrete fix:** set the package, lockfile, manifest cache-buster, service
  worker cache name, and visible footer from one `1.1.1` release value. Add a
  build test that rejects mismatches.

## Cold first-screen record

No scrolling occurred before these observations.

| Viewport | What it does | For whom | What to click first | Result |
| --- | --- | --- | --- | --- |
| 390×844 | Find household items by their stored place | Households sharing cupboards, bins, sheds, or homes | Try it with sample data | Pass. The action ends at y=523; its explanation at y=567; all facts end at y=730. |
| 1440×900 | Find household items by their stored place | The same household sentence | Try it with sample data | Pass. The action ends at y=681; its explanation at y=725; all facts end at y=840. |

The first screen answers what the product does, who it serves, and what to do
first in both required viewports. The exact headline is **“Find household items
by where you stored them.”** The exact audience sentence is **“For households
that share cupboards, bins, sheds, or homes and need one clear place to look.”**

## Copy audit

Counts treat a hyphenated term, URL, or one inline-code span as one word.
Headings, actions, factual labels, and image alt text are included because they
must also work on first read. No unit exceeds 22 words, contains a banned
marketing word, changes the place/item/move/quantity terminology, or uses a
non-result-naming landing action. F-2-3 is the only claim-coverage flag.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Household inventory organized by place | 5 | Pass |
| Find household items by where you stored them | 8 | Pass |
| For households that share cupboards, bins, sheds, or homes and need one clear place to look. | 16 | Pass |
| Try it with sample data | 5 | Pass: result-naming action |
| Opens a stocked sample. | 4 | Pass |
| Your inventory is unchanged. | 4 | Listed `demo-sandbox` |
| Start my inventory | 3 | Pass: result-naming action |
| Works offline after your first visit. | 6 | Listed `offline-reload` |
| Inventory data stays on this device. | 6 | Listed `local-data` |
| All inventory tools are free. | 5 | Listed `free-core` |
| Household shelves linked by cyan, amber, and pink lights (image alt) | 9 | Pass |
| See every place | 3 | Pass |
| One item can sit in several places. | 7 | Listed `multi-location-move` |
| Search shows every quantity and its full path. | 8 | Listed `quick-search`, `multi-location-move` |
| Search: AA batteries | 3 | Pass: preview label |
| Home / Hall cupboard | 3 | Pass: preview data |
| Home / Garage / Red tool bin | 5 | Pass: preview data |
| 8 AA batteries | 3 | Pass: preview data |
| 4 AA batteries | 3 | Pass: preview data |
| How to track an item | 6 | Pass |
| Build the same simple map you use when you tell someone where to look. | 14 | Pass |
| Name your places | 3 | Pass |
| Add a home, room, shelf, or bin. | 7 | Listed `place-tree` |
| Nest bins and shelves inside rooms. | 6 | Listed `place-tree` |
| Add items to places | 4 | Pass |
| Add a quantity to one place. | 6 | Listed `multi-location-move` |
| Add the same item to another place later. | 8 | Listed `multi-location-move` |
| Record each move | 3 | Pass |
| Choose the old place and new place. | 7 | Listed `multi-location-move` |
| Placeboard updates both counts and keeps the history. | 8 | Listed `multi-location-move` |
| Made for finding, not valuing | 5 | F-2-3 |
| This household inventory stays in this browser. | 7 | Listed `local-data` |
| It does not value items or run a warehouse. | 9 | F-2-3: unlisted claim; appears twice |
| Keep and export your inventory | 5 | Pass |
| Your inventory uses browser storage. | 5 | Listed `local-data` |
| Export JSON or CSV whenever you want a backup. | 9 | Listed `json-export`, `csv-export` |
| What Placeboard does not do | 5 | F-2-3 context |
| Find household items by place. | 6 | Pass |
| Original generated imagery · v1.1.1 · polish-2 | 5 | F-3-2 version mismatch |
| Privacy / Terms / Built by Param Factory | 6 | Pass: navigation labels |

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Placeboard Inventory | 2 | Pass |
| Find shared household items by place and record every move. | 10 | Listed `multi-location-move` |
| Placeboard is for households that use cupboards, shelves, bins, sheds, cars, or multiple homes. | 14 | Pass |
| One item can have quantities in several places. | 8 | Listed `multi-location-move` |
| A move updates both place counts and adds a dated history entry. | 12 | Listed `multi-location-move` |
| Live site: `https://placeboard-inventory.sociobot.in` | 3 | Pass |
| Try sample data without changing your inventory | 7 | Pass |
| Open `/?demo=1` or `/demo`, or visit `https://placeboard-inventory.sociobot.in/?demo=1`. | 7 | Pass |
| The demo includes seven places, five items, and three moves. | 10 | Listed `sample-data` |
| It uses a separate browser database. | 6 | Listed `demo-sandbox` |
| Leaving the demo deletes its changes and never changes the real inventory. | 11 | Listed `demo-sandbox` |
| The sample is bundled with the app. | 7 | Confirmed by offline demo and source |
| The demo works offline after the first visit. | 8 | Listed `offline-reload` |
| Technical note: demo data uses `placeboard-demo-v1`; real data uses `placeboard-real-v1`. | 10 | Confirmed in source |
| What Placeboard Inventory does | 4 | Pass |
| Builds a nested place tree for homes, rooms, shelves, and bins. | 11 | Listed `place-tree` |
| Keeps one item in several places with a quantity at each place. | 12 | Listed `multi-location-move` |
| Records item quantities moving between places or in and out of the inventory. | 13 | Listed `multi-location-move` |
| Lets you edit or archive items and places while keeping move history. | 12 | Listed `record-correction` |
| Requires a destination before archiving an occupied place and offers undo. | 11 | Listed `record-correction` |
| Searches item names, notes, and full place paths. | 8 | Listed `quick-search` |
| Keeps dated move history. | 4 | Listed `multi-location-move` |
| Prints all place labels or one chosen label. | 8 | Listed `print-labels` |
| Exports full data and move history as JSON. | 8 | Listed `json-export` |
| Exports current quantities and place paths as CSV. | 8 | Listed `csv-export` |
| Imports Placeboard JSON and CSV files. | 6 | Listed `file-import` |
| Stores inventory in this browser. | 5 | Listed `local-data` |
| All inventory tools are free. | 5 | Listed `free-core` |
| Placeboard is not an insurance record, valuation tool, barcode catalog, or warehouse system. | 13 | F-2-3: unlisted claim |
| Develop and verify | 3 | Pass |
| Requirements: Node.js 22 and npm. | 5 | Pass: maintainer requirement |
| `npm run test:unit` runs the Vitest data and deployment-policy tests. | 8 | Verified |
| `npm test` builds the production app and runs Playwright claim, accessibility, mobile, privacy, offline, routing, and keyboard tests. | 17 | Verified |
| `npm run build` writes the static site to `dist/`, with `dist/index.html` at its root. | 12 | Verified |
| To run one public claim | 5 | Pass |
| The Playwright version is pinned to `1.58.2`. | 7 | Confirmed in package files |
| Set `PLAYWRIGHT_BROWSERS_PATH` to the worker browser cache when needed. | 9 | Pass: maintainer instruction |
| Privacy and data ownership | 4 | Pass |
| Inventory use makes no third-party request. | 6 | Listed `local-data` |
| Data stays in local browser storage unless you export it. | 10 | Listed `local-data` |
| See `/privacy` and `/terms` in the app. | 7 | Verified links |
| Deployment | 1 | Pass |
| Deploy the contents of `dist/` as a static site. | 9 | Pass: maintainer instruction |
| `staticwebapp.config.json` enumerates application routes, returns the styled 404 for unknown paths, sets security headers, caches hashed assets, and revalidates HTML and `sw.js`. | 22 | Verified by unit test and live route |
| The factory owns DNS and infrastructure. | 6 | Pass: repository responsibility |
| License | 1 | Pass |
| MIT. | 1 | Confirmed by `LICENSE` |
| See `LICENSE`. | 2 | Pass |

Terminology is consistent: **place** is a physical location, **item** is a
tracked object, **quantity** is its count at a place, **move** is a quantity
change, **demo** is the sample sandbox, and **export** is a downloaded copy.

## Demo and sandbox verification

The landing action reaches `/demo` in one click. At 390×844, the first demo
screen already shows the persistent **“Demo — sample data, nothing is saved to
your inventory”** banner, Reset demo, Start for real, the inventory toolbar,
five items shown, seven places, and realistic household entries beginning with
Car boot.

In a fresh live context:

- AA batteries began at 8 in Hall cupboard and 4 in Red tool bin.
- Moving two produced 6 and 6; Reset demo restored 8 and 4.
- A pre-existing real place named “Real linen shelf” survived a separate demo
  edit; the demo-only place did not appear after Start for real.
- After leaving, IndexedDB listed only `placeboard-real-v1`.
- The complete demo flow requested only the live origin. No analytics, font
  CDN, model API, or other third-party origin was contacted.

This confirms that the demo itself is not a blocking finding.

## Claims and quality gates

A clean clone was created at `/tmp/placeboard-review3-DhsC0U/repo`. After
`npm ci`, every exact command listed in `.factory/claims.json` ran separately.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `offline-reload` | Pass | Controlled `/demo` reloaded offline with sample data and offline status. |
| `demo-sandbox` | Pass | Demo edits did not appear in a clean real inventory. |
| `sample-data` | Pass | Export contained 7 places, 5 items, and 3 moves. |
| `local-data` | Pass | The complete demo flow emitted no cross-origin request. |
| `free-core` | Pass | Core creation, print, import, and export actions remained available without a license. |
| `multi-location-move` | Pass | Counts, inbound/outbound moves, and dated history updated. |
| `record-correction` | Pass | Edit, archive, destination, history preservation, and undo completed. |
| `place-tree` | Pass | Home → Garage → Red tool bin rendered as a nested path. |
| `quick-search` | Pass | Name, note, and place-path searches returned the sample records. |
| `csv-export` | Pass | CSV had the expected header and sample quantity/path rows. |
| `json-export` | Pass | JSON contained places, items, quantities, and moves. |
| `file-import` | Pass | Both CSV and Placeboard JSON imports produced records. |
| `print-labels` | Pass | All seven and one selected place label rendered. |

The aggregate `npm test` then passed 21/21, `npm run test:unit` passed 6/6,
and `npm run build` produced `dist/`. JavaScript is 39.78 kB (11.52 kB gzip)
and CSS is 13.72 kB (3.96 kB gzip). The live verifier reported HTTP 200,
`lang=en`, one h1, one main, no missing alt text, no unnamed button, and zero
console errors. Live Axe checks found zero serious or critical violations on
`/`, `/demo`, `/inventory`, `/privacy`, `/terms`, `/print?demo=1`, and
`/404.html`.

F-2-3 remains an untested public claim outside this otherwise passing registry.

## Earlier finding verification

Every earlier review, polish report, and handoff was read. Each finding was
checked on the current live site and in current source or tests.

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 | Fixed: no checkout, supporter purchase, or billing link remains. |
| F-1-2 | Fixed: arbitrary live paths return HTTP 404 with the branded skeleton and legal links. |
| F-1-3 | Fixed: all required mobile and desktop first-screen content ends above the fold. |
| F-1-4 | Fixed: merchant-of-record copy is absent. |
| F-1-5 | Fixed: billing-routing README copy is absent. |
| F-1-6 | Fixed: ambiguous product-ID/payment-provider wording is absent. |
| F-1-7 | Fixed: no license flow remains; live demo requests stayed same-origin. |
| F-1-8 | Fixed: the bounded sentence is “Nest bins and shelves inside rooms.” |
| F-1-9 | Fixed: the full local touch-target regression test passes. |
| F-1-10 | Fixed: item/place edit, archive, required destination, history, and undo work. |
| F-1-11 | Fixed: the headline accurately limits the job to household items. |
| F-1-12 | Fixed: the eyebrow uses plain “organized by place” wording. |
| F-1-13 | Fixed: the fact says all inventory tools are free. |
| F-1-14 | Fixed: “How to track an item” identifies the process. |
| F-1-15 | Fixed as a copy issue: “private placeboard” jargon is absent. Claim coverage is separately reopened under F-2-3. |
| F-1-16 | Fixed: “Keep and export your inventory” is self-contained. |
| F-1-17 | Fixed as a heading: “What Placeboard does not do” is self-contained. Claim coverage is separately reopened under F-2-3. |
| F-1-18 | Fixed: README invites sample data without verifier jargon. |
| F-1-19 | Fixed: browser-storage language is public; database names are technical detail. |
| F-1-20 | Fixed: README names Placeboard Inventory in the heading. |
| F-1-21 | Fixed: README consistently says item quantities, not stock. |
| F-1-22 | Fixed: paid label-style copy is absent. |
| F-2-1 | Fixed: live desktop CTA, result, and facts end at y=840 in 1440×900. |
| F-2-2 | Fixed: clean-clone `npm test` passed 21/21 with no separately held server. |
| F-2-3 | **Half-fixed and blocking again:** cloud-sync/database/upload wording is gone, but unlisted valuation/warehouse claims remain. |
| F-2-4 | Fixed: `sample-data` is listed and its exact tagged export test passes. |
| F-2-5 | Fixed: the heading is “Add items to places.” |

## Structure, routing, links, and visual identity

- Root and application routes use the required title pattern, route-specific
  descriptions and canonicals, complete OG/Twitter metadata, favicon, one h1,
  one main, and consistent header/footer. F-3-1 records the two static-route
  metadata exceptions.
- Privacy navigation focused its h1. Browser Back focused the landing h1 and
  restored its title; Forward focused Privacy again.
- All 23 unique links crawled across the product routes returned HTTP 200;
  the two `mailto:` links were explicitly exempt. Unknown routes returned 404.
- The site is visually distinct: night-market storage art, clipped sign
  controls, cyan/amber/pink path signals, and condensed sign typography match
  `.factory/design.md`; it is not a centered generic SaaS hero or feature-card
  template.
- The product follows the required landing order: header, first-screen job and
  demo action, live inventory preview, three-step process, limits/privacy, and
  footer. There is no paid tier to describe.

## Missed leverage

No missing AI feature is indicated. The brief is a local household inventory;
model inference would add privacy, network, and key-management cost without
improving the core lookup job. The obvious non-AI leverage is already present:
JSON/CSV import and export, printable place labels, offline use, multi-place
quantities, correction, search, and move history. Sync is not required by the
local-first brief.

## What would make this perfect

Remove or test the remaining valuation/warehouse scope claims. Complete the
social metadata and indexing intent for the offline and 404 documents. Then
align all version sources to one release value and add a mismatch test. After
those three fixes, repeat the full cold, demo, claims, history, route, link, and
accessibility checks; there is no other observed work left.
