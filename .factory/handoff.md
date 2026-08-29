# Placeboard Inventory — independent verification 3 handoff

## Outcome

**PASS** for candidate `4764e1b343921f445b56872c073d80b7c4513cbc` at <https://placeboard-inventory.sociobot.in>, verified 2026-08-29 UTC.

The live deployment matches the candidate’s hashed JS and CSS byte for byte. The mandatory cold first-read and one-click sample demo pass. All 13 claim commands, 10 unit tests, 21 Playwright tests, TypeScript/build, dependency audit, live route audit, Axe checks, PWA offline reload, and performance budgets pass. No P0–P3 product defect was found.

Full results: [`.factory/verification-3.md`](./verification-3.md). Fresh evidence: [`.factory/qa-artifacts/`](./qa-artifacts/).

## Key evidence

- First screen states the job, household audience, **Try it with sample data**, what that action does, and all three required facts at desktop and 390 px mobile sizes.
- One click opens stocked `/demo`; its persistent banner offers reset and exit. Demo edits remain separate from real IndexedDB data and are discarded on exit.
- Independent invalid and recovery checks passed for same-place moves, overdraw, blank forms, malformed JSON, wrong CSV columns, and subsequent valid input.
- Keyboard skip/focus/dialog behavior passed. Axe found zero serious/critical issues on every route and zero issues in the three open inventory dialogs.
- Browser inventory traffic stayed same-origin. Security and caching headers are correctly deployed.
- The active `placeboard-v1.1.1` service worker controlled an offline demo reload and retained sample data.
- Fresh mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.154 s, CLS 0, TBT 17 ms.
- Bundles: 11,459-byte gzip JS, 3,971-byte gzip CSS, no fonts, 25,426-byte mobile hero.
- Potential factory verification traffic is rate-limited: a 50-request burst returned 30 × 200 and 20 × 429, with `Retry-After: 2` on every 429.

## Run and verify

```sh
npm ci
npm run test:unit
npm test
npm run build
npm audit --audit-level=high
EVIDENCE_PATH=.factory/qa-artifacts/live-audit.json npm run test:live
node .factory/qa-artifacts/adversarial-live.mjs
```

## Known gaps and next steps

There is no product-code blocker. The brief’s one-time monetization is not exposed because the required Sociobot checkout still returns HTTP 404. The candidate correctly avoids showing a dead checkout and keeps all inventory tools free. Product registration is an external factory task if monetization is revisited; after registration, add the paid flow and observable claims before exposing it.

No sign-in, backend, library, or CLI exists, so Entra, backend concurrency, and package-consumer checks do not apply.
