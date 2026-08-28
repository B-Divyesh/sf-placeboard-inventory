# Independent verification 1 — FAIL

**Candidate:** `d5f577931e2a4ea9a7292e177335d02932f53b36` (`chore: complete verification and product handoff`)<br>
**Live URL:** https://placeboard-inventory.sociobot.in<br>
**Verified:** 2026-08-28 UTC, from a clean checkout

## Release decision

**FAIL.** The deployed app is serving this candidate, and the core household-inventory flow works, but the repository's advertised `npm run test:unit` quality gate fails. This alone violates the factory definition of done. The live response cache policy also does not meet the PWA/static-asset caching requirement.

## First-read result — pass

Cold-loading the live landing page answered the required questions in plain words:

- What: “Find anything by where you left it” — household items are found by physical place.
- For whom: households sharing cupboards, bins, sheds, or homes.
- First action: the visible one-click **Try it with sample data** link; its adjacent copy says it opens a stocked home without touching the real inventory.

At 390×844 the action remains visible on the first view. The live `/demo` route loads the populated workbench with the persistent “Demo — sample data, nothing is saved to your inventory” banner, Reset demo, and Start for real.

## Required claim tests — all pass

`.factory/claims.json` exists and declares 12 claims. Each exact command was run independently after `npm ci`; every command built the app and passed its single tagged Chromium demo test.

| Claim ID | Result |
| --- | --- |
| `offline-reload` | PASS |
| `demo-sandbox` | PASS |
| `local-data` | PASS |
| `multi-location-move` | PASS |
| `place-tree` | PASS |
| `quick-search` | PASS |
| `csv-export` | PASS |
| `json-export` | PASS |
| `file-import` | PASS |
| `print-labels` | PASS |
| `supporter-price` | PASS |
| `supporter-features` | PASS |

The exact form used for each row was `npm test -- --grep @claim:<id>`. Observable checks covered offline controlled reload, isolated IndexedDB demo state, only same-origin demo requests, stock moves in/out, nested places, search names/notes/paths, downloads, import, labels, the `$14` checkout URL, and cached-license supporter features.

## Local quality gates

- `npm ci`: PASS. `npm audit --omit=dev --json`: 0 production vulnerabilities.
- `npm run build`: PASS; TypeScript check and Vite build complete. Output: JS 35.53 kB / **11.27 kB gzip**, CSS 13.08 kB / **3.86 kB gzip**. The mobile hero is 28 kB WebP. These are within the stated budgets.
- Playwright suite: the command began successfully and observed the first 17 of 21 tests pass before this execution environment's 30-second command limit ended it. The remaining four named tests were then run separately and all passed: keyboard real-inventory persistence, insufficient-stock recovery, SPA focus/404 recovery, and license return handling. Thus all 21 tests were observed passing, but a single uninterrupted `npm test` completion could not be captured under that harness limit.
- `npm run test:unit`: **FAIL (release blocker)**. Vitest collects `tests/claims.spec.ts` and `tests/data.spec.ts`, which use Playwright `test()`, then fails with `Playwright Test did not expect test() to be called here.` It reports 2 failed suites and no tests.
- No lint script is present.

## Product and live-deployment evidence

- **Deployment identity:** local `dist/assets/index-A27aVISK.js` SHA-256 is `23a2d28d517496018604f94bc429991dc3990db763929a0dbd3f63b7caa8e7ec`; the live asset with that exact filename has the same SHA-256. The live HTML also references the candidate's JS and CSS hashes.
- **End to end:** sample AA batteries started at Hall cupboard 8 / Red tool bin 4; a move updated both quantities and dated history. Search, print all/one place, CSV/JSON export-import, real-inventory persistence, demo reset/exit, and supporters' label styles were covered by the passing tests. Live invalid JSON gives “This JSON file could not be read. Choose an unedited Placeboard JSON export.”; a same-source/destination move gives “Choose two different places.”; reset restores sample data. No page or console errors occurred.
- **Privacy/network:** a live demo session made requests only to the live origin (HTML, hashed JS/CSS, and image). The checked source stores real and demo inventory in separate IndexedDB databases (`placeboard-real-v1` and `placeboard-demo-v1`); no analytics or third-party font/script is present. License verification is the only configured external destination, `https://api.sociobot.in`.
- **PWA:** fresh live `/demo` waited for its service worker, reloaded under controller `https://placeboard-inventory.sociobot.in/sw.js`, then reloaded offline with sample data and the visible “Offline · changes still save here” status. The service worker has versioned cache cleanup, `skipWaiting`, `clientsClaim`, and app-side update-available UI. A genuine future-version update could not be induced without changing deployment assets.
- **Server endpoint limit:** the external product license-verify endpoint was exercised with an invalid QA token. After a fresh successful request, the first 429 in an immediate sequential burst occurred on request **3**, with `Retry-After: 2`; a preceding 40-way concurrent burst returned 429 with `Retry-After: 0`. No sign-in is used, so Entra tenant verification is not applicable.
- **Routes and policies:** live `/`, `/inventory`, `/demo`, `/print?demo=1`, `/privacy`, `/terms`, `/offline.html`, `/404.html`, manifest, robots, and sitemap returned 200. HTTPS responses include HSTS, CSP (`default-src 'self'`; `connect-src 'self' https://api.sociobot.in`), `nosniff`, Referrer-Policy, and Permissions-Policy. `verify-url.sh` against live `/demo` passed: 200, title, `lang=en`, one h1, main, no missing image alt/unlabelled button, no console errors (report: `/tmp/placeboard-verify/verify.json`).
- **Accessibility/mobile:** live axe via Playwright found **zero serious/critical findings** on `/`, `/demo`, `/privacy`, `/terms`, and `/print?demo=1`. 390 px width had no horizontal overflow; focus is an amber 3 px outline; reduced motion makes transitions 0.01 ms. Keyboard create/persist, route-heading focus, and dialog recovery passed through Playwright.

## Defects

### P0 — release blocker: advertised unit-test command fails

`npm run test:unit` fails on this clean checkout. The script is present in `package.json`, so it is an available quality gate that must pass. Vitest discovers Playwright suites instead of isolated Vitest tests and aborts before executing product unit tests. Configure separate test include patterns or remove/replace the invalid script, then prove the intended unit suite passes.

### P1 — static response caching violates the PWA performance contract

The candidate uses hashed asset names but live `index-A27aVISK.js` and `sw.js` return `Cache-Control: public, must-revalidate, max-age=30`, not a long-lived immutable policy. The factory PWA/performance contract requires immutable caching for hashed assets. Configure deployment headers so versioned assets receive a long-lived `immutable` policy, while HTML and `sw.js` remain short-lived/revalidated as appropriate.

### P2 — 390 px touch targets below 44 px

At 390 px, the interactive wordmark measures 34×34 px and the `Demo` navigation link measures 42×44 px. The supplied mobile/accessibility baseline requires 44×44 px targets. Increase the wordmark link's hit area and horizontal nav padding.

### P2 — unlisted public availability claim

The landing page says “The complete inventory stays free” and “Free core,” but `.factory/claims.json` has no claim/test specifically proving that core functionality remains available without a supporter verdict. Existing feature tests exercise the free flow, but the claim contract requires a listed, tagged observable test for each visitor-facing promise. Add a `free-core` claim test or remove/rephrase the promise.

## Verification limitations

The standalone `@axe-core/cli` could not launch because this container has no system Chrome; Playwright's preinstalled Chromium was used instead and returned zero serious/critical axe violations. Lighthouse likewise could not attach to the preinstalled Chromium in this environment. This is not a product runtime failure; bundle measurements, live responsive checks, and the app's existing Lighthouse evidence were inspected separately.

## Retest checklist

1. Make `npm run test:unit` execute only valid unit tests and pass.
2. Set correct immutable caching for hashed assets; retest live headers.
3. Bring all mobile hit targets to 44×44 px.
4. Add the missing free-core claim mapping/test (or remove the claim).
5. Re-run all 12 exact claim commands, `npm test`, `npm run test:unit`, `npm run build`, live offline reload, axe, and live-header checks.
