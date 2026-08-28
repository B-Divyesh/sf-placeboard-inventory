# Review 2 handoff — Placeboard Inventory

## Outcome

Independent adversarial review completed without product-code changes. The report is `.factory/review-2.md`. Verdict: **FAIL**.

## What was verified

- Fresh live Chromium contexts at 390×844 and 1440×900; desktop first action is below the initial viewport.
- One-click live demo, realistic sample content, persistent banner, reset, isolated exit to empty real inventory, IndexedDB separation, and same-origin-only demo traffic.
- Every one of the 12 individual commands in `.factory/claims.json` passed.
- `npm run test:unit` passed 6/6 and `npm run build` passed.
- Metadata, h1/main, deep links, route focus, 404 response, legal links, header/footer, link crawl, and visual identity were checked live.

## Known gaps

1. The desktop hero fails the first-screen action/facts contract (reopened F-1-3 as F-2-1).
2. `npm test` fails without a manually held preview server: 8 tests pass, 11 later tests receive `ERR_CONNECTION_REFUSED` (F-2-2). With a separately held preview server, `npx playwright test` passes 19/19; this confirms a test-harness lifecycle issue but does not satisfy the documented command.
3. The report records an unlisted negative capability claim, an unlisted README sample-size claim, and one context-dependent heading.

## How to reproduce

```sh
npm ci
npm run test:unit
npm run build
npm test
```

The final command currently demonstrates F-2-2. Run the 12 commands listed in `.factory/claims.json` individually to reproduce their passing state. See `.factory/review-2.md` for exact observed outputs and fixes.
