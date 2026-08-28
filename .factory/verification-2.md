# Independent verification 2 — PASS

**Candidate:** `04630d7a6e6edb830f2111ad208a85d278cb41da`  
**Live URL:** https://placeboard-inventory.sociobot.in  
**Verified:** 2026-08-28 UTC, from a clean checkout

## Release decision

**PASS.** This fresh verification found the deployment serving the candidate build. The required demo, local-first inventory workflow, PWA offline reload, quality gates, accessibility checks, production response policies, and billing API rate limiting all passed. There is no deployment-only failure.

## First-read test — pass

A cold, cacheless desktop visit to `/` returned HTTP 200 with no console or page errors. The first screen says **“Find anything by where you left it”**, then says it is for households sharing cupboards, bins, sheds, or homes. The visible first action is **“Try it with sample data”** and its adjacent text explains that it opens a stocked home without changing real inventory. This answers what it does, who it is for, and what to click in plain words. The same action remains visible at 390 px.

## Required claim tests — all pass

`.factory/claims.json` is present and declares 13 claims. After `npm ci`, I ran every exact command `npm test -- --grep @claim:<id>` separately against the shipped Chromium demo entry point. Every command built the production app and passed its tagged test.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS |
| `demo-sandbox` | PASS |
| `local-data` | PASS |
| `free-core` | PASS |
| `multi-location-move` | PASS |
| `place-tree` | PASS |
| `quick-search` | PASS |
| `csv-export` | PASS |
| `json-export` | PASS |
| `file-import` | PASS |
| `print-labels` | PASS |
| `supporter-price` | PASS |
| `supporter-features` | PASS |

The observable claim coverage includes controlled offline reload, the separate demo IndexedDB namespace, same-origin normal inventory traffic, free core creation/export, multi-place moves and history, nested paths, name/note/path search, JSON/CSV import-export, labels, and the one-time supporter offer.

## Local quality gates

- `npm ci`: PASS.
- `npm run test:unit`: PASS — 4 tests in 2 files.
- `npm test`: PASS — 20 Chromium tests in 24.0 seconds.
- `npm run build`: PASS — TypeScript check and Vite production build completed; `dist/index.html` exists.
- No lint script is configured. The TypeScript no-emit check is part of the build.
- Production dependency audit (`npm audit --omit=dev --json`): 0 vulnerabilities.
- Output is within static-PWA budgets: JS 35.53 kB / 11.27 kB gzip, CSS 13.15 kB / 3.87 kB gzip, and mobile hero WebP 25.4 kB (all below their respective 200 kB, 50 kB, and 300 kB limits).

## Live product, PWA, and deployment evidence

- **Candidate identity:** live HTML references `assets/index-DU6DI1jj.js` and `assets/index-BVdqI1D0.css`. The live JS SHA-256 is `95dd60b061935f0d478ad200520d95065e6b9c0d5e4de467ac7d30b28aa455e8`, exactly matching local `dist`; the CSS SHA-256 also matches local `dist` (`313ecf40ab00e7c93911bc75eddaa07c071d205df971a7dfdb3c95b97840dfa3`).
- **Live routes:** `/`, `/inventory`, `/demo`, `/privacy`, `/terms`, `/print?demo=1`, `/manifest.webmanifest`, `/sw.js`, `/offline.html`, `/404.html`, `/robots.txt`, and `/sitemap.xml` all returned HTTP 200.
- **End to end:** in a new live demo context, AA batteries initially showed 8 at Hall cupboard and 4 at Red tool bin. Moving 2 to Red tool bin produced 6/6 and a dated move. The invalid same-place move displayed “Choose two different places.”; changing the destination in the still-open dialog then completed the valid move. Invalid JSON displayed the actionable error “This JSON file could not be read. Choose an unedited Placeboard JSON export.” A live fresh real-inventory context also created a place and item using Enter to activate Save controls.
- **PWA:** after service-worker control, live `/demo` had controller `https://placeboard-inventory.sociobot.in/sw.js`, active cache `placeboard-v1.0.1`, and no waiting worker. `registration.update()` completed with no newer deployment available. With networking disabled, a reload retained sample data and showed “Offline · changes still save here.” The deployed worker uses versioned cache cleanup, `skipWaiting`, and `clientsClaim`; the app exposes its update-ready reload notice when a future worker installs.
- **Privacy/network:** an entire normal live-session route sweep and demo journey made requests only to the product origin (HTML, JS, CSS, imagery, and worker). Inventory storage is separate IndexedDB databases `placeboard-real-v1` and `placeboard-demo-v1`. No analytics, CDN fonts, or third-party scripts are loaded. The only configured external destination is the explicit Sociobot billing verification API, which receives a license token only when the user verifies one.
- **Policies/caching:** HTML is revalidated with `no-cache, max-age=0, must-revalidate`; hashed JS/CSS use `public, max-age=31536000, immutable`; `sw.js` uses `no-cache, no-store, must-revalidate`. Live HTTPS responses include CSP limited to self plus the billing API, HSTS, `nosniff`, strict origin referrer policy, and camera/microphone/geolocation permissions disabled.
- **Rate limit:** the real product license-verify endpoint was called with synthetic invalid tokens. Fifteen rapid sequential reads returned 200. A 40-request burst with concurrency 20 returned 16 × 200 and 24 × 429; the first observed 429 (request identifier 13; concurrent ordering is not a strict sequence) included `Retry-After: 1`. This meets the server-endpoint rate-limit requirement. The product has no sign-in, so Entra tenant checking is not applicable.

## Accessibility, keyboard, and responsive evidence

- `/opt/fleet/lib/verify-url.sh` against live `/demo` passed: HTTP 200, title, `lang=en`, one h1, main landmark, zero images without alt text, zero unlabeled buttons, and zero console errors. Artifacts are in `.factory/evidence-verification-2/`.
- Fresh Playwright Axe scans found zero serious or critical violations on `/`, `/demo`, `/inventory`, `/privacy`, `/terms`, and `/print?demo=1`.
- At 390×844, `body.scrollWidth` equalled 390. The wordmark was 44×44 px and Demo link 58.1×44 px. The demo workbench stacks intentionally and has no horizontal overflow; screenshots were visually inspected at desktop and mobile widths.
- Keyboard Tab reaches the skip link first, then wordmark and navigation. The focused primary control has a visible 3 px amber solid outline with a 3 px offset. Enter-driven place/item creation succeeded. Reduced motion resolves transition duration to `0.00001s`.

## Defects by severity

- **P0:** none.
- **P1:** none.
- **P2:** none.
- **P3:** none in the shipped product.

### Non-blocking development maintenance note

Full `npm audit` reports advisories in development-only `vite@7.1.3` and `vitest@3.2.4`; the production-only audit is clean and the static deployment ships no Node/Vite/Vitest runtime. Upgrade these dev tools in routine maintenance, but this is not a deployed-product release blocker.
