import { environment } from '../config/environment';
import type { Course, Product } from '../types/marketplace';
import { demoCourses } from './demo-data';
import { demoCourse, demoCourseProducts } from '../management/demo-management';
export interface MarketplaceRepository {
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | null>;
  getProductsForCourse(courseId: string): Promise<Product[]>;
}
export class DemoMarketplaceRepository implements MarketplaceRepository {
  async getCourses() {
    return structuredClone(demoCourses);
  }
  async getCourse(id: string) {
    return structuredClone(demoCourse(id));
  }
  async getProductsForCourse(courseId: string) {
    if (!courseId) throw new Error('A course ID is required to load products.');
    if (!demoCourses.some((course) => course.id === courseId)) return [];
    const products = demoCourseProducts(courseId);
    if (products.some((product) => product.courseId !== courseId))
      throw new Error('Invalid product-course relationship.');
    return structuredClone(products);
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
