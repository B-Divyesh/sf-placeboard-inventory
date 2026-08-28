# Adversarial review 1 handoff

## Outcome

Review 1 is complete with verdict **FAIL**. The full evidence and 22 findings
are in `.factory/review-1.md`. No product code was modified.

The release blockers are:

1. The live **Buy supporter pack** endpoint returns HTTP 404, while its claim
   test passes by checking only the `href`.
2. Unknown application routes return HTTP 200 soft-404 pages, and the true
   static 404 does not use the standard header/footer skeleton.

The review also records unlisted billing/privacy/depth claims, first-screen
content below the fold, three undersized mobile links, a missing record
correction/archive workflow, and plain-words issues with exact rewrites.

## How it was verified

- Opened the live landing page cold in fresh 390×844 and 1440×900 Chromium
  contexts before scrolling.
- Entered the live demo in one click; verified realistic sample data, banner,
  reset, real/demo storage separation, exit cleanup, offline reload, and zero
  cross-origin requests in the normal demo journey.
- Ran all 13 commands from `.factory/claims.json` separately after `npm ci`.
- Ran `npm run test:unit` (4 passed), `npm test` (20 passed), and
  `npm run build` (passed).
- Crawled live routes and links, checked response statuses/headers, metadata,
  history focus/scroll restoration, 390 px target sizes, and every prior
  handoff/verification finding.
- Ran `/opt/fleet/lib/verify-url.sh` against live `/demo` and Playwright Axe on
  seven live routes; Axe returned zero violations.
- Confirmed deployed JS/CSS hashes match the local production build.

## Work left

Address F-1-1 through F-1-22 in `.factory/review-1.md`, then repeat the entire
review from a fresh browser context. In particular, do not restore the paid CTA
until the Sociobot checkout responds successfully and the tagged test verifies
that outcome.
