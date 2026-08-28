import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
  globalHeaders: Record<string, string>;
  routes: Array<{ route: string; headers?: Record<string, string> }>;
};

test('versioned static assets use immutable caching while the service worker revalidates', () => {
  const assets = config.routes.find(route => route.route === '/assets/*');
  const worker = config.routes.find(route => route.route === '/sw.js');
  expect(assets?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(worker?.headers?.['Cache-Control']).toContain('no-cache');
  expect(config.globalHeaders['Cache-Control']).toContain('must-revalidate');
});
