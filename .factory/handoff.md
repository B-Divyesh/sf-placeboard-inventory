# Placeboard Inventory v1.0.1 repair handoff

This repair resolves every release blocker in independent verification report
`.factory/verification-1.md` for candidate
`d5f577931e2a4ea9a7292e177335d02932f53b36`. It preserves the offline,
local-first household inventory artifact and its static PWA deployment class.

## Repaired findings

- **Unit quality gate:** `npm run test:unit` now runs only `tests/**/*.unit.ts`
  through `vitest.config.ts`. The formerly miscollected Playwright data tests
  are real Vitest tests. The unit suite also asserts the deployed cache policy.
- **Static cache policy:** `public/staticwebapp.config.json` now sets
  `Cache-Control: public, max-age=31536000, immutable` for `/assets/*` and
  leaves HTML globally revalidated. `sw.js` is explicitly `no-cache, no-store,
  must-revalidate` so updates can be discovered.
- **390 px targets:** the wordmark has a 44×44 px minimum hit area and nav
  links have horizontal hit-area padding. A Playwright viewport test measures
  both the wordmark and Demo link at 390 px.
- **Free-core claim:** `.factory/claims.json` now maps “The complete inventory
  stays free” to `@claim:free-core`. In a fresh no-license browser context the
  test creates a place and item, then exports JSON.

## Run and verify

```sh
npm ci
npm run test:unit
npm test
npm run build
```

Deploy with `npm run build`; `dist/index.html` is the static entry point.

Verification completed on 2026-08-28:

- `npm ci`: passed. `npm audit --omit=dev --json`: 0 production
  vulnerabilities.
- `npm run test:unit`: passed, 4 tests in 2 files. It includes the exact
  static caching-policy regression assertion.
- `npm test`: passed uninterrupted, 20 Chromium tests. This includes all 13
  tagged public claims, offline controlled reload, separate demo storage,
  privacy request interception, import/export, desktop, 390 px mobile,
  keyboard, route-focus, invalid-move recovery, and license-return flows.
- `npm run build`: passed with TypeScript no-emit checking. Output: 11.27 KB
  gzip JavaScript and 3.87 KB gzip CSS; `dist/` contains its root `index.html`.
  No separate linter is configured in this intentionally small TypeScript
  project; the build type check is the available static-analysis gate.
- Playwright Axe found zero serious or critical violations on `/`, `/demo`, and
  `/privacy`. The same suite verifies reduced-motion-compatible UI and 44 px
  mobile header targets. `verify-url.sh` against local `/demo` returned HTTP
  200, one title/lang/main/h1, no missing image alt text or unlabeled buttons,
  and no console errors. Evidence: `.factory/evidence-repair/verify.json` and
  the desktop/mobile screenshots beside it.
- The `@claim:offline-reload` browser test visited controlled `/demo`, disabled
  networking, reloaded, retained sample data, and showed the offline status.
  Service worker/update source behavior remains unchanged; cache routing is now
  covered by the deployment-policy unit test.
- The build contains only same-origin assets plus the explicit Sociobot billing
  endpoint in `connect-src`; normal inventory flows make no third-party request.
- **Production deployment:** deployed with `/opt/fleet/lib/deploy-static.sh
  placeboard-inventory dist` to `https://placeboard-inventory.sociobot.in`.
  The live document references `assets/index-DU6DI1jj.js`; its SHA-256 is
  `95dd60b061935f0d478ad200520d95065e6b9c0d5e4de467ac7d30b28aa455e8`,
  exactly matching `dist`. Live JS and CSS return `public, max-age=31536000,
  immutable`; `sw.js` returns `no-cache, no-store, must-revalidate`. Live
  `/demo` passed `verify-url.sh` (HTTP 200, no console errors, title/lang/main/
  h1/alt/button checks) and all documented app, legal, PWA, manifest, robots,
  and sitemap routes returned HTTP 200. Evidence is in
  `.factory/evidence-live-repair/`.

## Known limits

- There is no cloud sync, shared account, photos, barcode database, valuation,
  or insurance reporting. Browser storage can be cleared, so export JSON before
  clearing site data or moving devices.
- The supporter product must be registered by the factory before live checkout
  can sell licenses. No billing secret or payment-provider code is present.
