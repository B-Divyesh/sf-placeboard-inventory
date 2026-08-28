# Demo sandbox

- URL: `https://placeboard-inventory.sociobot.in/demo` or local `http://localhost:5173/demo`.
- Sample: seven nested places, five household items, eight stock positions, and three recent moves. AA batteries, painter’s tape, and shopping bags each demonstrate multi-place stock.
- Storage: IndexedDB database `placeboard-demo-v1`. Real data uses `placeboard-real-v1`; the application never opens both for one route.
- Reset: select **Reset demo** in the persistent amber banner.
- Leave: select **Start for real** or any non-demo navigation. The demo database is deleted before the real route opens.
- Offline check: visit `/demo` once, wait for the service worker, reload so it controls the page, set the browser offline, and reload `/demo`.
