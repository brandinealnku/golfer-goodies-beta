import { environment } from '../config/environment';
import type { CourseMembership } from '../auth/authorization';
import type { Course, Product } from '../types/marketplace';
import {
  allDemoCourseProducts,
  demoCourse,
  submitDemoClaim,
  updateDemoCourse,
  updateDemoProduct,
  type CourseClaim,
} from './demo-management';
import type { AuthenticatedUser } from '../auth/identity';

export interface CourseManagementRepository {
  getMemberships(user: AuthenticatedUser): Promise<CourseMembership[]>;
  subscribeToManagedCourse(
    courseId: string,
    callback: (course: Course | null) => void,
  ): () => void;
  subscribeToProducts(
    courseId: string,
    callback: (products: Product[]) => void,
  ): () => void;
  updateCourseOperations(
    user: AuthenticatedUser,
    courseId: string,
    changes: Partial<Course>,
  ): Promise<void>;
  updateProduct(
    user: AuthenticatedUser,
    courseId: string,
    productId: string,
    changes: Partial<Product>,
  ): Promise<void>;
  setProductAvailability(
    user: AuthenticatedUser,
    courseId: string,
    productId: string,
    status: 'active' | 'sold_out',
  ): Promise<void>;
  submitCourseClaim(
    user: AuthenticatedUser,
    input: Omit<CourseClaim, 'id' | 'requestedBy' | 'status' | 'createdAt'>,
  ): Promise<void>;
}
export class DemoCourseManagementRepository
  implements CourseManagementRepository
{
  async getMemberships() {
    return [];
  }
  subscribeToManagedCourse(
    courseId: string,
    callback: (course: Course | null) => void,
  ) {
    callback(demoCourse(courseId));
    return () => undefined;
  }
  subscribeToProducts(
    courseId: string,
    callback: (products: Product[]) => void,
  ) {
    callback(allDemoCourseProducts(courseId));
    return () => undefined;
  }
  async updateCourseOperations(
    user: AuthenticatedUser,
    courseId: string,
    changes: Partial<Course>,
  ) {
    updateDemoCourse(user, courseId, changes);
  }
  async updateProduct(
    user: AuthenticatedUser,
    courseId: string,
    productId: string,
    changes: Partial<Product>,
  ) {
    updateDemoProduct(user, courseId, productId, changes);
  }
  async setProductAvailability(
    user: AuthenticatedUser,
    courseId: string,
    productId: string,
    status: 'active' | 'sold_out',
  ) {
    updateDemoProduct(user, courseId, productId, {
      available: status === 'active',
      status,
    });
  }
  async submitCourseClaim(
    user: AuthenticatedUser,
    input: Omit<CourseClaim, 'id' | 'requestedBy' | 'status' | 'createdAt'>,
  ) {
    submitDemoClaim(user, input);
  }
}
export class EmulatorCourseManagementRepository
  implements CourseManagementRepository
{
  async getMemberships(user: AuthenticatedUser) {
    const [{ firestore }, { doc, getDoc }] = await Promise.all([
      import('../firebase/client').then((m) => m.getFirebaseServices()),
      import('firebase/firestore'),
    ]);
    const courseIds = ['summit-pines', 'cedar-bend-muni'];
    const records = await Promise.all(
      courseIds.map(async (courseId) => {
        const snap = await getDoc(
          doc(firestore, 'courses', courseId, 'members', user.uid),
        );
        return snap.exists() ? (snap.data() as CourseMembership) : null;
      }),
    );
    return records.filter(
      (m): m is CourseMembership => m?.version === 1 && m.status === 'active',
    );
  }
  subscribeToManagedCourse(
    courseId: string,
    callback: (course: Course | null) => void,
  ) {
    let unsubscribe: () => void = () => {};
    void Promise.all([
      import('../firebase/client').then((m) => m.getFirebaseServices()),
      import('firebase/firestore'),
    ]).then(([{ firestore }, { doc, onSnapshot }]) => {
      unsubscribe = onSnapshot(doc(firestore, 'courses', courseId), (snap) =>
        callback(snap.exists() ? (snap.data() as Course) : null),
      );
    });
    return () => unsubscribe();
  }
  subscribeToProducts(
    courseId: string,
    callback: (products: Product[]) => void,
  ) {
    let unsubscribe: () => void = () => {};
    void Promise.all([
      import('../firebase/client').then((m) => m.getFirebaseServices()),
      import('firebase/firestore'),
    ]).then(([{ firestore }, { collection, onSnapshot }]) => {
      unsubscribe = onSnapshot(
        collection(firestore, 'courses', courseId, 'products'),
        (snap) => callback(snap.docs.map((d) => d.data() as Product)),
      );
    });
    return () => unsubscribe();
  }
  private async call(name: string, data: unknown) {
    const [{ functions }, { httpsCallable }] = await Promise.all([
      import('../firebase/client').then((m) => m.getFirebaseServices()),
      import('firebase/functions'),
    ]);
    await httpsCallable(functions, name)(data);
  }
  async updateCourseOperations(
    _user: AuthenticatedUser,
    courseId: string,
    changes: Partial<Course>,
  ) {
    const operations = {
      status: changes.orderingPaused ? 'paused' : 'active',
      acceptsOrders: !changes.orderingPaused,
      defaultPrepMinutes: changes.estimatedMinutes,
      minimumOrderCents: changes.minimumOrderCents,
      promotion: changes.promotion,
    };
    await this.call('updateCourseOperations', {
      courseId,
      changes: operations,
    });
    if (changes.fulfillmentMethods)
      await this.call('updateFulfillmentSettings', {
        courseId,
        fulfillmentMethods: changes.fulfillmentMethods,
      });
  }
  async updateProduct(
    _user: AuthenticatedUser,
    courseId: string,
    productId: string,
    product: Partial<Product>,
  ) {
    await this.call('updateCourseProduct', {
      courseId,
      productId,
      product: {
        name: product.name,
        shortDescription: product.description,
        categoryId: product.category,
        priceCents: product.priceCents,
        preparationMinutes: product.preparationMinutes,
        status:
          product.status ??
          (product.available === false ? 'sold_out' : 'active'),
        publiclyVisible: product.publiclyVisible ?? true,
        featured: product.featured ?? false,
        popular: product.popular ?? false,
        image: product.image ?? 'images/demo/products/trail-mix.svg',
        imageAlt: product.imageAlt ?? '',
        tags: product.tags ?? [],
      },
    });
  }
  async setProductAvailability(
    _user: AuthenticatedUser,
    courseId: string,
    productId: string,
    status: 'active' | 'sold_out',
  ) {
    await this.call('setCourseProductAvailability', {
      courseId,
      productId,
      status,
    });
  }
  async submitCourseClaim(
    _user: AuthenticatedUser,
    input: Omit<CourseClaim, 'id' | 'requestedBy' | 'status' | 'createdAt'>,
  ) {
    await this.call('submitCourseClaim', input);
  }
}
export class ConnectedCourseManagementRepository
  implements CourseManagementRepository
{
  private unavailable(): never {
    throw new Error(
      'Trusted connected management services are not configured.',
    );
  }
  async getMemberships() {
    return [];
  }
  subscribeToManagedCourse(_id: string, callback: (course: null) => void) {
    callback(null);
    return () => undefined;
  }
  subscribeToProducts(_id: string, callback: (products: Product[]) => void) {
    callback([]);
    return () => undefined;
  }
  async updateCourseOperations() {
    this.unavailable();
  }
  async updateProduct() {
    this.unavailable();
  }
  async setProductAvailability() {
    this.unavailable();
  }
  async submitCourseClaim() {
    this.unavailable();
  }
}
let selected: CourseManagementRepository;
export const getCourseManagementRepository = () =>
  (selected ??=
    environment.mode === 'demo'
      ? new DemoCourseManagementRepository()
      : environment.mode === 'emulator'
        ? new EmulatorCourseManagementRepository()
        : new ConnectedCourseManagementRepository());
