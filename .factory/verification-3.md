# Independent verification 3 — PASS

**Candidate:** `4764e1b343921f445b56872c073d80b7c4513cbc`

**Live URL:** <https://placeboard-inventory.sociobot.in>

**Verified:** 2026-08-29 UTC from the supplied clean checkout

## Release decision

**PASS.** The deployed product matches the candidate, the mandatory first-read and one-click demo gates pass, all 13 declared claim tests pass independently, and no release-blocking defect was found. The smallest useful local household inventory works end to end on desktop and 390 px mobile, including offline reload.

## Mandatory gates

### First-read test — pass

A new 1440×900 browser context opened `/` cold. The first viewport says:

- What it does: **“Find household items by where you stored them.”**
- Who it is for: **“For households that share cupboards, bins, sheds, or homes and need one clear place to look.”**
- What to click first: **“Try it with sample data.”**
- What happens next: **“Opens a stocked sample. Your inventory is unchanged.”**

The action and all three facts are also above the fold at 390×844. One click opens `/demo`, immediately shows AA batteries and the other sample records, and displays the persistent **“Demo — sample data, nothing is saved to your inventory”** banner with **Reset demo** and **Start for real**.

### Claims — 13/13 pass

`.factory/claims.json` exists. After the documented `npm ci` bootstrap, every listed `test` command was run separately and exited 0 against its demo entry point.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS |
| `demo-sandbox` | PASS |
| `sample-data` | PASS |
| `local-data` | PASS |
| `free-core` | PASS |
| `multi-location-move` | PASS |
| `record-correction` | PASS |
| `place-tree` | PASS |
| `quick-search` | PASS |
| `csv-export` | PASS |
| `json-export` | PASS |
| `file-import` | PASS |
| `print-labels` | PASS |

The per-claim logs and exit summary are in `.factory/qa-artifacts/claims/`. Landing, inventory, privacy, README, and demo copy were cross-checked against the registry; no unlisted user-facing claim was found.

## Clean-checkout quality gates

- `npm ci`: PASS; 61 packages installed, 0 vulnerabilities.
- `npm run test:unit`: PASS; 10/10 Vitest tests in 2 files.
- `npm test`: PASS; production build plus 21/21 Playwright tests in 45.3 seconds.
- `npm run build`: PASS; TypeScript `tsc --noEmit` and Vite production build; `dist/index.html` exists.
- `npm audit --audit-level=high`: PASS; 0 vulnerabilities.
- No lint script is configured. Type checking is part of the production build.

## Candidate and deployment identity

Live HTML names the same hashed assets produced locally. SHA-256 values match byte for byte:

| Asset | Live and local SHA-256 |
| --- | --- |
| `assets/index-BZMWaEIu.js` | `38b51783d22e3459dee09ceda37bc089c408f971f57f7246aef27801b697d94a` |
| `assets/index-B_LmvHbJ.css` | `615081bd0aeae3e635ab398d8dc68c8a5e2d573a5bfa4c40235d0d4bd86a74cb` |

The live footer, manifest start URL, and worker cache report version `1.1.1`; the cache is `placeboard-v1.1.1`. This is the deployment built by candidate `4764e1b…`.

## Independent end-to-end and recovery checks

The live product was exercised in fresh browser contexts, separate from its shipped test suite.

- Search returned the useful zero-result message, then recovered immediately when changed to `AA batteries`.
- The sample began with 8 batteries in Hall cupboard and 4 in Red tool bin.
- A same-place move was rejected with **“Choose two different places.”**
- A move of 99 was rejected with **“Only 8 available at the starting place.”**
- Correcting that value to the exact available boundary of 8 succeeded, merged the destination to 12, retained the note, and survived reload.
- Blank place creation was blocked by native required-field validation; entering `Boundary shelf` in the same dialog then succeeded.
- Malformed JSON and a CSV with wrong columns each produced specific recovery text. A valid nested `Home / Shed / Top shelf` CSV imported successfully immediately afterward.
- The shipped tests additionally prove new real-inventory creation, edit/archive/undo, occupied-place relocation, multi-place moves in and out, JSON round-trip, CSV export, print-all and print-one labels, and persistence after reload.
- Demo reset removed demo edits; leaving demo deleted `placeboard-demo-v1`, preserved `placeboard-real-v1`, and did not leak records between them.

No console errors or uncaught page errors occurred during the independent journey.

## Accessibility, responsive behavior, and visual review

- The factory `verify-url.sh` passed live `/` and `/demo`: HTTP 200, title, `lang=en`, one h1, main landmark, alt text, labels, and no console errors.
- Playwright Axe reported zero serious or critical findings on `/`, `/demo`, `/inventory`, `/privacy`, `/terms`, `/print?demo=1`, `/offline.html`, and `/404.html`. Separate open-dialog scans of Move, Add place, and Add item reported no Axe violations at any impact level.
- Keyboard order begins with the visible skip link. Its focus ring is 3 px solid amber. Enter opens a dialog, Escape closes it, and focus returns to the opener.
- At 390×844, body width is exactly 390 px and every visible control measured at least 44×44 CSS px. Zoom is not disabled. A 200% root-text-size smoke test retained the h1, search, and primary controls without horizontal overflow.
- With `prefers-reduced-motion: reduce`, transition and animation durations resolve to `0.00001s`.
- Desktop and mobile screenshots were visually reviewed. The night-market sign system is product-specific, hierarchy is clear, text is not obscured, and the mobile workbench stacks without clipping.

## Privacy, network, headers, and routes

- The entire adversarial inventory journey produced 17 requests, all same-origin. There are no analytics, CDN fonts, external scripts, runtime AI, or inventory API calls.
- Inventory state lives in separate local IndexedDB databases for real and demo data. The only external link is the clearly identified Sociobot site link; it is not requested during inventory use.
- Browser-captured root response headers include a self-only CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a permissions policy disabling camera, microphone, and geolocation.
- HTML uses `no-cache, max-age=0, must-revalidate`; hashed JS/CSS use `public, max-age=31536000, immutable`; `sw.js` uses `no-cache, no-store, must-revalidate`.
- `/`, `/inventory`, `/demo`, `/privacy`, `/terms`, `/print?demo=1`, `/manifest.webmanifest`, `/sw.js`, `/offline.html`, and `/404.html` return 200. An arbitrary missing path returns the styled page with HTTP 404. All 26 discovered HTTP links returned below 400.

This is a static PWA with no application server endpoints and no sign-in, so backend concurrency, application endpoint allowance, and Entra authority checks are not applicable. For fresh evidence on the otherwise-unused factory license service, a 50-request concurrent burst to the invalid-token verify URL produced 30 × HTTP 200 followed by 20 × HTTP 429; every 429 carried `Retry-After: 2`. The checkout URL still returns HTTP 404 because this product is not registered for sale.

## PWA and offline behavior

- A fresh visit installed and activated `https://placeboard-inventory.sociobot.in/sw.js` and controlled the next reload.
- `registration.update()` completed; there was no newer waiting worker.
- The versioned cache `placeboard-v1.1.1` exists. The worker source precaches the shell, calls `skipWaiting()`, claims clients, removes prior cache versions, and the app contains the update-ready reload notice.
- With the browser then forced offline, `/demo` reloaded successfully, retained the sample inventory, and displayed **“Offline · changes still save here.”**

## Performance and budgets

Fresh mobile Lighthouse against production scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.154 s, CLS 0, TBT 17 ms, and total transfer 99,779 bytes. A captured demo interaction had a maximum Event Timing duration of 24 ms.

- Initial JS: 39,682 bytes raw / 11,459 bytes gzip (budget: 200 KB).
- CSS: 13,716 bytes raw / 3,971 bytes gzip (budget: 50 KB).
- Runtime fonts: none (budget: 120 KB).
- Mobile hero WebP: 25,426 bytes (budget: 300 KB).

## Scope and monetization deviation

The researched job does not need AI, and no useful AI step is missing. The brief names one-time monetization, but the candidate intentionally exposes no purchase or license UI because the required Sociobot checkout remains unavailable (`GET /api/v1/products/placeboard-inventory/checkout` returned HTTP 404 with `{"error":"enabled factory product"}`). The complete inventory remains free and no dead purchase action is shown. This external registration gap is accurately disclosed in the handoff and does not impair the job-to-be-done.

## Defects by severity

- **P0:** none.
- **P1:** none.
- **P2:** none.
- **P3:** none.

## Evidence

Fresh artifacts are under `.factory/qa-artifacts/`, including claim logs, first-read capture, independent adversarial results, browser screenshots, Axe dialog results, response headers, rate-limit results, asset hashes, and Lighthouse JSON.
