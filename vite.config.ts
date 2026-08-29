import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const packageMetadata = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
const packageLock = JSON.parse(readFileSync(new URL('./package-lock.json', import.meta.url), 'utf8')) as { version: string; packages: Record<string, { version?: string }> };

if (packageLock.version !== packageMetadata.version || packageLock.packages['']?.version !== packageMetadata.version) {
  throw new Error('Release version mismatch between package.json and package-lock.json.');
}

const releaseFiles = ['manifest.webmanifest', 'sw.js', '404.html', 'offline.html'];

function stampReleaseAssets() {
  return {
    name: 'stamp-release-assets',
    closeBundle() {
      for (const file of releaseFiles) {
        const outputPath = resolve('dist', file);
        const source = readFileSync(outputPath, 'utf8');
        if (!source.includes('__APP_VERSION__')) throw new Error(`${file} is missing the release placeholder.`);
        const stamped = source.replaceAll('__APP_VERSION__', packageMetadata.version);
        if (stamped.includes('__APP_VERSION__')) throw new Error(`${file} still contains an unstamped release placeholder.`);
        writeFileSync(outputPath, stamped);
      }
    },
  };
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(packageMetadata.version) },
  plugins: [stampReleaseAssets()],
  build: { target: 'es2022', sourcemap: true },
});
