import { expect, test } from 'vitest';
import { archiveItem, archivePlace, editItem, editPlace, fromCsv, moveStock, sampleData, toCsv, validateImport } from '../src/data';

test('moveStock rejects quantities above the source count', () => {
  expect(() => moveStock(sampleData(), 'batteries', 'hall', 'red-bin', 9, '')).toThrow('Only 8 available');
});

test('CSV export can be imported again', () => {
  const data = fromCsv(toCsv(sampleData()));
  expect(data.items).toHaveLength(5);
  expect(data.stocks).toHaveLength(8);
  expect(data.places.some(place => place.name === 'Red tool bin')).toBe(true);
});

test('JSON import rejects broken references before saving them', () => {
  const broken = sampleData();
  broken.stocks[0].placeId = 'missing-place';
  expect(() => validateImport(broken)).toThrow('missing places or items');
});

test('editing and archiving preserve history and move occupied place quantities', () => {
  let data = sampleData();
  data = editItem(data, 'batteries', 'Rechargeable batteries', 'AA set');
  data = editPlace(data, 'hall', 'Entry cupboard', null);
  expect(data.moves.find(move => move.id === 'move-3')).toMatchObject({ itemId: 'batteries', fromPlaceId: 'red-bin', toPlaceId: 'hall' });
  expect(() => archivePlace(data, 'hall', null)).toThrow('Choose where to move');
  data = archivePlace(data, 'hall', 'red-bin');
  expect(data.places.find(place => place.id === 'hall')?.archivedAt).toBeTruthy();
  expect(data.stocks.find(stock => stock.itemId === 'batteries' && stock.placeId === 'red-bin')?.quantity).toBe(12);
  expect(data.moves.find(move => move.note === 'Moved before archiving Entry cupboard' && move.itemId === 'batteries')).toMatchObject({ fromPlaceId: 'hall', toPlaceId: 'red-bin', quantity: 8 });
  data = archiveItem(data, 'batteries');
  expect(data.items.find(item => item.id === 'batteries')?.archivedAt).toBeTruthy();
  expect(data.moves.some(move => move.itemId === 'batteries' && move.toPlaceId === null && move.note === 'Archived Rechargeable batteries')).toBe(true);
});
