# Polish round 2 — cumulative finding closure

Candidate reviewed: `c08a86536391b1c2cb9f40fda030c12e363bec69`  
Repairs: `bdd8810b3a0e5b96b1f901e3912834efaafe09bf`, `e967138`  
Live URL: <https://placeboard-inventory.sociobot.in>

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Removed the unavailable supporter checkout, price, and license flow. | `@claim:free-core`; live `/` has no checkout or billing link. |
| F-1-2 | Kept only enumerated SPA rewrites and the complete branded static 404. | `tests/deployment.unit.ts`; live arbitrary route check returns 404 with home, Privacy, and Terms. |
| F-1-3 / F-2-1 | Rebalanced the desktop hero, narrowed its headline scale, and added a 1440×900 first-screen assertion. | `desktop first screen includes the first action, its result, and all facts`; `.factory/evidence-polish-2/local/screenshot-desktop.png`; live `/`. |
| F-1-4 | Removed merchant-of-record copy with the disabled paid offer. | Live `/` copy and built-JS check. |
| F-1-5 | Removed unsupported billing-routing README copy. | README check and built-JS check. |
| F-1-6 | Removed ambiguous product-ID/payment-provider wording. | README check. |
| F-1-7 | Kept no license request path or billing endpoint in the app. | `@claim:local-data` intercepts the complete demo flow; live `/demo` traffic check. |
| F-1-8 | Uses the bounded plain wording “Nest bins and shelves inside rooms.” | `@claim:place-tree`; live `/`. |
| F-1-9 | Maintained 44px targets across reviewed mobile routes. | `all visible mobile controls meet the 44 pixel touch-target minimum`; live mobile route check. |
| F-1-10 | Kept edit/archive, required occupied-place destination, preserved history, and undo. | `@claim:record-correction`; live `/demo`. |
| F-1-11 | Uses the accurate household-items headline. | First-screen tests; live `/`. |
| F-1-12 | Uses “Household inventory organized by place.” | `.factory/copy-audit.md`; live `/`. |
| F-1-13 | Uses “All inventory tools are free.” | `@claim:free-core`; live `/`. |
| F-1-14 | Uses “How to track an item.” | `.factory/copy-audit.md`; live `/`. |
| F-1-15 | Explains browser storage and the valuation/warehouse boundary in plain words. | `@claim:local-data`; live `/`. |
| F-1-16 | Uses “Keep and export your inventory.” | `.factory/copy-audit.md`; live `/`. |
| F-1-17 | Uses “What Placeboard does not do.” | `.factory/copy-audit.md`; live `/`. |
| F-1-18 | Uses the visitor-facing sample-data README heading. | README check. |
| F-1-19 | Uses browser-storage language; keeps database names only in technical notes. | README and `.factory/demo.md` check. |
| F-1-20 | Uses “What Placeboard Inventory does.” | README check. |
| F-1-21 | Uses item quantities consistently. | README terminology check. |
| F-1-22 | Leaves unavailable paid label styles out of public copy. | Live copy and built-JS check. |
| F-2-2 | The test server is never reused, so `npm test` always starts and owns its preview server. | Clean clone: `npm ci && npm test` passed 21/21 with no server held. |
| F-2-3 | Removed the untestable cloud/database/upload capability list. | `.factory/copy-audit.md`; live `/`. |
| F-2-4 | Added the documented sample counts as a claim with an observable export assertion. | `@claim:sample-data`; `.factory/claims.json`; README and live `/demo`. |
| F-2-5 | Rewrote the context-dependent heading as “Add items to places.” | `.factory/copy-audit.md`; live `/`. |

## Evidence summary

- Clean clone at `/tmp/placeboard-clean-6YP8tP`: `npm ci`; `npm test` (21/21); `npm run test:unit` (6/6); `npm run build`.
- Each of the 13 commands declared in `.factory/claims.json` was invoked separately after a clean `npm ci`; all passed. Each claim ID has exactly one `@claim:<id>` Playwright test.
- Local browser baseline: `verify-url.sh http://127.0.0.1:4173/ .factory/evidence-polish-2/local` passed (title, `lang=en`, one h1, main, image alt text, named buttons, zero console errors). Screenshot paths: `.factory/evidence-polish-2/local/screenshot-desktop.png` and `screenshot-mobile.png`.
- Accessibility: Playwright Axe integration reported zero serious or critical findings on `/`, `/demo`, `/inventory`, `/privacy`, `/terms`, `/print?demo=1`, and `/404.html`. The standalone Axe CLI could not launch its Selenium Chrome binary in this worker; the integrated Playwright Chrome audit is the passing check.
- Build budget: JavaScript 39.78 kB (11.52 kB gzip); CSS 13.72 kB (3.96 kB gzip).
