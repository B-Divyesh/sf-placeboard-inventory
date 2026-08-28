# Placeboard Inventory — adversarial review 3 handoff

## Outcome

Review 3 is complete with a **FAIL** verdict: one blocking reopened finding and
two minor findings remain. No product code was changed. The full report is
`.factory/review-3.md`.

The blocker is F-2-3: unlisted valuation/warehouse capability boundaries still
appear on the live landing page and README. Static offline/404 metadata is
incomplete, and visible `v1.1.1` release labels disagree with package/manifest
`1.1.0`.

## Verified

- Cold live first screen at 390×844 and 1440×900: job, audience, primary demo
  action, action result, and three facts all fit without scrolling.
- Live demo: realistic sample on entry, persistent banner, working move/reset,
  pre-existing real data preserved, demo-only data absent after exit, and only
  the real IndexedDB database left.
- Live requests: demo flow was same-origin only.
- Clean clone `/tmp/placeboard-review3-DhsC0U/repo`: all 13 claims commands
  passed separately; `npm test` passed 21/21; `npm run test:unit` passed 6/6;
  `npm run build` produced `dist/`.
- Live accessibility: the factory verifier passed with zero console errors;
  Playwright Axe found zero serious/critical violations across seven routes.
- Routing: deep routes, focus, Back/Forward, 404 status, and all crawled links
  passed.
- Every prior F-1-* and F-2-* finding was rechecked; only F-2-3 is half-fixed.

Evidence is in `.factory/evidence-review-3/`.

## Next steps

1. Remove the unlisted scope sentences, or register and test them as described
   in F-2-3.
2. Complete OG/Twitter metadata for `/offline.html` and `/404.html` and decide
   whether the offline fallback is indexed.
3. Align package, lockfile, manifest, service-worker, and footer versions and
   add a mismatch regression test.
4. Re-run the entire review checklist; do not treat this round as a diff-only
   verification.
