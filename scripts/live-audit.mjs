import { writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const origin = (process.env.LIVE_URL ?? 'https://placeboard-inventory.sociobot.in').replace(/\/$/, '');
const evidencePath = process.env.EVIDENCE_PATH ?? '.factory/evidence-polish-3/live-audit.json';
const browser = await chromium.launch();
const report = { origin, checkedAt: new Date().toISOString(), checks: {}, consoleErrors: [] };

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function attachConsole(page) {
  page.on('pageerror', error => report.consoleErrors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
  });
}

try {
  const firstScreen = {};
  for (const viewport of [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await attachConsole(page);
    await page.goto(`${origin}/?cold=${Date.now()}`, { waitUntil: 'networkidle' });
    const positions = {};
    for (const copy of [
      'Try it with sample data',
      'Opens a stocked sample. Your inventory is unchanged.',
      'Works offline after your first visit.',
      'Inventory data stays on this device.',
      'All inventory tools are free.',
    ]) {
      const box = await page.getByText(copy, { exact: true }).boundingBox();
      check(box, `${viewport.name}: missing first-screen copy: ${copy}`);
      positions[copy] = Math.round(box.y + box.height);
      check(box.y + box.height <= viewport.height, `${viewport.name}: first-screen copy is below the fold: ${copy}`);
    }
    firstScreen[viewport.name] = positions;
    await context.close();
  }
  report.checks.firstScreen = firstScreen;

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await attachConsole(page);
  const crossOriginRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== origin) crossOriginRequests.push(request.url());
  });

  await page.goto(`${origin}/inventory`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Add place', exact: true }).click();
  await page.locator('#place-dialog').getByLabel('Place name').fill('Real linen shelf');
  await page.getByRole('button', { name: 'Save place' }).click();
  await page.getByText('Added Real linen shelf.', { exact: true }).waitFor();
  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
  check(new URL(page.url()).pathname === '/demo', 'The direct ?demo=1 URL did not enter /demo.');
  const demoBanner = page.locator('.demo-banner');
  await demoBanner.waitFor();
  check((await demoBanner.innerText()).includes('Demo — sample data, nothing is saved to your inventory'), 'The demo banner copy is missing.');
  check(await page.getByText('Real linen shelf').count() === 0, 'Real data leaked into the demo.');
  await page.getByRole('button', { name: 'Add place', exact: true }).click();
  await page.locator('#place-dialog').getByLabel('Place name').fill('Attic trunk');
  await page.getByRole('button', { name: 'Save place' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByText('Sample data was reset.', { exact: true }).waitFor();
  check(await page.getByText('Attic trunk').count() === 0, 'Reset demo retained a demo edit.');
  await page.getByRole('heading', { name: 'AA batteries' }).waitFor();
  await page.getByRole('button', { name: 'Add place', exact: true }).click();
  await page.locator('#place-dialog').getByLabel('Place name').fill('Demo-only crate');
  await page.getByRole('button', { name: 'Save place' }).click();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.getByRole('link', { name: 'Real linen shelf 0 items here' }).waitFor();
  check(await page.getByText('Demo-only crate').count() === 0, 'Demo data leaked into the real inventory.');
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map(database => database.name).filter(Boolean));
  check(databases.includes('placeboard-real-v1'), 'The real inventory database is missing.');
  check(!databases.includes('placeboard-demo-v1'), 'The demo database remained after leaving demo mode.');
  check(crossOriginRequests.length === 0, `Demo flow made cross-origin requests: ${crossOriginRequests.join(', ')}`);
  report.checks.demoIsolation = { directPath: '/demo', reset: true, realDataPreserved: true, demoDatabaseDiscarded: true, crossOriginRequests };

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  check(await page.getByRole('heading', { name: 'Privacy in plain words' }).evaluate(element => element === document.activeElement), 'Privacy navigation did not focus its h1.');
  await page.goBack();
  check(await page.getByRole('heading', { name: 'Find household items by where you stored them' }).evaluate(element => element === document.activeElement), 'Back navigation did not restore focus to the landing h1.');
  report.checks.historyFocus = true;

  const routes = [
    ['/', 'Placeboard Inventory — Find household items by place'],
    ['/demo', 'Demo — Placeboard Inventory'],
    ['/inventory', 'Inventory — Placeboard Inventory'],
    ['/privacy', 'Privacy — Placeboard Inventory'],
    ['/terms', 'Terms — Placeboard Inventory'],
    ['/print?demo=1', 'Print labels — Placeboard Inventory'],
    ['/offline.html', 'Offline — Placeboard Inventory'],
    ['/404.html', 'Not found — Placeboard Inventory'],
  ];
  const routeResults = [];
  const discoveredLinks = new Set();
  const forbiddenBoundaryTerms = /\b(valuation|insurance|barcode|warehouse)\b/i;
  for (const [path, title] of routes) {
    const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    check(response?.status() === 200, `${path}: expected HTTP 200, got ${response?.status()}`);
    check(await page.title() === title, `${path}: wrong title`);
    check(await page.locator('h1').count() === 1, `${path}: expected one h1`);
    check(await page.locator('main').count() === 1, `${path}: expected one main`);
    check(await page.locator('header').count() === 1 && await page.locator('footer').count() === 1, `${path}: missing shared header or footer`);
    check(await page.locator('a[href="/privacy"]').count() > 0 && await page.locator('a[href="/terms"]').count() > 0, `${path}: missing legal links`);
    for (const selector of ['meta[name="description"]', 'link[rel="canonical"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[name="twitter:image"]']) {
      check(await page.locator(selector).count() === 1, `${path}: missing ${selector}`);
    }
    check((await page.locator('footer').innerText()).includes('v1.1.1 · polish-3'), `${path}: wrong release footer`);
    check(!forbiddenBoundaryTerms.test(await page.locator('body').innerText()), `${path}: contains an unlisted scope boundary`);
    const axe = await new AxeBuilder({ page }).analyze();
    const serious = axe.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''));
    check(serious.length === 0, `${path}: serious accessibility findings: ${serious.map(item => item.id).join(', ')}`);
    const controls = page.locator('a, button, input:not([type="file"]), select, textarea, label.button');
    for (let index = 0; index < await controls.count(); index += 1) {
      const control = controls.nth(index);
      if (!await control.isVisible()) continue;
      const box = await control.boundingBox();
      check(box && box.width >= 44 && box.height >= 44, `${path}: undersized control ${await control.evaluate(element => element.outerHTML.slice(0, 160))}`);
    }
    for (const href of await page.locator('a[href]').evaluateAll(links => links.map(link => link.href))) discoveredLinks.add(href);
    routeResults.push({ path, title, seriousAxeViolations: serious.length });
  }
  report.checks.routes = routeResults;

  const missing = await context.request.get(`${origin}/definitely-missing-polish-3`);
  check(missing.status() === 404, `Unknown route returned ${missing.status()} instead of 404.`);
  const missingBody = await missing.text();
  check((missingBody.match(/<h1[ >]/g) ?? []).length === 1, '404 response does not contain one h1.');
  check(missingBody.includes('href="/privacy"') && missingBody.includes('href="/terms"') && missingBody.includes('Return home'), '404 response is missing recovery or legal links.');
  report.checks.unknownRoute = { status: 404, oneH1: true, legalLinks: true };

  const linkResults = [];
  for (const href of discoveredLinks) {
    if (href.startsWith('mailto:')) continue;
    const response = await context.request.get(href);
    check(response.status() < 400, `Dead link ${href}: HTTP ${response.status()}`);
    linkResults.push({ href, status: response.status() });
  }
  report.checks.links = linkResults;

  const manifest = await (await context.request.get(`${origin}/manifest.webmanifest`)).json();
  const worker = await (await context.request.get(`${origin}/sw.js`)).text();
  check(manifest.start_url === '/inventory?v=1.1.1', `Manifest version mismatch: ${manifest.start_url}`);
  check(worker.includes("placeboard-v1.1.1"), 'Service worker cache version mismatch.');
  report.checks.release = { footer: 'v1.1.1 · polish-3', manifestStartUrl: manifest.start_url, serviceWorkerCache: 'placeboard-v1.1.1' };

  await context.close();
  check(report.consoleErrors.length === 0, `Console errors: ${report.consoleErrors.join('; ')}`);
  report.result = 'pass';
} catch (error) {
  report.result = 'fail';
  report.error = error instanceof Error ? error.stack : String(error);
  throw error;
} finally {
  await writeFile(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
