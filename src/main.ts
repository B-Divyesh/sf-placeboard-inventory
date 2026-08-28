import './style.css';
import { addItem, addPlace, archiveItem, archivePlace, discardDemo, editItem, editPlace, fromCsv, loadData, moveStock, placePath, resetDemo, saveData, toCsv, validateImport } from './data';
import type { InventoryData, Place } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
let data: InventoryData | null = null;
let demoMode = false;
let searchQuery = '';
let notice = '';
let noticeError = false;
let updateAvailable = false;
let undoData: InventoryData | null = null;
let undoMessage = '';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);

async function navigate(path: string): Promise<void> {
  if (demoMode && !path.startsWith('/demo') && !path.includes('demo=1')) await discardDemo();
  history.pushState({ focusHeading: true }, '', path);
  await renderRoute();
}

function routeTitle(path: string): string {
  if (path === '/') return 'Placeboard Inventory — Find household items by place';
  if (path === '/demo') return 'Demo — Placeboard Inventory';
  if (path === '/inventory') return 'Inventory — Placeboard Inventory';
  if (path === '/privacy') return 'Privacy — Placeboard Inventory';
  if (path === '/terms') return 'Terms — Placeboard Inventory';
  if (path === '/print') return 'Print labels — Placeboard Inventory';
  return 'Not found — Placeboard Inventory';
}

function routeDescription(path: string): string {
  if (path === '/demo') return 'Try a stocked sample household without changing your inventory.';
  if (path === '/inventory') return 'Track household items by room, shelf, or bin and record every move.';
  if (path === '/privacy') return 'How Placeboard Inventory stores and protects inventory data in your browser.';
  if (path === '/terms') return 'Terms for using Placeboard Inventory as a local household inventory.';
  if (path === '/print') return 'Print labels for every inventory place or one chosen place.';
  if (path === '/') return 'Find shared household items by room, shelf, or bin and record every move.';
  return 'This Placeboard Inventory page does not exist.';
}

function header(path: string): string {
  const current = (href: string) => path === href ? ' aria-current="page"' : '';
  return `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="shell nav-wrap">
        <a class="wordmark" href="/" data-link aria-label="Placeboard Inventory home"><span class="mark" aria-hidden="true"></span><span>Placeboard Inventory</span></a>
        <nav class="site-nav" aria-label="Main navigation">
          <a href="/inventory" data-link${current('/inventory')}>Inventory</a>
          <a href="/demo" data-link${current('/demo')}>Demo</a>
          <a href="/privacy" data-link${current('/privacy')}>Privacy</a>
        </nav>
      </div>
    </header>`;
}

function footer(): string {
  return `<footer class="site-footer"><div class="shell footer-grid"><div>Find shared household items by place.<br><small>Original generated imagery · v1.1.0 · polish-1</small></div><div class="footer-links"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in">Built by Param Factory <span class="sr-only">(external site)</span></a></div></div></footer>`;
}

function layout(path: string, content: string, demoBanner = false): void {
  document.title = routeTitle(path);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://placeboard-inventory.sociobot.in${path === '/' ? '/' : path}`);
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', routeDescription(path));
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', routeTitle(path));
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', routeDescription(path));
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', routeTitle(path));
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', routeDescription(path));
  app.innerHTML = `${header(path)}${demoBanner ? `<div class="demo-banner" role="status">Demo — sample data, nothing is saved to your inventory <button type="button" data-action="reset-demo">Reset demo</button><button type="button" data-action="start-real">Start for real</button></div>` : ''}${notice ? `<div class="shell notice${noticeError ? ' error' : ''}${notice.startsWith('Moved ') ? ' move-ticket' : ''}" ${noticeError ? 'role="alert"' : 'role="status"'}>${escapeHtml(notice)}${undoData ? ` <button class="undo-button" type="button" data-action="undo">Undo ${escapeHtml(undoMessage)}</button>` : ''}</div>` : ''}${content}${footer()}${updateAvailable ? '<div class="update-status" role="status">A new version is ready. <button type="button" data-action="reload">Reload Placeboard</button></div>' : ''}<div class="route-live" aria-live="polite" id="route-live"></div>`;
  bindCommon();
}

function landing(): string {
  return `<main id="main">
    <section class="hero shell">
      <div class="hero-copy">
        <p class="eyebrow">Household inventory organized by place</p>
        <h1 tabindex="-1">Find household items by where you stored them</h1>
        <p class="hero-lede">For households that share cupboards, bins, sheds, or homes and need one clear place to look.</p>
        <div class="action-row">
          <div class="primary-step"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span>Opens a stocked sample. Your inventory is unchanged.</span></div>
          <a class="button secondary" href="/inventory" data-link>Start my inventory</a>
        </div>
        <ul class="fact-list">
          <li>Works offline after your first visit.</li>
          <li>Inventory data stays on this device.</li>
          <li>All inventory tools are free.</li>
        </ul>
      </div>
      <figure class="hero-art">
        <img src="/assets/placeboard-market.webp" srcset="/assets/placeboard-market-720.webp 720w, /assets/placeboard-market.webp 1200w" sizes="(max-width: 760px) 88vw, 55vw" width="1200" height="800" alt="Household shelves linked by cyan, amber, and pink lights" fetchpriority="high" decoding="async">
      </figure>
    </section>

    <section class="section" aria-labelledby="preview-title"><div class="shell">
      <div class="section-head"><h2 id="preview-title">See every place</h2><p>One item can sit in several places. Search shows every quantity and its full path.</p></div>
      <div class="preview-board" aria-label="Example inventory search">
        <div class="preview-search">Search: AA batteries</div>
        <div><div class="mini-place">Home / Hall cupboard</div><div class="mini-place">Home / Garage / Red tool bin</div></div>
        <div><div class="mini-result"><b>8</b> AA batteries<br><small>Home / Hall cupboard</small></div><div class="mini-result"><b>4</b> AA batteries<br><small>Home / Garage / Red tool bin</small></div></div>
      </div>
    </div></section>

    <section class="section" aria-labelledby="how-title"><div class="shell">
      <div class="section-head"><h2 id="how-title">How to track an item</h2><p>Build the same simple map you use when you tell someone where to look.</p></div>
      <div class="steps">
        <article class="step"><h3>Name your places</h3><p>Add a home, room, shelf, or bin. Nest bins and shelves inside rooms.</p></article>
        <article class="step"><h3>Put items there</h3><p>Add a quantity to one place. Add the same item to another place later.</p></article>
        <article class="step"><h3>Record each move</h3><p>Choose the old place and new place. Placeboard updates both counts and keeps the history.</p></article>
      </div>
    </div></section>

    <section class="section" aria-labelledby="limits-title"><div class="shell">
      <div class="section-head"><h2 id="limits-title">Made for finding, not valuing</h2><p>This household inventory stays in this browser. It does not value items or run a warehouse.</p></div>
      <div class="boundary"><div><h3>Keep and export your inventory</h3><p>Your inventory uses browser storage. Export JSON or CSV whenever you want a backup.</p></div><div><h3>What Placeboard does not do</h3><p>There is no cloud sync, product database, insurance valuation, or photo upload.</p></div></div>
    </div></section>
  </main>`;
}

function privacyPage(): string {
  return `<main id="main" class="shell prose"><p class="eyebrow">Legal · updated 28 August 2026</p><h1 tabindex="-1">Privacy in plain words</h1><p>Placeboard stores your places, items, quantities, and move history in this browser.</p><h2>What leaves your device</h2><p>Nothing leaves during inventory use. Export files go only where you choose to save them.</p><h2>Demo data</h2><p>The demo uses a separate browser database. Resetting or leaving the demo discards its changes.</p><h2>Your control</h2><p>Use Export JSON before clearing browser data. Clearing site data removes the inventory from this device.</p><h2>Contact</h2><p>Questions can go to <a class="legal-contact" href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></main>`;
}

function termsPage(): string {
  return `<main id="main" class="shell prose"><p class="eyebrow">Legal · updated 28 August 2026</p><h1 tabindex="-1">Terms for local inventory</h1><p>Use Placeboard to track household items by physical place. The app is provided as-is.</p><h2>Not an insurance record</h2><p>Placeboard does not assess value, prove ownership, or replace an insurance inventory.</p><h2>Your backups</h2><p>You control your local data. Export it before clearing browser storage or changing devices.</p><h2>Acceptable use</h2><p>Do not use the app to break the law or interfere with the service.</p><h2>Contact</h2><p>Questions can go to <a class="legal-contact" href="mailto:support@sociobot.in">support@sociobot.in</a>.</p></main>`;
}

function notFoundPage(): string {
  return `<main id="main" class="shell prose"><p class="eyebrow">Place 404</p><h1 tabindex="-1">This shelf does not exist</h1><p>The page was moved or never existed.</p><a class="button primary" href="/" data-link>Return home</a></main>`;
}

function placeOptions(places: Place[], includeOutside = false, excludeId = ''): string {
  const options = places.filter(place => !place.archivedAt && place.id !== excludeId).sort((a, b) => placePath(a.id, places).localeCompare(placePath(b.id, places))).map(place => `<option value="${escapeHtml(place.id)}">${escapeHtml(placePath(place.id, places))}</option>`).join('');
  return `${includeOutside ? '<option value="">Outside inventory</option>' : '<option value="">Choose a place</option>'}${options}`;
}

function renderPlaceBranch(parentId: string | null, source: InventoryData): string {
  const children = source.places.filter(place => !place.archivedAt && place.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
  if (!children.length) return '';
  return `<ul${parentId === null ? ' class="place-tree"' : ''}>${children.map(place => {
    const count = source.stocks.filter(stock => stock.placeId === place.id).reduce((sum, stock) => sum + stock.quantity, 0);
    const printUrl = `/print?place=${encodeURIComponent(place.id)}${demoMode ? '&demo=1' : ''}`;
    return `<li><div class="place-row"><a href="#items" data-filter-place="${escapeHtml(place.id)}">${escapeHtml(place.name)}<small>${count} ${count === 1 ? 'item' : 'items'} here</small></a><div class="place-actions"><a class="label-link" href="${printUrl}" data-link>Label</a><button class="text-button" type="button" data-action="edit-place" data-place="${escapeHtml(place.id)}">Edit</button></div></div>${renderPlaceBranch(place.id, source)}</li>`;
  }).join('')}</ul>`;
}

function filteredItems(source: InventoryData): typeof source.items {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return source.items.filter(item => !item.archivedAt).sort((a, b) => a.name.localeCompare(b.name));
  return source.items.filter(item => !item.archivedAt).filter(item => {
    const locations = source.stocks.filter(stock => stock.itemId === item.id).map(stock => placePath(stock.placeId, source.places)).join(' ');
    return `${item.name} ${item.notes} ${locations}`.toLowerCase().includes(query);
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function itemsHtml(source: InventoryData): string {
  const items = filteredItems(source);
  if (!items.length) return `<div class="empty"><p>${searchQuery ? 'No items match this search. Try an item or place name.' : 'Items will appear here after you add your first item.'}</p>${searchQuery ? '' : '<button class="primary" type="button" data-action="open-item">Add first item</button>'}</div>`;
  return `<ul class="item-list">${items.map(item => {
    const stocks = source.stocks.filter(stock => stock.itemId === item.id);
    const total = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    const lines = stocks.map(stock => `${stock.quantity} at ${placePath(stock.placeId, source.places)}`).join(' · ');
    return `<li class="item-card"><div><h3>${escapeHtml(item.name)}</h3>${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ''}<p class="location-line">${escapeHtml(lines || 'No place recorded')}</p></div><div class="item-actions"><span class="quantity">${total} total</span><button class="text-button" type="button" data-action="move-item" data-item="${escapeHtml(item.id)}">Move or add</button><button class="text-button" type="button" data-action="edit-item" data-item="${escapeHtml(item.id)}">Edit</button></div></li>`;
  }).join('')}</ul>`;
}

function movesHtml(source: InventoryData): string {
  if (!source.moves.length) return '<div class="empty"><p>Moves will appear here after an item changes place.</p></div>';
  return `<ol class="move-list">${source.moves.slice(0, 10).map(move => {
    const item = source.items.find(value => value.id === move.itemId)?.name ?? 'Deleted item';
    const from = move.fromPlaceId ? placePath(move.fromPlaceId, source.places) : 'Outside inventory';
    const to = move.toPlaceId ? placePath(move.toPlaceId, source.places) : 'Outside inventory';
    return `<li><p><b>${move.quantity} × ${escapeHtml(item)}</b> · ${escapeHtml(from)} → ${escapeHtml(to)}</p><small>${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(move.at))}${move.note ? ` · ${escapeHtml(move.note)}` : ''}</small></li>`;
  }).join('')}</ol>`;
}

function inventoryPage(source: InventoryData): string {
  const activePlaces = source.places.filter(place => !place.archivedAt);
  const activeItems = source.items.filter(item => !item.archivedAt);
  return `<main id="main" class="shell workspace">
    <div class="workspace-head"><div><p class="eyebrow">${demoMode ? 'Sample household' : 'Your household'}</p><h1 tabindex="-1">Find an item in your home</h1></div><div class="toolbar"><button class="primary" type="button" data-action="open-item">Add item</button><button class="secondary" type="button" data-action="open-place">Add place</button><a class="button secondary" href="/print${demoMode ? '?demo=1' : ''}" data-link>Print labels</a></div></div>
    <div class="search-wrap"><label for="search">Search items and places</label><input id="search" type="search" value="${escapeHtml(searchQuery)}" autocomplete="off" placeholder="Try batteries or hall cupboard"><p id="result-count" class="next-note">${filteredItems(source).length} ${filteredItems(source).length === 1 ? 'item' : 'items'} shown</p></div>
    <div class="work-grid">
      <section class="panel" aria-labelledby="places-title"><div class="panel-head"><h2 id="places-title">Places</h2><span class="count">${activePlaces.length}</span></div>${activePlaces.length ? renderPlaceBranch(null, source) : '<div class="empty"><p>Your rooms, shelves, and bins will appear here.</p><button class="primary" type="button" data-action="open-place">Add first place</button></div>'}</section>
      <section class="panel" id="items" aria-labelledby="items-title"><div class="panel-head"><h2 id="items-title">Items</h2><span class="count">${activeItems.length}</span></div><div id="item-results">${itemsHtml(source)}</div></section>
    </div>
    <section class="panel data-panel" aria-labelledby="moves-title"><div class="panel-head"><h2 id="moves-title">Recent moves</h2><span class="count">${source.moves.length}</span></div>${movesHtml(source)}</section>
    <section class="panel data-panel" aria-labelledby="data-title"><div class="panel-head"><h2 id="data-title">Back up or transfer data</h2></div><p>JSON keeps the full move history. CSV keeps current item quantities and place paths.</p><div class="data-actions"><button class="secondary" type="button" data-action="export-json">Export JSON</button><button class="secondary" type="button" data-action="export-csv">Export CSV</button><label class="button secondary file-button">Import JSON<input type="file" id="import-json" accept="application/json,.json"></label><label class="button secondary file-button">Import CSV<input type="file" id="import-csv" accept="text/csv,.csv"></label></div></section>
    ${dialogs(source)}
  </main>`;
}

function dialogs(source: InventoryData): string {
  return `<dialog id="place-dialog"><form class="dialog-inner" id="place-form"><div class="dialog-head"><h2>Add a place</h2><button class="close-dialog" type="button" aria-label="Close" data-action="close-dialog">×</button></div><div class="field"><label for="place-name">Place name</label><input id="place-name" name="name" required maxlength="60" placeholder="Hall cupboard"></div><div class="field"><label for="place-parent">Inside another place</label><select id="place-parent" name="parentId">${placeOptions(source.places)}</select><small>Leave blank for a home or other top-level place.</small></div><p class="field-error" id="place-error" role="alert"></p><div class="dialog-actions"><button class="secondary" type="button" data-action="close-dialog">Cancel</button><button class="primary" type="submit">Save place</button></div></form></dialog>
  <dialog id="item-dialog"><form class="dialog-inner" id="item-form"><div class="dialog-head"><h2>Add an item</h2><button class="close-dialog" type="button" aria-label="Close" data-action="close-dialog">×</button></div><div class="field"><label for="item-name">Item name</label><input id="item-name" name="name" required maxlength="80" placeholder="AA batteries"></div><div class="field"><label for="item-notes">Notes</label><textarea id="item-notes" name="notes" maxlength="240" placeholder="Size, colour, or what it fits"></textarea></div><div class="field"><label for="item-place">Starting place</label><select id="item-place" name="placeId" required>${placeOptions(source.places)}</select></div><div class="field"><label for="item-quantity">Quantity</label><input id="item-quantity" name="quantity" type="number" inputmode="numeric" min="1" step="1" value="1" required></div><p class="field-error" id="item-error" role="alert"></p><div class="dialog-actions"><button class="secondary" type="button" data-action="close-dialog">Cancel</button><button class="primary" type="submit">Save item</button></div></form></dialog>
  <dialog id="move-dialog"><form class="dialog-inner" id="move-form"><div class="dialog-head"><h2>Move or add items</h2><button class="close-dialog" type="button" aria-label="Close" data-action="close-dialog">×</button></div><input type="hidden" name="itemId" id="move-item"><div class="field"><label for="move-from">From</label><select id="move-from" name="fromPlaceId">${placeOptions(source.places, true)}</select></div><div class="field"><label for="move-to">To</label><select id="move-to" name="toPlaceId">${placeOptions(source.places, true)}</select></div><div class="field"><label for="move-quantity">Quantity</label><input id="move-quantity" name="quantity" type="number" inputmode="numeric" min="1" step="1" value="1" required></div><div class="field"><label for="move-note">Note</label><input id="move-note" name="note" maxlength="120" placeholder="Why it moved"></div><p class="field-error" id="move-error" role="alert"></p><div class="dialog-actions"><button class="secondary" type="button" data-action="close-dialog">Cancel</button><button class="primary" type="submit">Record move</button></div></form></dialog>
  <dialog id="edit-item-dialog"><form class="dialog-inner" id="edit-item-form"><div class="dialog-head"><h2>Edit item</h2><button class="close-dialog" type="button" aria-label="Close" data-action="close-dialog">×</button></div><input type="hidden" name="itemId" id="edit-item-id"><div class="field"><label for="edit-item-name">Item name</label><input id="edit-item-name" name="name" required maxlength="80"></div><div class="field"><label for="edit-item-notes">Notes</label><textarea id="edit-item-notes" name="notes" maxlength="240"></textarea></div><p class="field-error" id="edit-item-error" role="alert"></p><div class="dialog-actions split-actions"><button class="danger" type="button" data-action="archive-item">Archive item</button><span></span><button class="secondary" type="button" data-action="close-dialog">Cancel</button><button class="primary" type="submit">Save item</button></div></form></dialog>
  <dialog id="edit-place-dialog"><form class="dialog-inner" id="edit-place-form"><div class="dialog-head"><h2>Edit place</h2><button class="close-dialog" type="button" aria-label="Close" data-action="close-dialog">×</button></div><input type="hidden" name="placeId" id="edit-place-id"><div class="field"><label for="edit-place-name">Place name</label><input id="edit-place-name" name="name" required maxlength="60"></div><div class="field"><label for="edit-place-parent">Inside another place</label><select id="edit-place-parent" name="parentId"></select></div><div class="field archive-destination"><label for="archive-place-destination">Move items here before archiving</label><select id="archive-place-destination"><option value="">Choose a destination if this place has items</option></select><small>Places containing another place must be emptied from the inside first.</small></div><p class="field-error" id="edit-place-error" role="alert"></p><div class="dialog-actions split-actions"><button class="danger" type="button" data-action="archive-place">Archive place</button><span></span><button class="secondary" type="button" data-action="close-dialog">Cancel</button><button class="primary" type="submit">Save place</button></div></form></dialog>`;
}

function printPage(source: InventoryData): string {
  const id = new URL(location.href).searchParams.get('place');
  const places = (id ? source.places.filter(place => place.id === id) : source.places).filter(place => !place.archivedAt);
  return `<main id="main" class="shell print-page"><p class="eyebrow">Paper signs</p><h1 tabindex="-1">Print labels for your places</h1><p>Use your browser’s print settings. Cut each label on its border.</p><div class="print-actions"><div class="action-row"><button class="primary" type="button" data-action="print">Print labels</button><a class="button secondary" href="${demoMode ? '/demo' : '/inventory'}" data-link>Back to inventory</a></div></div><div class="labels">${places.map(place => `<article class="print-label"><div><p>PLACEBOARD INVENTORY</p><h2>${escapeHtml(place.name)}</h2><p>${escapeHtml(placePath(place.id, source.places))}</p></div><span class="label-code">${escapeHtml(place.id.slice(-12).toUpperCase())}</span></article>`).join('') || '<p>No matching place was found.</p>'}</div></main>`;
}

function bindCommon(): void {
  app.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || link.target) return;
    const url = new URL(link.href); if (url.origin !== location.origin) return;
    event.preventDefault(); navigate(`${url.pathname}${url.search}`);
  }));
  app.querySelectorAll<HTMLElement>('[data-action]').forEach(element => element.addEventListener('click', () => void handleAction(element.dataset.action!, element.dataset.item ?? element.dataset.place)));
}

async function handleAction(action: string, itemId?: string): Promise<void> {
  if (action === 'reset-demo') { data = await resetDemo(); notice = 'Sample data was reset.'; await renderRoute(); }
  if (action === 'start-real') { await discardDemo(); demoMode = false; notice = ''; noticeError = false; await navigate('/inventory'); }
  if (action === 'open-place') (document.querySelector('#place-dialog') as HTMLDialogElement)?.showModal();
  if (action === 'open-item') {
    if (!data?.places.length) { notice = 'Add a place before you add an item.'; noticeError = true; await renderRoute(); return; }
    (document.querySelector('#item-dialog') as HTMLDialogElement)?.showModal();
  }
  if (action === 'move-item') {
    const input = document.querySelector<HTMLInputElement>('#move-item'); if (input) input.value = itemId ?? '';
    const source = data?.stocks.find(stock => stock.itemId === itemId)?.placeId ?? '';
    const select = document.querySelector<HTMLSelectElement>('#move-from'); if (select) select.value = source;
    (document.querySelector('#move-dialog') as HTMLDialogElement)?.showModal();
  }
  if (action === 'edit-item' && itemId && data) {
    const item = data.items.find(candidate => candidate.id === itemId); if (!item) return;
    (document.querySelector<HTMLInputElement>('#edit-item-id')!).value = item.id;
    (document.querySelector<HTMLInputElement>('#edit-item-name')!).value = item.name;
    (document.querySelector<HTMLTextAreaElement>('#edit-item-notes')!).value = item.notes;
    (document.querySelector<HTMLDialogElement>('#edit-item-dialog'))?.showModal();
  }
  if (action === 'edit-place' && itemId && data) {
    const place = data.places.find(candidate => candidate.id === itemId); if (!place) return;
    (document.querySelector<HTMLInputElement>('#edit-place-id')!).value = place.id;
    (document.querySelector<HTMLInputElement>('#edit-place-name')!).value = place.name;
    const options = placeOptions(data.places, false, place.id);
    const parent = document.querySelector<HTMLSelectElement>('#edit-place-parent')!; parent.innerHTML = options; parent.value = place.parentId ?? '';
    const destination = document.querySelector<HTMLSelectElement>('#archive-place-destination')!; destination.innerHTML = `<option value="">Choose a destination if this place has items</option>${options}`;
    (document.querySelector<HTMLDialogElement>('#edit-place-dialog'))?.showModal();
  }
  if (action === 'archive-item' && data) {
    const id = (document.querySelector<HTMLInputElement>('#edit-item-id'))?.value ?? '';
    const item = data.items.find(candidate => candidate.id === id); if (!item || !confirm(`Archive ${item.name}? Its move history will stay in your backup.`)) return;
    undoData = structuredClone(data); undoMessage = `archive of ${item.name}`; data = archiveItem(data, id); await persist(`Archived ${item.name}.`);
  }
  if (action === 'archive-place' && data) {
    const id = (document.querySelector<HTMLInputElement>('#edit-place-id'))?.value ?? '';
    const destination = (document.querySelector<HTMLSelectElement>('#archive-place-destination'))?.value || null;
    const place = data.places.find(candidate => candidate.id === id); if (!place || !confirm(`Archive ${place.name}? Its move history will stay in your backup.`)) return;
    try { undoData = structuredClone(data); undoMessage = `archive of ${place.name}`; data = archivePlace(data, id, destination); await persist(`Archived ${place.name}.`); }
    catch (error) { undoData = null; document.querySelector('#edit-place-error')!.textContent = error instanceof Error ? error.message : 'This place could not be archived.'; }
  }
  if (action === 'undo' && undoData) {
    data = undoData; undoData = null; const restored = undoMessage; undoMessage = ''; await persist(`Undid ${restored}.`);
  }
  if (action === 'close-dialog') (document.activeElement?.closest('dialog') as HTMLDialogElement | null)?.close();
  if (action === 'export-json' && data) download(`placeboard-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
  if (action === 'export-csv' && data) download(`placeboard-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(data), 'text/csv');
  if (action === 'print') window.print();
  if (action === 'reload') location.reload();
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
}

function bindInventory(): void {
  const search = document.querySelector<HTMLInputElement>('#search');
  search?.addEventListener('input', () => {
    searchQuery = search.value; const results = document.querySelector('#item-results'); if (results && data) results.innerHTML = itemsHtml(data);
    const count = filteredItems(data!).length; document.querySelector('#result-count')!.textContent = `${count} ${count === 1 ? 'item' : 'items'} shown`;
    results?.querySelectorAll<HTMLElement>('[data-action]').forEach(button => button.addEventListener('click', () => void handleAction(button.dataset.action!, button.dataset.item)));
  });
  document.querySelectorAll<HTMLElement>('[data-filter-place]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); searchQuery = placePath(link.dataset.filterPlace!, data!.places); if (search) { search.value = searchQuery; search.dispatchEvent(new Event('input')); search.focus(); }
  }));
  document.querySelector<HTMLFormElement>('#place-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const name = String(form.get('name') ?? '').trim();
    if (!name) { document.querySelector('#place-error')!.textContent = 'Enter a name for this place.'; return; }
    data = addPlace(data!, name, String(form.get('parentId') ?? '') || null); await persist(`Added ${name}.`);
  });
  document.querySelector<HTMLFormElement>('#item-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const name = String(form.get('name') ?? '').trim(); const placeId = String(form.get('placeId') ?? ''); const quantity = Number(form.get('quantity'));
    if (!name || !placeId || !Number.isInteger(quantity) || quantity < 1) { document.querySelector('#item-error')!.textContent = 'Enter a name, place, and whole quantity of at least 1.'; return; }
    data = addItem(data!, name, String(form.get('notes') ?? ''), placeId, quantity); await persist(`Added ${quantity} × ${name} to ${placePath(placeId, data.places)}.`);
  });
  document.querySelector<HTMLFormElement>('#move-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const itemId = String(form.get('itemId')); const from = String(form.get('fromPlaceId') ?? '') || null; const to = String(form.get('toPlaceId') ?? '') || null; const quantity = Number(form.get('quantity'));
    try {
      data = moveStock(data!, itemId, from, to, quantity, String(form.get('note') ?? ''));
      const name = data.items.find(item => item.id === itemId)?.name ?? 'item';
      const source = from ? placePath(from, data.places) : 'outside inventory';
      const destination = to ? placePath(to, data.places) : 'outside inventory';
      await persist(`Moved ${quantity} × ${name} from ${source} to ${destination}.`);
    }
    catch (error) { document.querySelector('#move-error')!.textContent = error instanceof Error ? error.message : 'The move could not be recorded.'; }
  });
  document.querySelector<HTMLFormElement>('#edit-item-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement);
    try { data = editItem(data!, String(form.get('itemId')), String(form.get('name') ?? ''), String(form.get('notes') ?? '')); await persist(`Updated ${String(form.get('name')).trim()}.`); }
    catch (error) { document.querySelector('#edit-item-error')!.textContent = error instanceof Error ? error.message : 'This item could not be updated.'; }
  });
  document.querySelector<HTMLFormElement>('#edit-place-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement);
    try { data = editPlace(data!, String(form.get('placeId')), String(form.get('name') ?? ''), String(form.get('parentId') ?? '') || null); await persist(`Updated ${String(form.get('name')).trim()}.`); }
    catch (error) { document.querySelector('#edit-place-error')!.textContent = error instanceof Error ? error.message : 'This place could not be updated.'; }
  });
  bindImport('import-json', async text => validateImport(JSON.parse(text)));
  bindImport('import-csv', async text => fromCsv(text));
}

function bindImport(id: string, parse: (text: string) => Promise<InventoryData>): void {
  document.querySelector<HTMLInputElement>(`#${id}`)?.addEventListener('change', async event => {
    const input = event.currentTarget as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    try {
      const imported = await parse(await file.text());
      if (!confirm(`Replace this inventory with ${imported.items.length} items and ${imported.places.length} places?`)) return;
      data = imported; await persist(`Imported ${imported.items.length} items and ${imported.places.length} places.`);
    } catch (error) { notice = error instanceof SyntaxError ? 'This JSON file could not be read. Choose an unedited Placeboard JSON export.' : error instanceof Error ? error.message : 'The file could not be imported. Choose a Placeboard export and try again.'; noticeError = true; await renderRoute(); }
  });
}

async function persist(message: string): Promise<void> {
  try { await saveData(demoMode, data!); notice = message; noticeError = false; await renderRoute(); }
  catch { notice = 'Your change could not be saved. Check browser storage and try again.'; noticeError = true; await renderRoute(); }
}

async function renderRoute(): Promise<void> {
  let path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/' && new URL(location.href).searchParams.get('demo') === '1') { history.replaceState(history.state, '', '/demo'); path = '/demo'; }
  demoMode = path === '/demo' || (path === '/print' && new URL(location.href).searchParams.get('demo') === '1');
  notice = notice || '';
  if (path === '/') layout(path, landing());
  else if (path === '/privacy') layout(path, privacyPage());
  else if (path === '/terms') layout(path, termsPage());
  else if (path === '/inventory' || path === '/demo') {
    try { data = await loadData(demoMode); layout(path, inventoryPage(data), demoMode); bindInventory(); }
    catch { layout(path, `<main id="main" class="shell prose"><p class="eyebrow">Storage error</p><h1 tabindex="-1">Your inventory could not open</h1><p>Browser storage is blocked or unavailable. Allow site storage, then reload this page.</p><button class="primary" type="button" data-action="reload">Reload inventory</button></main>`, demoMode); }
  } else if (path === '/print') {
    try { data = await loadData(demoMode); layout(path, printPage(data), demoMode); }
    catch { layout(path, notFoundPage()); }
  } else layout(path, notFoundPage());
  const heading = document.querySelector<HTMLHeadingElement>('h1');
  if (heading) { document.querySelector('#route-live')!.textContent = heading.textContent; if (history.state?.focusHeading) heading.focus(); }
  history.replaceState({ ...history.state, focusHeading: true }, '');
}

window.addEventListener('popstate', () => void renderRoute());
const showOffline = () => { if (!document.querySelector('.offline-status')) document.body.insertAdjacentHTML('beforeend', '<div class="offline-status" role="status">Offline · changes still save here</div>'); };
window.addEventListener('online', () => { document.querySelector('.offline-status')?.remove(); });
window.addEventListener('offline', showOffline);
if (!navigator.onLine) showOffline();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(registration => {
  registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { updateAvailable = true; void renderRoute(); } }); });
}).catch(() => { /* The app remains usable without installation support. */ });
void renderRoute();
