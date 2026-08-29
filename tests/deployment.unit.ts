import { existsSync, readFileSync } from 'node:fs';
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
  expect(notFound).toContain('v__APP_VERSION__ · polish-3');
  expect(notFound).toContain('Return home');
});

test('static fallback pages have complete social metadata and explicit noindex rules', () => {
  const required = [
    'property="og:type"',
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
    'name="twitter:card"',
    'name="twitter:title"',
    'name="twitter:description"',
    'name="twitter:image"',
  ];
  for (const file of ['public/404.html', 'public/offline.html']) {
    const html = readFileSync(file, 'utf8');
    for (const tag of required) expect(html, `${file} is missing ${tag}`).toContain(tag);
    expect(html).toContain('<meta name="robots" content="noindex">');
  }
  expect(readFileSync('public/sitemap.xml', 'utf8')).not.toContain('/offline.html');
});

test('the package version stamps every release marker and rejects mismatches', () => {
  const packageMetadata = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8')) as { version: string; packages: Record<string, { version?: string }> };
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as { start_url: string };
  expect(packageMetadata.version).toBe('1.1.1');
  expect(lock.version).toBe(packageMetadata.version);
  expect(lock.packages[''].version).toBe(packageMetadata.version);
  expect(manifest.start_url).toBe('/inventory?v=__APP_VERSION__');
  expect(readFileSync('public/sw.js', 'utf8')).toContain("placeboard-v__APP_VERSION__");
  expect(readFileSync('src/main.ts', 'utf8')).toContain('v${__APP_VERSION__} · polish-3');
  for (const file of ['public/404.html', 'public/offline.html']) expect(readFileSync(file, 'utf8')).toContain('v__APP_VERSION__ · polish-3');

  if (existsSync('dist/manifest.webmanifest')) {
    for (const file of ['dist/manifest.webmanifest', 'dist/sw.js', 'dist/404.html', 'dist/offline.html']) {
      const output = readFileSync(file, 'utf8');
      expect(output).not.toContain('__APP_VERSION__');
      expect(output).toContain(packageMetadata.version);
    }
  }
});

test('public copy contains no unlisted valuation, insurance, barcode, or warehouse boundary', () => {
  const publicCopy = `${readFileSync('src/main.ts', 'utf8')}\n${readFileSync('README.md', 'utf8')}`.toLowerCase();
  for (const term of ['valuation', 'insurance', 'barcode', 'warehouse']) expect(publicCopy).not.toContain(term);
});

test('every declared claim has exactly one tagged browser test', () => {
  const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
  const browserTests = readFileSync('tests/claims.spec.ts', 'utf8');
  expect(new Set(claims.map(claim => claim.id)).size).toBe(claims.length);
  for (const claim of claims) {
    expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
    expect(browserTests.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g')) ?? []).toHaveLength(1);
  }
  expect(browserTests.match(/@claim:[a-z0-9-]+/g) ?? []).toHaveLength(claims.length);
});
