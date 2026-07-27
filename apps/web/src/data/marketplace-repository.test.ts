import { expect, it } from 'vitest';
import { DemoMarketplaceRepository } from './marketplace-repository';
it('loads fictional demo records', async () => {
  const r = new DemoMarketplaceRepository(),
    c = await r.getCourses();
  expect(c).toHaveLength(5);
  expect(new Set(c.map((x) => x.archetype)).size).toBe(5);
  expect(await r.getProducts(c[0].id)).toHaveLength(2);
});
