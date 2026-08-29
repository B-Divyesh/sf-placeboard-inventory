# Demo sandbox

- URL: `https://placeboard-inventory.sociobot.in/?demo=1` (also `/demo`) or local `http://localhost:5173/?demo=1`.
- Sample: seven nested places, five household items, and three recent moves. AA batteries, painter’s tape, and shopping bags demonstrate quantities in several places.
- Storage: demo routes use the separate `placeboard-demo-v1` browser database. Real routes use `placeboard-real-v1`.
- Reset: select **Reset demo** in the persistent amber banner.
- Leave: select **Start for real** or any non-demo navigation. The demo database is deleted before the real route opens.
- Offline check: visit `/demo` once, wait for the service worker, reload so it controls the page, set the browser offline, and reload `/demo`.
