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
  await page.getByLabel('To').selectOption({ label: 'Home / Garage / Red tool bin' });
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
  await page.getByLabel('To').selectOption('red-bin');
  await page.getByLabel('Quantity').last().fill('2');
  await page.getByRole('textbox', { name: 'Note', exact: true }).fill('Restocked workbench');
  await page.getByRole('button', { name: 'Record move' }).click();
  await page.getByLabel('Search items and places').fill('AA batteries');
  await expect(page.getByText('6 at Home / Hall cupboard · 6 at Home / Garage / Red tool bin')).toBeVisible();
  await expect(page.getByText(/2 × AA batteries/).first()).toBeVisible();
  await expect(page.getByText(/Restocked workbench/)).toBeVisible();
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
