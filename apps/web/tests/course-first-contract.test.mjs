import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const sourceDirectory = resolve(testDirectory, '../src');
const source = (relativePath) => {
  const sourcePath = resolve(sourceDirectory, relativePath);
  assert.ok(
    sourcePath.startsWith(`${sourceDirectory}${sep}`),
    `Source path must remain inside ${sourceDirectory}`,
  );
  return readFile(sourcePath, 'utf8');
};

test('golfer UI has no marketplace-wide product API or raw product import', async () => {
  const [repository, coursePage, discovery] = await Promise.all([
    source('data/marketplace-repository.ts'),
    source('features/courses/CoursePage.tsx'),
    source('features/marketplace/DiscoverPage.tsx'),
  ]);
  assert.match(repository, /getProductsForCourse\(courseId: string\)/);
  assert.doesNotMatch(
    repository,
    /getAllProducts|getFeaturedProducts|searchAllProducts/,
  );
  assert.doesNotMatch(coursePage, /demoProducts|products\.json/);
  assert.doesNotMatch(discovery, /getProductsForCourse|demoProducts/);
});

test('demo UI never calls browser geolocation', async () => {
  const files = await Promise.all([
    source('features/courses/CoursePage.tsx'),
    source('state/course-context.tsx'),
  ]);
  assert.doesNotMatch(
    files.join('\n'),
    /navigator\.geolocation|getCurrentPosition|watchPosition/,
  );
});

const webDirectory = resolve(testDirectory, '..');
const webFile = (relativePath) => {
  const filePath = resolve(webDirectory, relativePath);
  assert.ok(
    filePath.startsWith(`${webDirectory}${sep}`),
    `Web app path must remain inside ${webDirectory}`,
  );
  return readFile(filePath, 'utf8');
};

test('service worker upgrades old caches and uses network-first navigation', async () => {
  const [serviceWorker, registration, viteConfig] = await Promise.all([
    webFile('public/service-worker.js'),
    source('main.tsx'),
    webFile('vite.config.ts'),
  ]);

  assert.match(serviceWorker, /golfer-goodies-v03-shell-/);
  assert.match(serviceWorker, /self\.skipWaiting\(\)/);
  assert.match(serviceWorker, /self\.clients\.claim\(\)/);
  assert.match(serviceWorker, /key\.startsWith\(CACHE_PREFIX\)/);
  assert.match(serviceWorker, /event\.request\.mode === 'navigate'/);
  assert.match(serviceWorker, /fetch\(event\.request\)[\s\S]*\.catch\(/);
  assert.match(serviceWorker, /'\.\/index\.html'/);
  assert.match(registration, /updateViaCache: 'none'/);
  assert.match(viteConfig, /base: '\.\/'/);
});
