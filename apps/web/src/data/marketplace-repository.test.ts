import { expect, it } from 'vitest';
import { DemoMarketplaceRepository } from './marketplace-repository';
it('loads fictional demo records', async () => {
  const r = new DemoMarketplaceRepository(),
    c = await r.getCourses();
  expect(c).toHaveLength(5);
  expect(new Set(c.map((x) => x.archetype)).size).toBe(5);
  expect(await r.getProductsForCourse(c[0].id)).toHaveLength(6);
});
it('requires a course id and never crosses course boundaries', async () => {
  const r = new DemoMarketplaceRepository();
  await expect(r.getProductsForCourse('')).rejects.toThrow(/course ID/i);
  const products = await r.getProductsForCourse('summit-pines');
  expect(products.every((product) => product.courseId === 'summit-pines')).toBe(
    true,
  );
});
