# Placeboard Inventory

Find shared household items by place and record every move.

Placeboard is for households that use cupboards, shelves, bins, sheds, cars, or multiple homes. One item can have quantities in several places. A move updates both place counts and adds a dated history entry.

Live site: <https://placeboard-inventory.sociobot.in>

## Try the isolated demo

Open `/demo`, or visit <https://placeboard-inventory.sociobot.in/demo>. The demo includes seven places, five items, and three moves. It uses the separate `placeboard-demo-v1` IndexedDB database. Leaving the demo deletes its changes and never changes the real inventory.

The sample is bundled with the app. The demo works offline after the first visit.

## What v1 does

- Builds a nested place tree for homes, rooms, shelves, and bins.
- Keeps one item in several places with a quantity at each place.
- Moves stock between places or in and out of the inventory.
- Searches item names, notes, and full place paths.
- Keeps dated move history.
- Prints all place labels or one chosen label.
- Exports full data and move history as JSON.
- Exports current quantities and place paths as CSV.
- Imports Placeboard JSON and CSV files.
- Stores inventory in IndexedDB on this device.

This is not an insurance record, valuation tool, barcode catalog, or warehouse system.

## Supporter pack

The complete inventory remains free. A $14 one-time supporter pack adds three label styles and a 30-day move summary. Checkout and license verification use the Sociobot billing API. No product ID or payment-provider code is embedded here.

## Develop and verify

Requirements: Node.js 22 and npm.

```sh
npm install
npm run dev
npm test
npm run build
```

`npm test` builds the production app and runs the Playwright claim, accessibility, mobile, and data tests. The exact deploy command is `npm run build`. It writes the static site to `dist/`, with `dist/index.html` at its root.

To run only one public claim:

```sh
npm test -- --grep @claim:offline-reload
```

The Playwright version is pinned to `1.58.2`. Set `PLAYWRIGHT_BROWSERS_PATH` to the worker browser cache when needed.

## Privacy and data ownership

Normal inventory use makes no third-party request. Data stays in local browser storage unless the user exports it. License verification sends only the entered license token to `api.sociobot.in`. See `/privacy` and `/terms` in the app.

## Deployment

Deploy the contents of `dist/` as a static site. `staticwebapp.config.json` provides SPA fallback, security headers, and the styled 404 response. The factory owns DNS, infrastructure, and billing setup.

## License

MIT. See [LICENSE](./LICENSE).
