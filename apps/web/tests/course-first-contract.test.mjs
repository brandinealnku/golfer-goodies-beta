import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';

const source = (path) =>
  readFile(new URL(`../src/${path}`, import.meta.url), 'utf8');

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
