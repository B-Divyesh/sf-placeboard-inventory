import type { InventoryData, Item, Move, Place, Stock } from './types';

const EMPTY: InventoryData = { version: 1, places: [], items: [], stocks: [], moves: [] };

const SAMPLE: InventoryData = {
  version: 1,
  places: [
    { id: 'home', name: 'Home', parentId: null, createdAt: '2026-08-01T08:00:00.000Z' },
    { id: 'kitchen', name: 'Kitchen', parentId: 'home', createdAt: '2026-08-01T08:01:00.000Z' },
    { id: 'pantry', name: 'Pantry shelf', parentId: 'kitchen', createdAt: '2026-08-01T08:02:00.000Z' },
    { id: 'hall', name: 'Hall cupboard', parentId: 'home', createdAt: '2026-08-01T08:03:00.000Z' },
    { id: 'garage', name: 'Garage', parentId: 'home', createdAt: '2026-08-01T08:04:00.000Z' },
    { id: 'red-bin', name: 'Red tool bin', parentId: 'garage', createdAt: '2026-08-01T08:05:00.000Z' },
    { id: 'car', name: 'Car boot', parentId: null, createdAt: '2026-08-01T08:06:00.000Z' },
  ],
  items: [
    { id: 'batteries', name: 'AA batteries', notes: 'Rechargeable and alkaline packs', createdAt: '2026-08-02T12:00:00.000Z', updatedAt: '2026-08-26T18:30:00.000Z' },
    { id: 'tape', name: 'Painter’s tape', notes: 'Blue, 48 mm', createdAt: '2026-08-03T12:00:00.000Z', updatedAt: '2026-08-24T10:15:00.000Z' },
    { id: 'torch', name: 'Camping lantern', notes: 'USB-C cable tucked inside', createdAt: '2026-08-04T12:00:00.000Z', updatedAt: '2026-08-22T09:00:00.000Z' },
    { id: 'bulbs', name: 'Spare light bulbs', notes: 'Warm white, E27', createdAt: '2026-08-05T12:00:00.000Z', updatedAt: '2026-08-20T07:45:00.000Z' },
    { id: 'bags', name: 'Reusable shopping bags', notes: 'Folded canvas bags', createdAt: '2026-08-06T12:00:00.000Z', updatedAt: '2026-08-18T16:00:00.000Z' }
  ],
  stocks: [
    { itemId: 'batteries', placeId: 'hall', quantity: 8 },
    { itemId: 'batteries', placeId: 'red-bin', quantity: 4 },
    { itemId: 'tape', placeId: 'red-bin', quantity: 3 },
    { itemId: 'tape', placeId: 'kitchen', quantity: 1 },
    { itemId: 'torch', placeId: 'car', quantity: 1 },
    { itemId: 'bulbs', placeId: 'hall', quantity: 6 },
    { itemId: 'bags', placeId: 'car', quantity: 4 },
    { itemId: 'bags', placeId: 'pantry', quantity: 5 }
  ],
  moves: [
    { id: 'move-3', itemId: 'batteries', fromPlaceId: 'red-bin', toPlaceId: 'hall', quantity: 2, note: 'For the smoke alarm', at: '2026-08-26T18:30:00.000Z' },
    { id: 'move-2', itemId: 'tape', fromPlaceId: 'red-bin', toPlaceId: 'kitchen', quantity: 1, note: 'Painting prep', at: '2026-08-24T10:15:00.000Z' },
    { id: 'move-1', itemId: 'torch', fromPlaceId: 'garage', toPlaceId: 'car', quantity: 1, note: 'Packed for weekend trip', at: '2026-08-22T09:00:00.000Z' }
  ]
};

const clone = <T>(value: T): T => structuredClone(value);

export const emptyData = () => clone(EMPTY);
export const sampleData = () => clone(SAMPLE);

const request = <T>(value: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  value.onsuccess = () => resolve(value.result);
  value.onerror = () => reject(value.error ?? new Error('The browser could not open local storage.'));
});

const openDatabase = (demo: boolean) => new Promise<IDBDatabase>((resolve, reject) => {
  const open = indexedDB.open(demo ? 'placeboard-demo-v1' : 'placeboard-real-v1', 1);
  open.onupgradeneeded = () => open.result.createObjectStore('inventory');
  open.onsuccess = () => resolve(open.result);
  open.onerror = () => reject(open.error ?? new Error('The browser could not open local storage.'));
});

export async function loadData(demo: boolean): Promise<InventoryData> {
  const db = await openDatabase(demo);
  const tx = db.transaction('inventory', 'readonly');
  const saved = await request<InventoryData | undefined>(tx.objectStore('inventory').get('current'));
  db.close();
  if (saved) return saved;
  const initial = demo ? sampleData() : emptyData();
  await saveData(demo, initial);
  return initial;
}

export async function saveData(demo: boolean, data: InventoryData): Promise<void> {
  const db = await openDatabase(demo);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('inventory', 'readwrite');
    tx.objectStore('inventory').put(data, 'current');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Your changes could not be saved.'));
  });
  db.close();
}

export async function resetDemo(): Promise<InventoryData> {
  const data = sampleData();
  await saveData(true, data);
  return data;
}

export function discardDemo(): Promise<void> {
  return new Promise((resolve, reject) => {
    const result = indexedDB.deleteDatabase('placeboard-demo-v1');
    result.onsuccess = () => resolve();
    result.onerror = () => reject(result.error);
    result.onblocked = () => resolve();
  });
}

export const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export function placePath(placeId: string, places: Place[]): string {
  const names: string[] = [];
  let current = places.find(place => place.id === placeId);
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    names.unshift(current.name);
    current = current.parentId ? places.find(place => place.id === current?.parentId) : undefined;
  }
  return names.join(' / ');
}

export function addPlace(data: InventoryData, name: string, parentId: string | null): InventoryData {
  const place: Place = { id: uid('place'), name: name.trim(), parentId: parentId || null, createdAt: new Date().toISOString() };
  return { ...data, places: [...data.places, place] };
}

export function addItem(data: InventoryData, name: string, notes: string, placeId: string, quantity: number): InventoryData {
  const now = new Date().toISOString();
  const item: Item = { id: uid('item'), name: name.trim(), notes: notes.trim(), createdAt: now, updatedAt: now };
  const stock: Stock = { itemId: item.id, placeId, quantity };
  const move: Move = { id: uid('move'), itemId: item.id, fromPlaceId: null, toPlaceId: placeId, quantity, note: 'Added to inventory', at: now };
  return { ...data, items: [...data.items, item], stocks: [...data.stocks, stock], moves: [move, ...data.moves] };
}

export function editItem(data: InventoryData, itemId: string, name: string, notes: string): InventoryData {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Enter a name for this item.');
  const now = new Date().toISOString();
  return {
    ...data,
    items: data.items.map(item => item.id === itemId ? { ...item, name: cleanName, notes: notes.trim(), updatedAt: now } : item)
  };
}

export function editPlace(data: InventoryData, placeId: string, name: string, parentId: string | null): InventoryData {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Enter a name for this place.');
  if (parentId === placeId) throw new Error('A place cannot be inside itself.');
  let current = parentId ? data.places.find(place => place.id === parentId) : undefined;
  const seen = new Set([placeId]);
  while (current) {
    if (seen.has(current.id)) throw new Error('Choose a place outside this branch.');
    seen.add(current.id);
    current = current.parentId ? data.places.find(place => place.id === current?.parentId) : undefined;
  }
  return {
    ...data,
    places: data.places.map(place => place.id === placeId ? { ...place, name: cleanName, parentId: parentId || null } : place)
  };
}

export function archiveItem(data: InventoryData, itemId: string): InventoryData {
  const now = new Date().toISOString();
  const item = data.items.find(candidate => candidate.id === itemId);
  const archiveMoves = data.stocks.filter(stock => stock.itemId === itemId).map(stock => ({
    id: uid('move'), itemId, fromPlaceId: stock.placeId, toPlaceId: null, quantity: stock.quantity,
    note: `Archived ${item?.name ?? 'item'}`, at: now
  }));
  return {
    ...data,
    items: data.items.map(item => item.id === itemId ? { ...item, archivedAt: now, updatedAt: now } : item),
    stocks: data.stocks.filter(stock => stock.itemId !== itemId),
    moves: [...archiveMoves, ...data.moves]
  };
}

export function archivePlace(data: InventoryData, placeId: string, destinationId: string | null): InventoryData {
  const place = data.places.find(candidate => candidate.id === placeId);
  if (!place) throw new Error('This place could not be found.');
  if (data.places.some(candidate => !candidate.archivedAt && candidate.parentId === placeId)) {
    throw new Error('Archive the places inside this place first.');
  }
  const occupied = data.stocks.filter(stock => stock.placeId === placeId);
  if (occupied.length && !destinationId) throw new Error('Choose where to move the items before archiving this place.');
  if (destinationId === placeId) throw new Error('Choose a different destination.');
  const stocks = data.stocks.map(stock => ({ ...stock }));
  const moves = [...data.moves];
  const now = new Date().toISOString();
  for (const source of occupied) {
    const target = stocks.find(stock => stock.itemId === source.itemId && stock.placeId === destinationId);
    if (target) target.quantity += source.quantity;
    else stocks.push({ itemId: source.itemId, placeId: destinationId!, quantity: source.quantity });
    moves.unshift({ id: uid('move'), itemId: source.itemId, fromPlaceId: placeId, toPlaceId: destinationId, quantity: source.quantity, note: `Moved before archiving ${place.name}`, at: now });
  }
  return {
    ...data,
    places: data.places.map(candidate => candidate.id === placeId ? { ...candidate, archivedAt: now } : candidate),
    stocks: stocks.filter(stock => stock.placeId !== placeId),
    moves
  };
}

export function moveStock(data: InventoryData, itemId: string, fromPlaceId: string | null, toPlaceId: string | null, quantity: number, note: string): InventoryData {
  if (!toPlaceId && !fromPlaceId) throw new Error('Choose where the item came from or where it is going.');
  if (fromPlaceId === toPlaceId) throw new Error('Choose two different places.');
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Enter a whole quantity of at least 1.');
  const stocks = data.stocks.map(stock => ({ ...stock }));
  if (fromPlaceId) {
    const source = stocks.find(stock => stock.itemId === itemId && stock.placeId === fromPlaceId);
    if (!source || source.quantity < quantity) throw new Error(`Only ${source?.quantity ?? 0} available at the starting place.`);
    source.quantity -= quantity;
  }
  if (toPlaceId) {
    const target = stocks.find(stock => stock.itemId === itemId && stock.placeId === toPlaceId);
    if (target) target.quantity += quantity;
    else stocks.push({ itemId, placeId: toPlaceId, quantity });
  }
  const at = new Date().toISOString();
  const move: Move = { id: uid('move'), itemId, fromPlaceId, toPlaceId, quantity, note: note.trim(), at };
  return {
    ...data,
    stocks: stocks.filter(stock => stock.quantity > 0),
    moves: [move, ...data.moves],
    items: data.items.map(item => item.id === itemId ? { ...item, updatedAt: at } : item)
  };
}

export function validateImport(value: unknown): InventoryData {
  if (!value || typeof value !== 'object') throw new Error('The file does not contain a Placeboard inventory.');
  const data = value as Partial<InventoryData>;
  if (data.version !== 1 || !Array.isArray(data.places) || !Array.isArray(data.items) || !Array.isArray(data.stocks) || !Array.isArray(data.moves)) {
    throw new Error('The file format is not supported. Choose a Placeboard JSON export.');
  }
  const places = data.places as unknown[];
  const items = data.items as unknown[];
  const stocks = data.stocks as unknown[];
  const moves = data.moves as unknown[];
  const record = (entry: unknown): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object';
  const text = (entry: Record<string, unknown>, key: string) => typeof entry[key] === 'string';
  if (!places.every(entry => record(entry) && text(entry, 'id') && text(entry, 'name') && text(entry, 'createdAt') && (entry.parentId === null || typeof entry.parentId === 'string') && (entry.archivedAt === undefined || typeof entry.archivedAt === 'string')) ||
      !items.every(entry => record(entry) && text(entry, 'id') && text(entry, 'name') && text(entry, 'notes') && text(entry, 'createdAt') && text(entry, 'updatedAt') && (entry.archivedAt === undefined || typeof entry.archivedAt === 'string')) ||
      !stocks.every(entry => record(entry) && text(entry, 'itemId') && text(entry, 'placeId') && Number.isInteger(entry.quantity) && Number(entry.quantity) > 0) ||
      !moves.every(entry => record(entry) && text(entry, 'id') && text(entry, 'itemId') && text(entry, 'note') && text(entry, 'at') && Number.isInteger(entry.quantity) && Number(entry.quantity) > 0 && (entry.fromPlaceId === null || typeof entry.fromPlaceId === 'string') && (entry.toPlaceId === null || typeof entry.toPlaceId === 'string'))) {
    throw new Error('Some inventory records are incomplete. Choose an unedited Placeboard JSON export.');
  }
  const placeIds = new Set(data.places.map(place => place.id));
  const itemIds = new Set(data.items.map(item => item.id));
  if (placeIds.size !== data.places.length || itemIds.size !== data.items.length ||
      data.places.some(place => place.parentId && !placeIds.has(place.parentId)) ||
      data.stocks.some(stock => !placeIds.has(stock.placeId) || !itemIds.has(stock.itemId)) ||
      data.moves.some(move => !itemIds.has(move.itemId) || (move.fromPlaceId && !placeIds.has(move.fromPlaceId)) || (move.toPlaceId && !placeIds.has(move.toPlaceId)))) {
    throw new Error('Some inventory records point to missing places or items. Choose an unedited Placeboard JSON export.');
  }
  for (const place of data.places) {
    const seen = new Set<string>();
    let current: Place | undefined = place;
    while (current) {
      if (seen.has(current.id)) throw new Error('The place tree contains a loop. Choose an unedited Placeboard JSON export.');
      seen.add(current.id);
      current = current.parentId ? data.places.find(candidate => candidate.id === current?.parentId) : undefined;
    }
  }
  return clone(data as InventoryData);
}

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export function toCsv(data: InventoryData): string {
  const rows = [['item', 'place', 'quantity', 'notes']];
  for (const item of data.items) {
    const stocks = data.stocks.filter(stock => stock.itemId === item.id);
    for (const stock of stocks) rows.push([item.name, placePath(stock.placeId, data.places), String(stock.quantity), item.notes]);
  }
  return rows.map(row => row.map(csvCell).join(',')).join('\n');
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  row.push(cell); if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function fromCsv(text: string): InventoryData {
  const rows = parseCsv(text);
  const header = rows.shift()?.map(cell => cell.trim().toLowerCase());
  if (!header || header.join(',') !== 'item,place,quantity,notes') throw new Error('CSV columns must be item, place, quantity, notes.');
  let data = emptyData();
  const placesByPath = new Map<string, string>();
  const itemsByName = new Map<string, string>();
  for (const [itemNameRaw, pathRaw, quantityRaw, notes = ''] of rows) {
    const itemName = itemNameRaw.trim(), path = pathRaw.trim();
    const quantity = Number(quantityRaw);
    if (!itemName || !path || !Number.isInteger(quantity) || quantity < 1) throw new Error('Each CSV row needs an item, place, and whole quantity of at least 1.');
    let parentId: string | null = null, builtPath = '';
    for (const rawPart of path.split('/')) {
      const part = rawPart.trim();
      if (!part) throw new Error('Each place path must name every level. Remove empty path sections and try again.');
      builtPath = builtPath ? `${builtPath} / ${part}` : part;
      let placeId = placesByPath.get(builtPath);
      if (!placeId) {
        placeId = uid('place'); placesByPath.set(builtPath, placeId);
        data.places.push({ id: placeId, name: part, parentId, createdAt: new Date().toISOString() });
      }
      parentId = placeId;
    }
    let itemId = itemsByName.get(itemName.toLowerCase());
    if (!itemId) {
      itemId = uid('item'); itemsByName.set(itemName.toLowerCase(), itemId);
      const now = new Date().toISOString(); data.items.push({ id: itemId, name: itemName, notes, createdAt: now, updatedAt: now });
    }
    const existing = data.stocks.find(stock => stock.itemId === itemId && stock.placeId === parentId);
    if (existing) existing.quantity += quantity;
    else data.stocks.push({ itemId, placeId: parentId!, quantity });
  }
  return data;
}
