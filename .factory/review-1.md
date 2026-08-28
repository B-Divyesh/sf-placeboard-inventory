# Adversarial first-read review 1 — FAIL

Reviewed 2026-08-28 against commit `00d69e91340c800f3af84f444904ccbff322eb06`
and the live site at <https://placeboard-inventory.sociobot.in>. The local tree
was clean before review. No product code was changed.

## Verdict

**FAIL.** There are 22 findings: two blocking, eight major, and twelve minor.
The one-click demo and core inventory flows work, but the paid call to action
ends at HTTP 404 and unknown application routes return HTTP 200. A passing test
currently masks the broken checkout. There are also unlisted public claims, a
mobile first-screen layout miss, undersized touch targets, and copy that does
not meet the supplied plain-words contract.

## Findings

### Blocking

#### F-1-1 — The paid call to action is a dead link, and its claim test is a false positive

- **Quote/location:** landing page, **“Buy supporter pack (external checkout)”**;
  `.factory/claims.json` claim `supporter-price`: **“The supporter pack costs
  $14 once and links to Sociobot checkout.”**
- **Evidence:** a live GET of
  `https://api.sociobot.in/api/v1/products/placeboard-inventory/checkout`
  returned HTTP 404 with `{"error":"enabled factory product","status":404}`.
  The handoff already says the product must be registered before checkout can
  sell licenses. The tagged test nevertheless passes because it asserts only
  the literal `href`; it explicitly says “without opening checkout.”
- **Why this fails:** a visitor can attempt to buy a marketed upgrade, but the
  only purchase action leads to an API error. The listed claim test does
  not assert the result promised to the visitor.
- **Concrete fix:** register and enable the product in Sociobot billing before
  displaying the offer, or remove the price, license form, and purchase CTA
  until it is enabled. Change `@claim:supporter-price` to open the endpoint in
  a safe test mode and assert a successful checkout response or redirect, not
  just the URL string.

#### F-1-2 — Unknown application routes are soft 404s

- **Quote/location:** live
  `/definitely-missing-review-route` and `/missing-route/deeper`.
- **Evidence:** both return HTTP 200, set a canonical URL to the nonexistent
  path, and then render the in-app “This shelf does not exist” screen. Missing
  asset paths such as `/missing.css` correctly return HTTP 404. The separate
  `/404.html` page has no standard header, footer, Privacy link, Terms link, or
  build identifier.
- **Why this fails:** crawlers, monitors, and link checkers see nonexistent
  routes as successful pages. This is broken routing under the supplied
  site-structure contract, and the actual 404 response does not use the
  standard site skeleton.
- **Concrete fix:** enumerate valid SPA routes in the Static Web Apps config,
  let unmatched routes return the styled 404 document with status 404, and
  give that document the standard header/footer. Add a deployment test that
  requests an arbitrary route and asserts status 404, one `h1`, a return link,
  Privacy, and Terms.

### Major

#### F-1-3 — The required first-screen explanation and facts are below the fold

- **Quote/location:** landing hero at 390×844 and 1440×900. The relevant copy
  is **“The demo opens a stocked home. Your real inventory stays untouched.”**
  followed by the offline, local-data, and price facts.
- **Evidence:** at 390 px, the primary CTA occupies y=740–789, the secondary
  CTA is clipped at y=801–850, the explanation starts below y=844, and none of
  the three facts is visible. At 1440×900 the explanation only begins at y=853
  and the facts remain below the viewport.
- **Why this fails:** what the demo does after the click and the three required
  privacy/offline/price facts are not on the first screen, contrary to the
  mandatory plain-words shape. The first action itself is visible, so this is
  not the separate three-question clarity blocker.
- **Concrete fix:** put **“Opens a stocked sample. Your inventory is unchanged.”**
  directly beside or beneath the primary CTA, before the secondary CTA. Reduce
  or move the hero art and headline so all three short facts fit without a
  scroll at both tested sizes.

#### F-1-4 — “Sociobot is the merchant of record” is an unlisted claim

- **Quote/location:** landing supporter section: **“Sociobot is the merchant
  of record.”**
- **Why this fails:** this is a legal/payment claim a buyer may rely on. No
  `.factory/claims.json` entry or tagged test establishes it, and the purchase
  endpoint is currently unavailable.
- **Concrete fix:** remove the sentence until checkout is enabled, or add a
  claim whose integration test verifies the live checkout identifies Sociobot
  as merchant of record.

#### F-1-5 — The README’s billing-routing claim is not listed or tested

- **Quote/location:** README supporter section: **“Checkout and license
  verification use the Sociobot billing API.”**
- **Why this fails:** `supporter-price` checks only an `href`, and the returned
  license test mocks every Sociobot request. Neither test proves both stated
  live paths use the API successfully.
- **Concrete fix:** split this into checkout and verification claims with
  observable tests, including the checkout success check required by F-1-1;
  otherwise remove the sentence.

#### F-1-6 — The README makes an ambiguous, unlisted implementation claim

- **Quote/location:** README supporter section: **“No product ID or
  payment-provider code is embedded here.”**
- **Why this fails:** there is no claims entry or repository policy test for
  this sentence. In plain reading, the source does embed the product slug in
  the checkout and verification URLs, so “product ID” is also ambiguous.
- **Concrete fix:** remove the sentence. If the intended claim is “No payment
  provider secret is stored in this app,” use that wording and add a source/
  built-artifact scan as its tagged test.

#### F-1-7 — The license-request privacy claim is not exercised

- **Quote/location:** README privacy section: **“License verification sends
  only the entered license token to api.sociobot.in.”**
- **Why this fails:** `@claim:local-data` never performs license verification,
  while the separate license test intercepts all requests and returns a canned
  response without asserting method, query/body fields, or absence of
  inventory data.
- **Concrete fix:** add a dedicated claim test that creates identifiable
  inventory data, verifies a license, captures the outbound request, and
  asserts that only the license token is sent.

#### F-1-8 — “Nest places as deeply as you need” is unbounded and unlisted

- **Quote/location:** landing “Name your places” step: **“Nest places as deeply
  as you need.”**
- **Why this fails:** `@claim:place-tree` asserts only Home → Garage → Red tool
  bin. It does not test the unbounded capability promised by “as deeply as you
  need,” and no separate claim lists it.
- **Concrete fix:** rewrite as **“Nest bins and shelves inside rooms.”** Or list
  a supported depth and add a test at that depth.

#### F-1-9 — Three mobile links miss the 44 px touch-target requirement

- **Quote/location:** `/privacy` email link, `/terms` email link, and the
  `/print?demo=1` **“Supporter pack adds three more label styles.”** link.
- **Evidence:** at 390 px they measured 161.8×19 px, 164.5×19 px, and
  360.9×19 px respectively. Axe reports no violations, but the supplied
  accessibility baseline requires all touch targets to be at least 44 px.
- **Concrete fix:** give these links a 44 px minimum block/inline-block hit area
  with visible focus styling, and extend the viewport test to all interactive
  controls on every route rather than only the wordmark and Demo link.

#### F-1-10 — A real inventory cannot correct or retire its own records

- **Quote/location:** live `/inventory` and source actions. The app offers Add
  item, Add place, Move or add, import, export, and print, but no rename, edit,
  archive, or delete action for an item or place.
- **Why this fails:** typos, replaced containers, and discarded household items
  are normal inventory events. The only correction path is full export editing
  and destructive re-import, which is not a usable end-to-end workflow.
- **Concrete fix:** add Edit and Archive actions for items and places. Preserve
  move history, prevent deletion of a nonempty place unless the user chooses a
  destination, provide undo, and add keyboard/mobile/claim coverage. An AI
  feature is not indicated here; record correction is the higher-value step.

### Minor copy findings

#### F-1-11 — The headline overstates what can be found

- **Quote/location:** landing `h1`: **“Find anything by where you left it.”**
- **Why this fails:** Placeboard can find only items a person has recorded.
- **Concrete rewrite:** **“Find household items by where you stored them.”**

#### F-1-12 — “Place-first” is product jargon

- **Quote/location:** landing eyebrow: **“A place-first household inventory.”**
- **Why this fails:** a cold visitor must decode a coined adjective.
- **Concrete rewrite:** **“Household inventory organized by place.”**

#### F-1-13 — “Free core” is pricing jargon

- **Quote/location:** landing fact: **“Free core.”**
- **Why this fails:** it does not say which functions are free.
- **Concrete rewrite:** **“All inventory tools are free.”** Keep the supporter
  extras in the next fact and retain the existing free-core claim test.

#### F-1-14 — “How it works” does not identify the subject out of context

- **Quote/location:** landing `h2`: **“How it works.”**
- **Why this fails:** the heading list alone does not say what process follows.
- **Concrete rewrite:** **“How to track an item.”**

#### F-1-15 — “Private placeboard” is unexplained jargon

- **Quote/location:** landing limits section: **“This is a private placeboard,
  not an insurance record or warehouse system.”**
- **Why this fails:** “placeboard” is used as a generic noun without a defined
  meaning, while “private” is a claim rather than an explanation.
- **Concrete rewrite:** **“This household inventory stays in this browser. It
  does not value items or run a warehouse.”** Keep only the privacy sentence if
  it remains mapped to the local-data claim.

#### F-1-16 — “Your data” is not a self-contained heading

- **Quote/location:** landing `h3`: **“Your data.”**
- **Why this fails:** it gives no clue what the section lets a person do.
- **Concrete rewrite:** **“Keep and export your inventory.”**

#### F-1-17 — “Clear limits” is not a self-contained heading

- **Quote/location:** landing `h3`: **“Clear limits.”**
- **Why this fails:** it does not name the limits.
- **Concrete rewrite:** **“What Placeboard does not do.”**

#### F-1-18 — “Isolated demo” uses verifier language in visitor copy

- **Quote/location:** README heading: **“Try the isolated demo.”**
- **Why this fails:** “isolated” describes an implementation property, not the
  visitor’s result.
- **Concrete rewrite:** **“Try sample data without changing your inventory.”**

#### F-1-19 — IndexedDB appears in user-facing setup copy without explanation

- **Quote/location:** README demo and feature copy: **“It uses the separate
  placeboard-demo-v1 IndexedDB database.”** and **“Stores inventory in IndexedDB
  on this device.”**
- **Why this fails:** a first-time user does not need the browser storage API
  name to understand safety. The database name belongs in maintainer details.
- **Concrete rewrite:** **“The demo uses a separate browser database.”** and
  **“Stores inventory in this browser.”** Move the namespace to a technical
  note.

#### F-1-20 — “What v1 does” is a context-dependent heading

- **Quote/location:** README heading: **“What v1 does.”**
- **Why this fails:** “v1” does not identify the product when headings are read
  as a list.
- **Concrete rewrite:** **“What Placeboard Inventory does.”**

#### F-1-21 — “Stock” breaks the item/quantity terminology

- **Quote/location:** README feature: **“Moves stock between places or in and
  out of the inventory.”**
- **Why this fails:** elsewhere the same concept is called an item quantity;
  “stock” also suggests the warehouse system the product disclaims.
- **Concrete rewrite:** **“Records item quantities moving between places or in
  and out of the inventory.”**

#### F-1-22 — The paid style feature has two names

- **Quote/location:** landing: **“three print styles”**; README: **“three label
  styles”**; claim: **“three print styles.”**
- **Why this fails:** the same supporter feature changes name across public
  copy.
- **Concrete fix:** use **“three label styles”** everywhere, including the claim
  and its test name.

## Cold first-screen record

No scrolling was performed before this record.

| Viewport | What it does | For whom | First click | Result |
| --- | --- | --- | --- | --- |
| 390×844 | “Find anything by where you left it” plus “A place-first household inventory” | “For households that share cupboards, bins, sheds, or homes…” | “Try it with sample data” is fully visible | Answers all three required questions; F-1-3 still applies because the post-click explanation and facts are below the fold |
| 1440×900 | Same | Same | “Try it with sample data” | Answers all three required questions; the facts remain below the fold |

The visual identity is distinct: near-black timber, clipped sign shapes, cyan/
amber/pink route lighting, condensed display type, and original storage art do
not resemble a generic gradient SaaS template.

## Copy audit

Counts treat hyphenated terms, commands, and URLs as one word and ignore slash
separators. Code blocks are commands rather than sentences, so their surrounding
README explanations are counted but the command lines are not. No copy unit is
over 22 words and no banned marketing word appears. A finding ID marks every
other flag; repeated occurrences of the same issue share one finding.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Placeboard Inventory | 2 | Pass |
| Inventory | 1 | Pass |
| Demo | 1 | Pass |
| Privacy | 1 | Pass |
| A place-first household inventory | 4 | F-1-12 |
| Find anything by where you left it | 7 | F-1-11 |
| For households that share cupboards, bins, sheds, or homes and need one clear place to look. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| Start my inventory | 3 | Pass |
| The demo opens a stocked home. | 6 | F-1-3 (position) |
| Your real inventory stays untouched. | 5 | F-1-3 (position) |
| Works offline after your first visit. | 6 | F-1-3 (position) |
| Inventory data stays on this device. | 6 | F-1-3 (position) |
| Free core. | 2 | F-1-13 |
| $14 one-time supporter pack. | 4 | F-1-3 (position) |
| See every place | 3 | Pass |
| One item can sit in several places. | 7 | Pass |
| Search shows every quantity and its full path. | 8 | Pass |
| Search: AA batteries | 3 | Pass |
| Home / Hall cupboard | 3 | Pass |
| Home / Garage / Red tool bin | 5 | Pass |
| 8 AA batteries | 3 | Pass |
| 4 AA batteries | 3 | Pass |
| How it works | 3 | F-1-14 |
| Build the same simple map you use when you tell someone where to look. | 14 | Pass |
| Name your places | 3 | Pass |
| Add a home, room, shelf, or bin. | 7 | Pass |
| Nest places as deeply as you need. | 7 | F-1-8 |
| Put items there | 3 | Pass |
| Add a quantity to one place. | 6 | Pass |
| Add the same item to another place later. | 8 | Pass |
| Record each move | 3 | Pass |
| Choose the old place and new place. | 7 | Pass |
| Placeboard updates both counts and keeps the history. | 8 | Pass |
| Made for finding, not valuing | 5 | Pass |
| This is a private placeboard, not an insurance record or warehouse system. | 12 | F-1-15 |
| Your data | 2 | F-1-16 |
| Your inventory uses browser storage. | 5 | Pass |
| Export JSON or CSV whenever you want a backup. | 9 | Pass |
| Clear limits | 2 | F-1-17 |
| There is no cloud sync, product database, insurance valuation, or photo upload. | 12 | Pass |
| Support Placeboard once | 3 | Pass |
| The complete inventory stays free. | 5 | Pass |
| The supporter pack adds three print styles and a move summary. | 11 | F-1-22 |
| $14 once | 2 | Pass |
| Pay once for this browser license. | 6 | Pass |
| Sociobot is the merchant of record. | 6 | F-1-4 |
| Buy supporter pack | 3 | Pass as a result-naming verb; destination fails under F-1-1 |
| Have a license? | 3 | Pass |
| Paste it here | 3 | Pass |
| Verify license | 2 | Pass |
| Find shared household items by place. | 6 | Pass |
| Original generated imagery. | 3 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Placeboard Inventory | 2 | Pass |
| Find shared household items by place and record every move. | 10 | Pass |
| Placeboard is for households that use cupboards, shelves, bins, sheds, cars, or multiple homes. | 14 | Pass |
| One item can have quantities in several places. | 8 | Pass |
| A move updates both place counts and adds a dated history entry. | 12 | Pass |
| Live site: https://placeboard-inventory.sociobot.in | 3 | Pass |
| Try the isolated demo | 4 | F-1-18 |
| Open /demo, or visit https://placeboard-inventory.sociobot.in/demo. | 5 | Pass |
| The demo includes seven places, five items, and three moves. | 10 | Pass |
| It uses the separate placeboard-demo-v1 IndexedDB database. | 7 | F-1-19 |
| Leaving the demo deletes its changes and never changes the real inventory. | 12 | Pass |
| The sample is bundled with the app. | 7 | Pass |
| The demo works offline after the first visit. | 8 | Pass |
| What v1 does | 3 | F-1-20 |
| Builds a nested place tree for homes, rooms, shelves, and bins. | 11 | Pass |
| Keeps one item in several places with a quantity at each place. | 12 | Pass |
| Moves stock between places or in and out of the inventory. | 11 | F-1-21 |
| Searches item names, notes, and full place paths. | 8 | Pass |
| Keeps dated move history. | 4 | Pass |
| Prints all place labels or one chosen label. | 8 | Pass |
| Exports full data and move history as JSON. | 8 | Pass |
| Exports current quantities and place paths as CSV. | 8 | Pass |
| Imports Placeboard JSON and CSV files. | 6 | Pass |
| Stores inventory in IndexedDB on this device. | 7 | F-1-19 |
| This is not an insurance record, valuation tool, barcode catalog, or warehouse system. | 13 | Pass |
| Supporter pack | 2 | Pass |
| The complete inventory remains free. | 5 | Pass |
| A $14 one-time supporter pack adds three label styles and a 30-day move summary. | 14 | F-1-22 |
| Checkout and license verification use the Sociobot billing API. | 9 | F-1-5 |
| No product ID or payment-provider code is embedded here. | 9 | F-1-6 |
| Develop and verify | 3 | Pass |
| Requirements: Node.js 22 and npm. | 5 | Pass |
| npm run test:unit runs the isolated Vitest data and deployment-policy tests. | 11 | Pass in the maintainer section |
| npm test builds the production app and runs the Playwright claim, accessibility, mobile, and keyboard tests. | 16 | Pass in the maintainer section |
| The exact deploy command is npm run build. | 8 | Pass |
| It writes the static site to dist/, with dist/index.html at its root. | 12 | Pass |
| To run only one public claim: | 6 | Pass |
| The Playwright version is pinned to 1.58.2. | 7 | Pass |
| Set PLAYWRIGHT_BROWSERS_PATH to the worker browser cache when needed. | 9 | Pass in the maintainer section |
| Privacy and data ownership | 4 | Pass |
| Normal inventory use makes no third-party request. | 7 | Pass; mapped to `local-data` |
| Data stays in local browser storage unless the user exports it. | 11 | Pass; mapped to `local-data` |
| License verification sends only the entered license token to api.sociobot.in. | 10 | F-1-7 |
| See /privacy and /terms in the app. | 7 | Pass |
| Deployment | 1 | Pass |
| Deploy the contents of dist/ as a static site. | 9 | Pass |
| staticwebapp.config.json provides SPA fallback, security headers, the styled 404 response, immutable caching for versioned /assets/*, and revalidation for HTML and sw.js. | 21 | Pass in the maintainer section; routing result is covered separately by F-1-2 |
| The factory owns DNS, infrastructure, and billing setup. | 8 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

## Demo and sandbox verification

- The landing primary action opens `/demo` in one click.
- The first demo screen already shows seven named places, five realistic items,
  quantities, notes, recent moves, and the search/workbench UI.
- The banner says **“Demo — sample data, nothing is saved to your inventory”**
  and keeps **Reset demo** and **Start for real** visible.
- A live test added `QA demo attic`, reset the demo, and confirmed it vanished.
  It then preserved `QA real shelf` while adding and discarding `QA demo
  cellar`. After **Start for real**, only `placeboard-real-v1` remained and the
  real shelf was still present.
- The controlled live demo reloaded offline with sample AA batteries and the
  status **“Offline · changes still save here.”** The intercepted journey made
  zero cross-origin requests.

## Claim verification

Every exact command in `.factory/claims.json` was run separately after
`npm ci` from the clean base checkout.

| Claim ID | Command result | Observable result |
| --- | --- | --- |
| `offline-reload` | PASS | Controlled demo reloaded offline with sample data |
| `demo-sandbox` | PASS | Demo change absent from clean real inventory |
| `local-data` | PASS | Tested demo journey made no cross-origin request |
| `free-core` | PASS | No-license user created data and exported JSON |
| `multi-location-move` | PASS | Counts and dated history updated |
| `place-tree` | PASS | Three-level sample relationship rendered |
| `quick-search` | PASS | Name, note, and place-path searches matched |
| `csv-export` | PASS | Download contained header and eight sample rows |
| `json-export` | PASS | Download contained places, items, stocks, moves |
| `file-import` | PASS | CSV then JSON imports rendered their records |
| `print-labels` | PASS | All-place and one-place print views rendered |
| `supporter-price` | **TEST PASS / LIVE OUTCOME FAIL** | Test checks only `href`; live target is HTTP 404 (F-1-1) |
| `supporter-features` | PASS | Cached verdict exposed styles and 30-day summary |

Each claim tag occurs exactly once in the test suite. F-1-4 through F-1-8 list
claim-like copy that does not have adequate claim coverage.

## Structure, routes, and accessibility

- Route titles follow the required pattern and are at most 52 characters:
  `/`, `/inventory`, `/demo`, `/privacy`, `/terms`, `/print`, and the in-app
  not-found view each have one `h1`, one `main`, and a route-specific title.
- `lang`, description, canonical, Open Graph/Twitter data, SVG favicon,
  180×180 apple-touch icon, 1200×630 social card, manifest, robots, sitemap,
  theme color, and security headers are present. Canonicals update on SPA
  navigation. F-1-2 covers the invalid canonical on soft-404 routes.
- Back/forward navigation restored a 1400 px landing scroll position and moved
  focus to the restored route heading. Deep links opened the correct views.
- All same-origin links returned 200 except intentionally missing resources;
  mail links are explicit. The only dead public link is the checkout in F-1-1.
- `/opt/fleet/lib/verify-url.sh` on live `/demo` returned 200 with no console
  errors, one `h1`, one `main`, `lang=en`, no missing image alt, and no
  unlabeled buttons.
- Playwright Axe reported zero violations of any severity on `/`, `/inventory`,
  `/demo`, `/privacy`, `/terms`, `/print?demo=1`, and `/missing-route`.
- Keyboard route focus, reduced motion, mobile overflow, and core form flows
  pass the repository suite. F-1-9 is a manual target-size failure outside the
  current narrow viewport test.

## Earlier finding audit

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
Every version of `.factory/handoff.md` in repository history was inspected.
The four findings carried from `.factory/verification-1.md` were rechecked:

| Earlier finding | Live/code result |
| --- | --- |
| Unit gate collected Playwright files | Fixed: `npm run test:unit` passes 4 Vitest tests using the scoped config |
| Hashed assets lacked immutable caching | Fixed: live JS/CSS return `public, max-age=31536000, immutable`; `sw.js` is no-store/revalidate |
| Wordmark and Demo targets below 44 px | Fixed: live 390 px measurements are 44×44 and 58.1×44 px |
| “Complete inventory stays free” was unlisted | Fixed: `free-core` exists once and its command passes |

The historical handoff’s known billing-registration gap is not fixed and is
raised as blocking F-1-1. Its no-cloud-sync limitation remains honestly stated;
it is not treated as a regression. The more basic correction workflow is
raised as missed leverage in F-1-10.

## Other verification evidence

- `npm run test:unit`: 4/4 passed.
- `npm test`: 20/20 passed in one run.
- `npm run build`: passed; `dist/index.html` exists.
- Production JavaScript: 35.53 KB raw, 11.27 KB gzip. CSS: 13.15 KB raw,
  3.88 KB gzip.
- Live and local production JS/CSS SHA-256 hashes match.
- `npm audit --omit=dev --json`: zero production vulnerabilities.

## What would make this perfect

Resolve every finding above: enable or remove the paid path and make its test
exercise the outcome; return a true, fully structured 404; fit the complete
first-screen promise into both viewports; list and test every retained claim;
bring every mobile target to 44 px; add safe edit/archive flows; and apply each
copy rewrite consistently. Then rerun all 13 exact claim commands, the full
quality gates, live link/status crawl, offline/network interception, all-route
Axe scan, 390 px first-read capture, and the complete copy audit. A PASS requires
zero remaining findings and no untested claim.
