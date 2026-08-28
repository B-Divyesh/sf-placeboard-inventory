import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
  globalHeaders: Record<string, string>;
  navigationFallback?: unknown;
  responseOverrides: Record<string, { rewrite: string }>;
  routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
};

test('versioned static assets use immutable caching while the service worker revalidates', () => {
  const assets = config.routes.find(route => route.route === '/assets/*');
  const worker = config.routes.find(route => route.route === '/sw.js');
  expect(assets?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(worker?.headers?.['Cache-Control']).toContain('no-cache');
  expect(config.globalHeaders['Cache-Control']).toContain('must-revalidate');
});

test('only real application routes rewrite to the SPA and unknown paths use the full 404 page', () => {
  expect(config.navigationFallback).toBeUndefined();
  for (const route of ['/inventory', '/demo', '/print', '/privacy', '/terms']) {
    expect(config.routes.find(entry => entry.route === route)?.rewrite).toBe('/index.html');
  }
  expect(config.responseOverrides['404'].rewrite).toBe('/404.html');
  const notFound = readFileSync('public/404.html', 'utf8');
  expect((notFound.match(/<h1[ >]/g) ?? [])).toHaveLength(1);
  expect(notFound).toContain('<header>');
  expect(notFound).toContain('<footer>');
  expect(notFound).toContain('href="/privacy"');
  expect(notFound).toContain('href="/terms"');
  expect(notFound).toContain('v1.1.1 · polish-2');
  expect(notFound).toContain('Return home');
});
