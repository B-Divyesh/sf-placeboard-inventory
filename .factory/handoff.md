# Placeboard Inventory v1 handoff — FAIL independent verification

> Independent verification on 2026-08-28 found this candidate **FAILS release**. The deployed live JS is an exact hash match for commit `d5f577931e2a4ea9a7292e177335d02932f53b36`, and all 12 mandatory claim tests pass, but `npm run test:unit` fails from a clean checkout. Live hashed assets also have `Cache-Control: public, must-revalidate, max-age=30` rather than the required long-lived immutable caching. See `.factory/verification-1.md` for exact commands, evidence, and defects.

## What shipped

- Offline-first Vite and TypeScript PWA at `/inventory`, with separate IndexedDB stores for real and demo data.
- Nested place tree for homes, rooms, shelves, bins, cars, and other physical places.
- One item across multiple places, stock moves in or out, dated move history, notes, and full-path search.
- JSON and CSV import/export, printable labels for all places or one chosen place, empty/error/offline states, and install metadata.
- One-click `/demo` with seven places, five items, eight stock positions, and three moves. Reset and exit controls never touch real data.
- $14 one-time supporter pack through Sociobot checkout and license verification. Core inventory and exports remain free.
- Original night-market storage art, responsive WebP variants, social card, icons, legal pages, metadata, sitemap, security headers, and styled offline/404 pages.
- Keyboard route focus, visible focus treatment, 390 px responsive layout, reduced-motion behavior, and plain-language copy audit.

## How to run and verify

```sh
npm install
npm run dev
npm test
npm run build
```

The deploy command is exactly `npm run build`. Output lands in `dist/`, with `dist/index.html` at its root.

Final verification on 28 August 2026:

- `npm test`: 21 passed, including all 12 tagged public claim tests.
- `npm run build`: passed.
- Production bundle: 11.27 KB gzip JavaScript and 3.86 KB gzip CSS. Mobile hero WebP: 25 KB.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo .factory/evidence`: HTTP 200, one `h1`, one `main`, no missing alt text, no unlabeled buttons, and no console errors.
- Lighthouse mobile, landing: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 40 ms.
- Lighthouse mobile, demo: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 0 ms.
- Offline test: the controlled `/demo` route reloaded with the browser network disabled and retained sample data.
- Route crawl: `/`, `/inventory`, `/demo`, `/print?demo=1`, `/privacy`, `/terms`, and the in-app 404 each returned usable pages with one `h1`, one `main`, no horizontal overflow, and no console errors.

Evidence is in `.factory/evidence/`. Public claims and their exact test commands are in `.factory/claims.json`.

## Known gaps and next steps

- This v1 intentionally has no cloud sync, shared accounts, photos, barcode database, valuation, or insurance reporting.
- Browser data can be lost when site storage is cleared. Users should export JSON backups before clearing data or changing devices.
- The factory must register the paid product slug before the live checkout can sell licenses. No payment-provider secret or product ID is stored here.
- Deployment, DNS, billing registration, and live-origin checks remain factory operations outside this repository.
