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
  await page.goto('/inventory');
  await page.getByRole('button', { name: 'Add place' }).click();
  await page.locator('#place-dialog').getByLabel('Place name').fill('Real linen shelf');
  await page.getByRole('button', { name: 'Save place' }).click();
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved to your inventory')).toBeVisible();
  await expect(page.getByText('Real linen shelf')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add place' }).click();
  await page.locator('#place-dialog').getByLabel('Place name').fill('Attic trunk');
  await page.getByRole('button', { name: 'Save place' }).click();
  await expect(page.getByRole('link', { name: 'Attic trunk 0 items here' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Sample data was reset.')).toBeVisible();
  await expect(page.getByText('Attic trunk')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'AA batteries' })).toBeVisible();
  await page.getByRole('button', { name: 'Add place' }).click();
  await page.locator('#place-dialog').getByLabel('Place name').fill('Demo-only crate');
  await page.getByRole('button', { name: 'Save place' }).click();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/inventory$/);
  await expect(page.getByText('Attic trunk')).toHaveCount(0);
  await expect(page.getByText('Demo-only crate')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Real linen shelf 0 items here' })).toBeVisible();
});

test('@claim:sample-data provides the documented places, items, and moves', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const value = JSON.parse(await (await import('node:fs/promises')).readFile(await download.path() as string, 'utf8'));
  expect(value.places).toHaveLength(7);
  expect(value.items).toHaveLength(5);
  expect(value.moves).toHaveLength(3);
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

test('@claim:free-core keeps all inventory tools available without a license', async ({ page }) => {
  await page.goto('/inventory');
  await expect(page.getByRole('button', { name: 'Add place' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Print labels' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
  await expect(page.getByText('Import JSON')).toBeVisible();
  await expect(page.getByText('Import CSV')).toBeVisible();
  await page.getByRole('button', { name: 'Add place' }).click();
  await page.locator('#place-dialog').getByLabel('Place name').fill('Free shelf');
  await page.getByRole('button', { name: 'Save place' }).click();
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.locator('#item-dialog').getByLabel('Item name').fill('Spare bulbs');
  await page.locator('#item-dialog').getByLabel('Starting place').selectOption({ label: 'Free shelf' });
  await page.locator('#item-dialog').getByLabel('Quantity').fill('3');
  await page.getByRole('button', { name: 'Save item' }).click();
  await expect(page.getByRole('heading', { name: 'Spare bulbs' })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await expect(await downloadPromise).toBeTruthy();
});

test('@claim:multi-location-move updates both places and history', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Search items and places').fill('batteries');
  await expect(page.getByText('8 at Home / Hall cupboard · 4 at Home / Garage / Red tool bin')).toBeVisible();
  await page.getByRole('button', { name: 'Move or add' }).click();
  await expect(page.getByLabel('From')).toHaveValue('hall');
  await page.getByLabel('To', { exact: true }).selectOption('red-bin');
  await page.getByLabel('Quantity').last().fill('2');
  await page.getByRole('textbox', { name: 'Note', exact: true }).fill('Restocked workbench');
  await page.getByRole('button', { name: 'Record move' }).click();
  await page.getByLabel('Search items and places').fill('batteries');
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

test('@claim:record-correction edits and archives records with destination, history, and undo', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/demo');
  await page.getByLabel('Search items and places').fill('batteries');
  await page.locator('[data-item="batteries"][data-action="edit-item"]').click();
  await page.getByLabel('Item name').last().fill('Rechargeable batteries');
  await page.getByLabel('Notes').last().fill('AA rechargeable set');
  await page.getByRole('button', { name: 'Save item' }).last().click();
  await expect(page.getByRole('heading', { name: 'Rechargeable batteries' })).toBeVisible();

  await page.locator('[data-place="hall"]').click();
  await page.getByLabel('Place name').last().fill('Entry cupboard');
  await page.getByRole('button', { name: 'Save place' }).last().click();
  await expect(page.getByRole('link', { name: /Entry cupboard/ })).toBeVisible();

  await page.locator('[data-place="hall"]').click();
  await page.getByLabel('Move items here before archiving').selectOption('red-bin');
  await page.getByRole('button', { name: 'Archive place' }).click();
  await expect(page.getByText('Archived Entry cupboard.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Entry cupboard/ })).toHaveCount(0);
  await expect(page.getByText(/Moved before archiving Entry cupboard/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Undo archive of Entry cupboard' }).click();
  await expect(page.getByRole('link', { name: /Entry cupboard/ })).toBeVisible();
  await expect(page.getByText(/For the smoke alarm/)).toBeVisible();
  await page.locator('[data-item="batteries"][data-action="edit-item"]').click();
  await page.getByRole('button', { name: 'Archive item' }).click();
  await expect(page.getByText('Archived Rechargeable batteries.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Rechargeable batteries' })).toHaveCount(0);
  await expect(page.locator('.move-list').getByText(/Archived Rechargeable batteries/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Undo archive of Rechargeable batteries' }).click();
  await expect(page.getByRole('heading', { name: 'Rechargeable batteries' })).toBeVisible();
  await expect(page.getByText(/For the smoke alarm/)).toBeVisible();
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

test('every application route has no serious accessibility findings', async ({ page }) => {
  for (const path of ['/', '/demo', '/inventory', '/privacy', '/terms', '/print?demo=1', '/offline.html', '/404.html']) {
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

test('mobile first screen includes the action result and all three facts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const text of ['Try it with sample data', 'Opens a stocked sample. Your inventory is unchanged.', 'Works offline after your first visit.', 'Inventory data stays on this device.', 'All inventory tools are free.']) {
    const target = page.getByText(text, { exact: true });
    await expect(target).toBeVisible();
    const box = await target.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
});

test('desktop first screen includes the first action, its result, and all facts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  for (const text of ['Try it with sample data', 'Opens a stocked sample. Your inventory is unchanged.', 'Works offline after your first visit.', 'Inventory data stays on this device.', 'All inventory tools are free.']) {
    const target = page.getByText(text, { exact: true });
    await expect(target).toBeVisible();
    const box = await target.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(900);
  }
});

test('all visible mobile controls meet the 44 pixel touch-target minimum', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/demo', '/privacy', '/terms', '/print?demo=1', '/offline.html', '/404.html']) {
    await page.goto(path);
    const controls = page.locator('a, button, input:not([type="file"]), select, textarea, label.button');
    for (let index = 0; index < await controls.count(); index += 1) {
      const control = controls.nth(index);
      if (!(await control.isVisible())) continue;
      const box = await control.boundingBox();
      expect(box, `${path}: ${await control.evaluate(element => element.outerHTML.slice(0, 180))}`).not.toBeNull();
      expect(box!.width, `${path}: control width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${path}: control height`).toBeGreaterThanOrEqual(44);
    }
  }
});

test('a keyboard user can create and reopen a real inventory', async ({ page }) => {
  await page.goto('/inventory');
  const addPlace = page.getByRole('button', { name: 'Add first place' });
  await addPlace.press('Enter');
  await page.locator('#place-dialog').getByLabel('Place name').fill('Flat');
  await page.getByRole('button', { name: 'Save place' }).press('Enter');
  await expect(page.getByText('Added Flat.')).toBeVisible();
  await page.getByRole('button', { name: 'Add first item' }).press('Enter');
  await page.locator('#item-dialog').getByLabel('Item name').fill('Spare keys');
  await page.locator('#item-dialog').getByLabel('Starting place').selectOption({ label: 'Flat' });
  await page.locator('#item-dialog').getByLabel('Quantity').fill('2');
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

test('SPA navigation focuses the new page heading and updates route metadata', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page.getByRole('heading', { name: 'Privacy in plain words' })).toBeFocused();
  await expect(page).toHaveTitle('Privacy — Placeboard Inventory');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://placeboard-inventory.sociobot.in/privacy');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /stores and protects/);
});
