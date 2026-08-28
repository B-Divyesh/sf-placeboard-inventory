import { test, expect } from '@playwright/test';
import { fromCsv, moveStock, sampleData, toCsv } from '../src/data';

test('moveStock rejects quantities above the source count', () => {
  expect(() => moveStock(sampleData(), 'batteries', 'hall', 'red-bin', 9, '')).toThrow('Only 8 available');
});

test('CSV export can be imported again', () => {
  const data = fromCsv(toCsv(sampleData()));
  expect(data.items).toHaveLength(5);
  expect(data.stocks).toHaveLength(8);
  expect(data.places.some(place => place.name === 'Red tool bin')).toBe(true);
});
