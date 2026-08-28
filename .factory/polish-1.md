# Polish round 1 — finding closure

Candidate repaired: `04630d7a6e6edb830f2111ad208a85d278cb41da`

Review applied: `d1557ef66cadc7e74e8ccfea0749096cd514ff13` / `.factory/review-1.md`

Repair commit: `8263e5cf90dc5834e23f83ff5ec11608e68fabd0`

Live URL: <https://placeboard-inventory.sociobot.in>

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Removed the unavailable supporter offer, checkout link, license form, license runtime, and price claim. | `@claim:free-core`; live demo crawl found zero checkout links; deployed JS contains no checkout, license, or billing endpoint. |
| F-1-2 | Replaced the catch-all SPA fallback with five enumerated app routes. Unknown paths now use a standard-header/footer 404 response. | `tests/deployment.unit.ts`; live `/definitely-missing-review-route` and `/missing-route/deeper` returned 404 with one h1, home, Privacy, Terms, and v1.1.0. |
| F-1-3 | Put “Opens a stocked sample. Your inventory is unchanged.” with the primary action, hid nonessential art on phones, and compacted the mobile hero. | `mobile first screen includes…`; [live mobile screenshot](evidence-polish-1/live-landing-mobile.png). All required text ends above y=844. |
| F-1-4 | Removed the merchant-of-record sentence with the unavailable paid offer. | Live landing and built-JS scan; no merchant or checkout copy remains. |
| F-1-5 | Removed the README billing-routing claim and the disabled billing flow. | README review; built-JS scan. |
| F-1-6 | Removed the ambiguous product-ID/payment-provider sentence. | README review. |
| F-1-7 | Removed license storage, verification UI, request code, and the license-request privacy claim. | `src/license.ts` deleted; CSP `connect-src 'self'`; live demo flow recorded zero cross-origin requests. |
| F-1-8 | Replaced the unbounded depth promise with “Nest bins and shelves inside rooms.” | `.factory/copy-audit.md`; `@claim:place-tree`. |
| F-1-9 | Applied 44×44 minimums to every button and interactive link, including legal email and place controls. | `all visible mobile controls meet…` checks every visible control on seven routes at 390 px. |
| F-1-10 | Added persistent item/place editing and archiving. Occupied places require a destination; child places block parent archival; moves remain; archive actions have exact confirmation and immediate undo. | `@claim:record-correction`; data unit test `editing and archiving…`; live edit/archive/destination/history/undo flow passed. |
| F-1-11 | Headline is now “Find household items by where you stored them.” | Live `/`; first-screen test and screenshots. |
| F-1-12 | Eyebrow is now “Household inventory organized by place.” | Live `/`; `.factory/copy-audit.md`. |
| F-1-13 | Fact is now “All inventory tools are free.” | `@claim:free-core` exercises the complete visible toolset without a license. |
| F-1-14 | Heading is now “How to track an item.” | Live `/`; `.factory/copy-audit.md`. |
| F-1-15 | Limits copy now says the inventory stays in this browser and does not value items or run a warehouse. | `@claim:local-data`; live `/`. |
| F-1-16 | Heading is now “Keep and export your inventory.” | Live `/`; `.factory/copy-audit.md`. |
| F-1-17 | Heading is now “What Placeboard does not do.” | Live `/`; `.factory/copy-audit.md`. |
| F-1-18 | README heading is now “Try sample data without changing your inventory.” | README review. |
| F-1-19 | Visitor copy says “browser” or “browser database”; namespace details moved to a technical note. | README, `/privacy`, `.factory/demo.md`. |
| F-1-20 | README heading is now “What Placeboard Inventory does.” | README review. |
| F-1-21 | README consistently says item quantities, never stock. | README review; claims terminology audit. |
| F-1-22 | Removed the unavailable paid label-style feature and every public name for it. | Landing, print route, README, claims, and built-JS scan. |

## Cumulative acceptance evidence

- Clean clone: all 12 commands declared in `.factory/claims.json` passed separately. Every ID appears in exactly one tagged test.
- Local: `npm run test:unit` passed 6 tests; `npm test` passed 19 browser tests; `npm run build` passed; `npm audit` reported 0 vulnerabilities.
- Build: JS 39.82 kB / 11.56 kB gzip; CSS 13.67 kB / 3.95 kB gzip.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.5 s; CLS 0.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.4 s; CLS 0; 98 KiB transferred.
- Live route Axe checks: zero serious or critical violations on `/`, `/demo`, `/inventory`, `/privacy`, `/terms`, and `/print?demo=1`.
- `verify-url.sh` passed live `/demo`: title, `lang=en`, one h1, main, alt text, button labels, and no console errors. See `evidence-polish-1/live-verify/verify.json`.
- Live JS and CSS SHA-256 hashes exactly match `dist`: `580c37fc…2667487b` and `f2c8d7a2…63c4c40f`.
- Cold live checks passed `/?demo=1`, reset, exit to an empty real inventory, offline reload, route focus/back/forward, route titles/canonicals, privacy, mobile targets, and real 404 status.

No finding remains open.
