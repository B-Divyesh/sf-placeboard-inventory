# Placeboard Inventory — polish round 3 handoff

## Outcome

Round 3 is complete and deployed at <https://placeboard-inventory.sociobot.in>. Every finding from reviews 1–3 is closed; the cumulative mapping and evidence are in `.factory/polish-3.md`.

The released product remains a static, offline PWA with its night-market visual identity. There is no runtime AI or paid checkout because neither serves the researched job, and the reviewed billing endpoint was unavailable.

## What changed

- Removed all remaining unlisted insurance, valuation, barcode, and warehouse boundaries from landing, README, and Terms copy. The section now describes tested browser storage, export, and import behavior.
- Added complete Open Graph and Twitter metadata to `/offline.html` and `/404.html`. Both operational documents are explicitly `noindex`; offline remains outside the sitemap.
- Made `package.json` version `1.1.1` the build source for app footers, static footers, manifest cache-buster, and service-worker cache. The build rejects package/lock mismatches or missing release placeholders.
- Strengthened `@claim:demo-sandbox`: it seeds real data, enters through `/?demo=1`, edits and resets the demo, leaves, and proves real data remains while demo data does not.
- Added claim-registry, release-alignment, static-metadata, and prohibited-boundary regression tests.
- Added `npm run test:live`, which checks cold first screens, demo isolation/reset, history focus, all route metadata, legal links, mobile targets, Axe, real 404 status, dead links, console errors, and release markers.
- Updated the catalog line to “Find shared household items by room, shelf, or bin and record every move.” (73 characters, verb first).

## Exact verification evidence

Repair/verification commit: `d4e5aeb0d32ae3fa58589cab9859d493872c65c3`.

Final clean clone: `/tmp/placeboard-polish3-final-TQupbR/repo`.

- `npm ci`: passed; 0 vulnerabilities.
- Every one of the 13 commands declared in `.factory/claims.json`: passed separately, one tagged test per claim.
- `npm test`: 21/21 Playwright tests passed with its own preview server.
- `npm run test:unit`: 10/10 Vitest data/deployment tests passed.
- `npm run build`: passed; `dist/index.html` exists at the required root.
- Bundle: JS 39.68kB (11.49kB gzip); CSS 13.72kB (3.96kB gzip).
- `npm audit --audit-level=high`: 0 vulnerabilities.

Accessibility, privacy, offline, and routing:

- Integrated Axe: zero serious/critical findings on `/`, `/demo`, `/inventory`, `/privacy`, `/terms`, `/print?demo=1`, `/offline.html`, and `/404.html`.
- All visible controls on those mobile routes meet 44×44 CSS pixels.
- Offline claim reloads the controlled live `/demo` while the browser context is offline.
- Demo audit preserved pre-existing real data, reset sample edits, removed the demo database on exit, and observed no cross-origin request.
- Route navigation moves focus to the new h1; Back restores landing focus and title.
- Arbitrary live `/definitely-missing-polish-3` returns HTTP 404 with one h1, Return home, Privacy, and Terms.
- All 26 discovered live links returned HTTP below 400; `mailto:` links were explicitly exempt.
- Factory `verify-url.sh` passed live root, direct `/?demo=1`, offline, and 404 pages with zero console errors.

Performance:

- Local Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.21s, CLS 0, TBT 12ms.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.05s, CLS 0, TBT 11.5ms.
- Live/local asset hashes match: JS `38b51783…97d94a`; CSS `615081bd…a74cb`.

Evidence files:

- `.factory/evidence-polish-3/live-audit.json`
- `.factory/evidence-polish-3/lighthouse-local.json`
- `.factory/evidence-polish-3/lighthouse-live.json`
- `.factory/evidence-polish-3/live-root/`
- `.factory/evidence-polish-3/live-demo/`
- `.factory/evidence-polish-3/live-offline/`
- `.factory/evidence-polish-3/live-404/`

Deployment: Azure Static Web Apps production deployment `ac8be14a-5927-4dd1-b386-4646d4e897d0` succeeded. The custom domain returned HTTPS 200. A cold post-deploy full browser run passed 21/21 against the live origin.

## Run and verify

```sh
npm ci
npm run test:unit
npm test
npm run build
```

To repeat production checks:

```sh
npm run test:live
PLAYWRIGHT_BASE_URL=https://placeboard-inventory.sociobot.in npx playwright test
```

## Known gaps

None observed. No review finding, claim, or required quality gate remains open.
