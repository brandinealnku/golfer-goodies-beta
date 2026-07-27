import { environment } from '../config/environment';
import type { Course, Product } from '../types/marketplace';
import { demoCourses, demoProducts } from './demo-data';
export interface MarketplaceRepository {
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | null>;
  getProducts(courseId: string): Promise<Product[]>;
}
export class DemoMarketplaceRepository implements MarketplaceRepository {
  async getCourses() {
    return structuredClone(demoCourses);
  }
  async getCourse(id: string) {
    return structuredClone(demoCourses.find((c) => c.id === id) ?? null);
  }
  async getProducts(courseId: string) {
    return structuredClone(demoProducts.filter((p) => p.courseId === courseId));
  }
}
let selected: Promise<MarketplaceRepository> | undefined;
export function getMarketplaceRepository() {
  if (!selected)
    selected =
      environment.mode === 'demo'
        ? Promise.resolve(new DemoMarketplaceRepository())
        : environment.mode === 'emulator'
          ? import('./firestore-marketplace-repository').then(
              (m) => new m.FirestoreMarketplaceRepository(),
            )
          : Promise.reject(new Error('Connected mode is not configured.'));
  return selected;
}
