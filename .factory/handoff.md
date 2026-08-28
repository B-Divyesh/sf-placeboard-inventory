# Placeboard Inventory polish round 1 handoff

## Outcome

All 22 findings in `.factory/review-1.md` are fixed and verified on the deployed site. The unavailable paid flow was removed rather than mocked. Unknown routes return a real HTTP 404. The first screen, copy, mobile targets, metadata, legal pages, demo entry, record correction, claims, and tests now meet the supplied contracts while retaining the night-market visual system.

Production: <https://placeboard-inventory.sociobot.in>

Demo: <https://placeboard-inventory.sociobot.in/?demo=1>

Repair commit: `8263e5cf90dc5834e23f83ff5ec11608e68fabd0`

## What changed

- Added edit and archive actions for items and places, destination handling for occupied places, retained move history, exact confirmations, and undo.
- Made `/?demo=1` a direct, separate-database sample entry with the persistent banner, reset, and clean exit.
- Rewrote the first screen and all cited plain-language copy; all required facts fit at 390×844 and 1440×900.
- Removed all disabled payment, license, price, and supporter-feature surfaces and claims.
- Enumerated valid Static Web App routes and rebuilt the 404 and offline documents with the standard branded skeleton.
- Added route-specific titles, descriptions, canonicals, history focus behavior, legal links, and 44×44 mobile targets.
- Rebuilt `.factory/claims.json` with 12 observable claims, including record correction, and one tagged test per claim.
- Updated the catalog description, README, demo notes, design terminology, copy audit, PWA cache version, and dependency versions. Full `npm audit` is clean.

## Verification

- Fresh clone: `npm ci`, followed by every `.factory/claims.json` command separately — 12/12 passed.
- `npm run test:unit` — 6/6 passed.
- `npm test` — 19/19 Playwright tests passed.
- `npm run build` — passed; `dist/index.html` present. JS 39.82 kB (11.56 kB gzip); CSS 13.67 kB (3.95 kB gzip).
- `npm audit` — 0 vulnerabilities.
- Local Lighthouse — performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.5 s, CLS 0.
- Live Lighthouse — performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.4 s, CLS 0, total transfer 98 KiB.
- Live `/demo` `verify-url.sh` — passed with no console errors; report at `.factory/evidence-polish-1/live-verify/verify.json`.
- Live Axe — zero serious/critical findings on all six application routes tested.
- Live unknown routes — `/definitely-missing-review-route` and `/missing-route/deeper` return HTTP 404 and the complete branded skeleton.
- Live cold browser — required first-screen copy above the fold, route title/canonical/focus/back-forward, demo reset/isolation, edit/archive/history/undo, same-origin-only inventory requests, and offline reload all passed.
- Production JS/CSS hashes match the local `dist` files exactly.

Run locally with `npm ci && npm run test:unit && npm test && npm run build`.

## Known gaps and next steps

None. No review finding or test failure remains.
