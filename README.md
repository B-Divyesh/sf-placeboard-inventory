# Placeboard Inventory

Find shared household items by place and record every move.

Placeboard is for households that use cupboards, shelves, bins, sheds, cars, or multiple homes. One item can have quantities in several places. A move updates both place counts and adds a dated history entry.

Live site: <https://placeboard-inventory.sociobot.in>

## Try sample data without changing your inventory

Open `/?demo=1` or `/demo`, or visit <https://placeboard-inventory.sociobot.in/?demo=1>. The demo includes seven places, five items, and three moves. It uses a separate browser database. Leaving the demo deletes its changes and never changes the real inventory.

The sample is bundled with the app. The demo works offline after the first visit.

Technical note: demo data uses `placeboard-demo-v1`; real data uses `placeboard-real-v1`.

## What Placeboard Inventory does

- Builds a nested place tree for homes, rooms, shelves, and bins.
- Keeps one item in several places with a quantity at each place.
- Records item quantities moving between places or in and out of the inventory.
- Lets you edit or archive items and places while keeping move history.
- Requires a destination before archiving an occupied place and offers undo.
- Searches item names, notes, and full place paths.
- Keeps dated move history.
- Prints all place labels or one chosen label.
- Exports full data and move history as JSON.
- Exports current quantities and place paths as CSV.
- Imports Placeboard JSON and CSV files.
- Stores inventory in this browser.

All inventory tools are free. Placeboard is not an insurance record, valuation tool, barcode catalog, or warehouse system.

## Develop and verify

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
npm run test:unit
npm test
npm run build
```

`npm run test:unit` runs the Vitest data and deployment-policy tests. `npm test` builds the production app and runs Playwright claim, accessibility, mobile, privacy, offline, routing, and keyboard tests. `npm run build` writes the static site to `dist/`, with `dist/index.html` at its root.

To run one public claim:

```sh
npm test -- --grep @claim:offline-reload
```

The Playwright version is pinned to `1.58.2`. Set `PLAYWRIGHT_BROWSERS_PATH` to the worker browser cache when needed.

## Privacy and data ownership

Inventory use makes no third-party request. Data stays in local browser storage unless you export it. See `/privacy` and `/terms` in the app.

## Deployment

Deploy the contents of `dist/` as a static site. `staticwebapp.config.json` enumerates application routes, returns the styled 404 for unknown paths, sets security headers, caches hashed assets, and revalidates HTML and `sw.js`. The factory owns DNS and infrastructure.

## License

MIT. See [LICENSE](./LICENSE).
