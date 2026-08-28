import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Find an item in your home' })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'AA batteries' })).toBeVisible();
  await expect(page.getByText(/Offline · changes still save here/)).toBeVisible();
});

test('@claim:demo-sandbox keeps demo changes away from real data', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add place' }).click();
  await page.getByLabel('Place name').fill('Attic trunk');
  await page.getByRole('button', { name: 'Save place' }).click();
  await expect(page.getByRole('link', { name: 'Attic trunk 0 items here' })).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/inventory$/);
  await expect(page.getByText('Attic trunk')).toHaveCount(0);
  await expect(page.getByText('Your rooms, shelves, and bins will appear here.')).toBeVisible();
});

test('@claim:local-data sends no inventory data off origin', async ({ page }) => {
  const crossOrigin: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') crossOrigin.push(request.url());
  });
  await page.goto('/demo');
  await page.getByLabel('Search items and places').fill('batteries');
  await page.getByRole('button', { name: 'Move or add' }).click();
  await page.getByLabel('To', { exact: true }).selectOption({ label: 'Home / Garage / Red tool bin' });
  await page.getByLabel('Quantity').last().fill('1');
  await page.getByRole('button', { name: 'Record move' }).click();
  expect(crossOrigin).toEqual([]);
});

test('@claim:multi-location-move updates both places and history', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Search items and places').fill('AA batteries');
  await expect(page.getByText('8 at Home / Hall cupboard · 4 at Home / Garage / Red tool bin')).toBeVisible();
  await page.getByRole('button', { name: 'Move or add' }).click();
  await expect(page.getByLabel('From')).toHaveValue('hall');
  await page.getByLabel('To', { exact: true }).selectOption('red-bin');
  await page.getByLabel('Quantity').last().fill('2');
  await page.getByRole('textbox', { name: 'Note', exact: true }).fill('Restocked workbench');
  await page.getByRole('button', { name: 'Record move' }).click();
  await page.getByLabel('Search items and places').fill('AA batteries');
  await expect(page.getByText('6 at Home / Hall cupboard · 6 at Home / Garage / Red tool bin')).toBeVisible();
  await expect(page.getByText(/2 × AA batteries/).first()).toBeVisible();
  await expect(page.getByText(/Restocked workbench/)).toBeVisible();
  await expect(page.getByText(/Aug 28, 2026|2026/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Move or add' }).click();
  await page.getByLabel('From').selectOption('');
  await page.getByLabel('To', { exact: true }).selectOption('pantry');
  await page.getByLabel('Quantity').last().fill('1');
  await page.getByRole('button', { name: 'Record move' }).click();
  await expect(page.getByText(/1 at Home \/ Kitchen \/ Pantry shelf/)).toBeVisible();
  await expect(page.getByText('13 total')).toBeVisible();
});

test('@claim:place-tree shows nested physical places', async ({ page }) => {
  await page.goto('/demo');
  const home = page.locator('[data-filter-place="home"]').locator('..').locator('..');
  await expect(home.locator('[data-filter-place="garage"]')).toBeVisible();
  await expect(home.locator('[data-filter-place="red-bin"]')).toBeVisible();
});

test('@claim:quick-search matches names, notes, and place paths', async ({ page }) => {
  await page.goto('/demo');
  const search = page.getByLabel('Search items and places');
  await search.fill('batteries'); await expect(page.getByRole('heading', { name: 'AA batteries' })).toBeVisible();
  await search.fill('USB-C cable'); await expect(page.getByRole('heading', { name: 'Camping lantern' })).toBeVisible();
  await search.fill('Red tool bin'); await expect(page.getByRole('heading', { name: 'Painter’s tape' })).toBeVisible();
});

test('@claim:csv-export downloads current quantities and paths', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const text = await (await import('node:fs/promises')).readFile(await download.path() as string, 'utf8');
  expect(text).toContain('"item","place","quantity","notes"');
  expect(text).toContain('"AA batteries","Home / Hall cupboard","8"');
  expect(text.trim().split('\n')).toHaveLength(9);
});

test('@claim:json-export downloads full inventory and history', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const value = JSON.parse(await (await import('node:fs/promises')).readFile(await download.path() as string, 'utf8'));
  expect(value).toMatchObject({ version: 1 });
  expect(value.places).toHaveLength(7);
  expect(value.items).toHaveLength(5);
  expect(value.stocks).toHaveLength(8);
  expect(value.moves).toHaveLength(3);
});

test('@claim:file-import imports CSV and Placeboard JSON', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/demo');
  await page.locator('#import-csv').setInputFiles({
    name: 'inventory.csv', mimeType: 'text/csv',
    buffer: Buffer.from('item,place,quantity,notes\nGarden twine,Home / Shed / Top shelf,2,Green roll')
  });
  await expect(page.getByRole('heading', { name: 'Garden twine' })).toBeVisible();
  const importedJson = { version: 1, places: [{ id: 'desk', name: 'Desk drawer', parentId: null, createdAt: '2026-01-01T00:00:00Z' }], items: [{ id: 'pen', name: 'Fountain pen', notes: '', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }], stocks: [{ itemId: 'pen', placeId: 'desk', quantity: 1 }], moves: [] };
  await page.locator('#import-json').setInputFiles({ name: 'placeboard.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(importedJson)) });
  await expect(page.getByRole('heading', { name: 'Fountain pen' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Desk drawer 1 item here' })).toBeVisible();
});

test('@claim:print-labels prints all or one chosen place', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Print labels' }).click();
  await expect(page.locator('.print-label')).toHaveCount(7);
  await page.getByRole('link', { name: 'Back to inventory' }).click();
  await page.locator('[data-filter-place="hall"]').locator('..').getByRole('link', { name: 'Label' }).click();
  await expect(page.locator('.print-label')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Hall cupboard', level: 2 })).toBeVisible();
});

test('@claim:supporter-price shows one-time price and Sociobot checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('$14 once')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy supporter pack/ })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/placeboard-inventory/checkout');
});

test('@claim:supporter-features adds print styles and a move summary', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('sb_license_verdict:placeboard-inventory', JSON.stringify({ valid: true, checkedAt: Date.now() })));
  await page.goto('/demo');
  await expect(page.getByText(/Supporter summary: 3 moves/)).toBeVisible();
  await page.getByRole('link', { name: 'Print labels' }).click();
  await expect(page.getByRole('group', { name: 'Label style' }).getByRole('button')).toHaveCount(4);
  await page.getByRole('button', { name: 'Neon route' }).click();
  await expect(page.locator('.print-label').first()).toHaveAttribute('data-style', 'neon');
});

test('landing and demo have no serious accessibility findings', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page: page as never }).analyze();
    expect(result.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});

test('mobile inventory keeps actions visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
});

test('a keyboard user can create and reopen a real inventory', async ({ page }) => {
  await page.goto('/inventory');
  const addPlace = page.getByRole('button', { name: 'Add first place' });
  await addPlace.press('Enter');
  await page.getByLabel('Place name').fill('Flat');
  await page.getByRole('button', { name: 'Save place' }).press('Enter');
  await expect(page.getByText('Added Flat.')).toBeVisible();
  await page.getByRole('button', { name: 'Add first item' }).press('Enter');
  await page.getByLabel('Item name').fill('Spare keys');
  await page.getByLabel('Starting place').selectOption({ label: 'Flat' });
  await page.getByLabel('Quantity').first().fill('2');
  await page.getByRole('button', { name: 'Save item' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Spare keys' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('2 at Flat')).toBeVisible();
});

test('move errors explain how to fix the quantity', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Search items and places').fill('AA batteries');
  await page.getByRole('button', { name: 'Move or add' }).click();
  await page.getByLabel('To', { exact: true }).selectOption('');
  await page.getByLabel('Quantity').last().fill('99');
  await page.getByRole('button', { name: 'Record move' }).click();
  await expect(page.getByRole('alert')).toHaveText('Only 8 available at the starting place.');
});

test('SPA navigation focuses the new page heading and unknown routes recover', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page.getByRole('heading', { name: 'Privacy in plain words' })).toBeFocused();
  await page.goto('/missing-shelf');
  await expect(page).toHaveTitle('Not found — Placeboard Inventory');
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
});

test('a returned license is stored, checked, and removed from the URL', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', route => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/inventory?license=receipt-token');
  await expect(page).toHaveURL(/\/inventory$/);
  await expect(page.getByText('Supporter summary: 0 moves in the last 30 days.')).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sb_license:placeboard-inventory'))).toBe('receipt-token');
});
