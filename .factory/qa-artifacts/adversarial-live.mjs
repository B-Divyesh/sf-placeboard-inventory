import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = 'https://placeboard-inventory.sociobot.in';
const report = {
  checkedAt: new Date().toISOString(),
  origin,
  checks: {},
  requests: [],
  consoleErrors: [],
  pageErrors: [],
};

function check(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('request', request => report.requests.push({ method: request.method(), url: request.url(), type: request.resourceType() }));
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
  page.on('pageerror', error => report.pageErrors.push(String(error)));

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForURL('**/demo');
  await page.locator('.demo-banner').waitFor();
  check(new URL(page.url()).pathname === '/demo', 'The first-screen demo action did not reach /demo in one click.');
  check(await page.locator('.demo-banner').isVisible(), 'The persistent demo banner is missing.');
  check(await page.getByRole('heading', { name: 'AA batteries' }).isVisible(), 'Sample inventory is not immediately populated.');
  report.checks.oneClickDemo = { path: '/demo', banner: true, sampleVisible: true };

  const search = page.getByLabel('Search items and places');
  await search.fill('not a tracked thing');
  check((await page.locator('#item-results').innerText()).includes('No items match this search. Try an item or place name.'), 'Search has no useful empty state.');
  await search.fill('AA batteries');
  check(await page.getByRole('heading', { name: 'AA batteries' }).isVisible(), 'Search did not recover after a zero-result query.');

  await page.getByRole('button', { name: 'Move or add' }).click();
  await page.getByLabel('To', { exact: true }).selectOption('hall');
  await page.getByLabel('Quantity').last().fill('1');
  await page.getByRole('button', { name: 'Record move' }).click();
  check((await page.locator('#move-error').innerText()) === 'Choose two different places.', 'Same-place move did not show the expected recovery message.');
  await page.getByLabel('To', { exact: true }).selectOption('red-bin');
  await page.getByLabel('Quantity').last().fill('99');
  await page.getByRole('button', { name: 'Record move' }).click();
  check((await page.locator('#move-error').innerText()) === 'Only 8 available at the starting place.', 'Overdraw did not show the available quantity.');
  await page.getByLabel('Quantity').last().fill('8');
  await page.getByRole('textbox', { name: 'Note', exact: true }).fill('Moved all hall stock');
  await page.getByRole('button', { name: 'Record move' }).click();
  await page.getByText(/Moved 8 × AA batteries/).waitFor();
  check((await page.locator('body').innerText()).includes('12 at Home / Garage / Red tool bin'), 'A maximum valid move did not merge quantities.');
  check((await page.locator('body').innerText()).includes('Moved all hall stock'), 'Recovered move did not preserve its note in history.');
  await page.reload({ waitUntil: 'networkidle' });
  check((await page.locator('body').innerText()).includes('12 at Home / Garage / Red tool bin'), 'The recovered move did not persist after reload.');
  report.checks.searchAndMoves = { zeroResultRecovery: true, samePlaceRejected: true, overdrawRejected: true, boundaryQuantityEightAccepted: true, persisted: true };

  page.on('dialog', dialog => dialog.accept());
  await page.locator('#import-json').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{not-json') });
  await page.getByText('This JSON file could not be read. Choose an unedited Placeboard JSON export.', { exact: true }).waitFor();
  check((await page.getByRole('alert').innerText()).includes('could not be read'), 'Invalid JSON did not explain recovery.');
  await page.locator('#import-csv').setInputFiles({ name: 'broken.csv', mimeType: 'text/csv', buffer: Buffer.from('name,where,count\nTape,Garage,1') });
  await page.getByText('CSV columns must be item, place, quantity, notes.', { exact: true }).waitFor();
  check((await page.getByRole('alert').innerText()).includes('CSV columns must be item, place, quantity, notes.'), 'Invalid CSV did not identify required columns.');
  await page.locator('#import-csv').setInputFiles({ name: 'valid.csv', mimeType: 'text/csv', buffer: Buffer.from('item,place,quantity,notes\nGarden twine,Home / Shed / Top shelf,2,Green roll') });
  await page.getByRole('heading', { name: 'Garden twine' }).waitFor();
  check(await page.getByRole('heading', { name: 'Garden twine' }).isVisible(), 'A valid CSV did not recover after invalid imports.');
  check(await page.getByRole('link', { name: /Top shelf 2 items here/ }).isVisible(), 'Nested CSV place path was not built.');
  report.checks.importRecovery = { invalidJson: true, invalidCsv: true, validCsvAfterErrors: true, nestedPath: true };

  await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Add place', exact: true }).click();
  const placeInput = page.locator('#place-dialog').getByLabel('Place name');
  await placeInput.fill('');
  await page.getByRole('button', { name: 'Save place' }).click();
  const placeValidity = await placeInput.evaluate(input => ({ valueMissing: input.validity.valueMissing, message: input.validationMessage }));
  check(placeValidity.valueMissing && placeValidity.message.length > 0, 'Blank place input was accepted or had no browser error.');
  await placeInput.fill('Boundary shelf');
  await page.getByRole('button', { name: 'Save place' }).click();
  await page.getByRole('link', { name: 'Boundary shelf 0 items here' }).waitFor();
  check(await page.getByRole('link', { name: 'Boundary shelf 0 items here' }).isVisible(), 'Place form did not recover from blank input.');
  report.checks.placeValidation = { blankRejected: true, browserMessage: placeValidity.message, recoverySucceeded: true };

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const keyboard = await page.evaluate(() => {
    const active = document.activeElement;
    const style = active ? getComputedStyle(active) : null;
    return { text: active?.textContent?.trim(), outlineStyle: style?.outlineStyle, outlineWidth: style?.outlineWidth, outlineColor: style?.outlineColor };
  });
  check(keyboard.text === 'Skip to content', 'The skip link is not first in keyboard order.');
  check(keyboard.outlineStyle !== 'none' && keyboard.outlineWidth !== '0px', 'Focused skip link has no visible focus outline.');
  await page.keyboard.press('Enter');
  check(new URL(page.url()).hash === '#main', 'The skip link did not target main content.');
  await page.goto(`${origin}/inventory`, { waitUntil: 'networkidle' });
  const opener = page.getByRole('button', { name: 'Add first place' });
  await opener.focus();
  await page.keyboard.press('Enter');
  check(await page.locator('#place-dialog').evaluate(dialog => dialog.open), 'Keyboard Enter did not open the dialog.');
  await page.keyboard.press('Escape');
  check(!(await page.locator('#place-dialog').evaluate(dialog => dialog.open)), 'Escape did not close the dialog.');
  check(await opener.evaluate(element => element === document.activeElement), 'Dialog close did not return focus to its opener.');
  report.checks.keyboard = { skipFirst: true, focus: keyboard, enterOpensDialog: true, escapeClosesDialog: true, focusReturned: true };

  const crossOrigin = report.requests.filter(request => new URL(request.url).origin !== origin);
  check(crossOrigin.length === 0, `Unexpected cross-origin requests: ${crossOrigin.map(request => request.url).join(', ')}`);
  check(report.consoleErrors.length === 0 && report.pageErrors.length === 0, 'Browser errors occurred during the adversarial journey.');
  report.checks.privacy = { crossOriginRequests: crossOrigin, totalRequests: report.requests.length };
  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const mobilePage = await mobile.newPage();
  const mobileErrors = [];
  mobilePage.on('pageerror', error => mobileErrors.push(String(error)));
  mobilePage.on('console', message => { if (message.type() === 'error') mobileErrors.push(message.text()); });
  await mobilePage.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: '.factory/qa-artifacts/adversarial-mobile-demo.png', fullPage: true });
  const mobileState = await mobilePage.evaluate(() => {
    const controls = [...document.querySelectorAll('a,button,input:not([type=file]),select,textarea,label.button')].filter(element => {
      const style = getComputedStyle(element); const box = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width && box.height;
    }).map(element => { const box = element.getBoundingClientRect(); return { label: element.textContent?.trim() || element.getAttribute('aria-label') || element.tagName, width: box.width, height: box.height }; });
    const animated = document.querySelector('.button');
    const style = animated ? getComputedStyle(animated) : null;
    return {
      viewportWidth: innerWidth,
      scrollWidth: document.body.scrollWidth,
      viewportMeta: document.querySelector('meta[name=viewport]')?.getAttribute('content'),
      undersized: controls.filter(control => control.width < 44 || control.height < 44),
      transitionDuration: style?.transitionDuration,
      animationDuration: style?.animationDuration,
    };
  });
  check(mobileState.scrollWidth === 390, 'The mobile demo overflows horizontally.');
  check(!mobileState.viewportMeta?.includes('user-scalable=no'), 'Page zoom is disabled.');
  check(mobileState.undersized.length === 0, `Undersized touch controls: ${JSON.stringify(mobileState.undersized)}`);
  check(Number.parseFloat(mobileState.transitionDuration ?? '1') <= 0.00001, 'Reduced motion did not reduce transition duration.');
  check(mobileErrors.length === 0, `Mobile console/page errors: ${mobileErrors.join('; ')}`);
  report.checks.mobile = mobileState;

  await mobilePage.evaluate(() => navigator.serviceWorker.ready);
  await mobilePage.reload({ waitUntil: 'networkidle' });
  const workerBefore = await mobilePage.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return { controlled: Boolean(navigator.serviceWorker.controller), active: registration.active?.scriptURL, waiting: Boolean(registration.waiting), caches: await caches.keys() };
  });
  check(workerBefore.controlled, 'The service worker did not control the reloaded page.');
  check(workerBefore.active?.endsWith('/sw.js'), 'The active worker is not /sw.js.');
  check(workerBefore.caches.includes('placeboard-v1.1.1'), 'The current versioned cache is missing.');
  await mobile.setOffline(true);
  await mobilePage.reload({ waitUntil: 'domcontentloaded' });
  check(await mobilePage.getByRole('heading', { name: 'AA batteries' }).isVisible(), 'Sample data was unavailable after offline reload.');
  check(await mobilePage.getByText('Offline · changes still save here').isVisible(), 'Offline state is not visible.');
  report.checks.pwa = { ...workerBefore, offlineReload: true, sampleVisibleOffline: true, offlineStatusVisible: true };
  await mobile.setOffline(false);
  await mobile.close();

  report.result = 'pass';
} catch (error) {
  report.result = 'fail';
  report.error = error instanceof Error ? error.stack : String(error);
  throw error;
} finally {
  await writeFile('.factory/qa-artifacts/adversarial-live.json', `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
