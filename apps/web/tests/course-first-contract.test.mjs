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
