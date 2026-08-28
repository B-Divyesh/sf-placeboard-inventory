# Placeboard Inventory — polish round 2 handoff

## Outcome

All cumulative findings from `.factory/review-1.md` and `.factory/review-2.md` are closed. The product remains a local-first offline PWA with its night-market signage identity. Product repairs are `bdd8810b3a0e5b96b1f901e3912834efaafe09bf` and `e967138`; detailed closure evidence is in `999cea3` and `.factory/polish-2.md`.

Azure Static Web Apps deployment `65ed4721-5b2d-458c-8f07-fef09c475459` succeeded for <https://placeboard-inventory.sociobot.in>. The cold live bundle is `index-BeN_pUFp.js`.

## Delivered

- Desktop hero now keeps the demo action, its result, and all three facts above 1440×900; mobile remains covered.
- `?demo=1` and `/demo` provide a separate, resettable sample database with a persistent banner and real exit to an empty real inventory.
- Added the `sample-data` claim and export assertion for the seven places, five items, and three moves described in README.
- Removed the untestable negative-capability list and rewrote the context-dependent step heading as “Add items to places.”
- `npm test` owns its preview server, closing the aggregate lifecycle failure.
- Updated footer/offline/404 build labels to `v1.1.1 · polish-2` and the verb-first catalog sentence.

## Exact verification

From clean clone `/tmp/placeboard-clean-6YP8tP` after `npm ci`:

- `npm test`: 21/21 Playwright claim, offline, privacy, routing, keyboard, mobile, and accessibility checks passed with no server held.
- `npm run test:unit`: 6/6 Vitest checks passed.
- `npm run build`: passed and produced `dist/index.html`.
- All 13 exact commands declared in `.factory/claims.json` passed separately.

Build output: JavaScript 39.78 kB (11.52 kB gzip); CSS 13.72 kB (3.96 kB gzip).

Local `verify-url.sh` passed title, `lang=en`, one h1, main, image alt, button labels, and zero console errors. Playwright Axe found zero serious/critical issues on `/`, `/demo`, `/inventory`, `/privacy`, `/terms`, `/print?demo=1`, and `/404.html`. The standalone Axe CLI could not locate a Selenium Chrome binary in this worker; the integrated Playwright Chrome Axe audit is the recorded passing accessibility test.

Cold live checks passed `verify-url.sh` on `/` and `/demo`; all five desktop first-screen requirements ended at y=840 or above in a 1440×900 browser; the seven-route live Axe audit had zero serious/critical findings; `?demo=1` banner/reset/exit reached `/inventory`; and `/definitely-missing-review-route` returned HTTP 404 with one h1, home action, Privacy, and Terms.

Evidence paths: `.factory/evidence-polish-2/local/`, `.factory/evidence-polish-2/live-root/`, and `.factory/evidence-polish-2/live-demo/`.

## Run and deploy

```sh
npm ci
npm test
npm run test:unit
npm run build
```

Deploy `dist/` with the static work-order deployment runner.

## Known gaps

None.
