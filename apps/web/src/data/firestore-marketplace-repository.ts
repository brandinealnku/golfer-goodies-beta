import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Course, Product } from '../types/marketplace';
import { getFirebaseServices } from '../firebase/client';
import type { MarketplaceRepository } from './marketplace-repository';
function courseFromDoc(s: QueryDocumentSnapshot<DocumentData>): Course {
  const d = s.data();
  if (
    typeof d.name !== 'string' ||
    typeof d.city !== 'string' ||
    !Array.isArray(d.fulfillmentMethods)
  )
    throw new Error(`Invalid course record: ${s.id}`);
  return {
    id: s.id,
    name: d.name,
    city: d.city,
    state: d.state,
    archetype: d.archetype ?? 'Fictional course',
    availability: d.acceptsOrders
      ? 'open'
      : d.status === 'paused'
        ? 'limited'
        : 'closed',
    fulfillmentMethods: d.fulfillmentMethods,
    estimatedMinutes: d.defaultPrepMinutes,
    verified: d.verified,
    description: d.shortDescription,
    demoCode: '',
    demoQrToken: '',
    minimumOrderCents: d.minimumOrderCents ?? 0,
    promotion: d.promotion,
    orderingPaused: d.status === 'paused',
    image: d.image ?? 'images/demo/courses/cedar-bend.svg',
    imageAlt: d.imageAlt ?? `${d.name} golf course`,
  };
}
function categoryFromId(value: unknown): Product['category'] {
  if (value === 'cold-drinks') return 'drink';
  if (
    value === 'golf-essentials' ||
    value === 'weather-rescue' ||
    value === 'personal-care'
  )
    return 'essentials';
  if (value === 'course-experiences') return 'service';
  return 'food';
}
function productFromDoc(
  s: QueryDocumentSnapshot<DocumentData>,
  courseId: string,
): Product {
  const d = s.data();
  if (typeof d.name !== 'string' || !Number.isInteger(d.priceCents))
    throw new Error(`Invalid product record: ${s.id}`);
  return {
    id: s.id,
    courseId,
    name: d.name,
    category: categoryFromId(d.categoryId),
    priceCents: d.priceCents,
    available: d.status === 'active',
    preparationMinutes: d.preparationMinutes,
    publiclyVisible: d.status === 'active',
    image: d.image ?? 'images/demo/products/trail-mix.svg',
    imageAlt: d.imageAlt ?? `${d.name}, course item`,
    description: d.shortDescription ?? 'Available from this course storefront.',
    tags: Array.isArray(d.tags) ? d.tags : [],
  };
}
export class FirestoreMarketplaceRepository implements MarketplaceRepository {
  async getCourses() {
    const { firestore } = await getFirebaseServices();
    const snap = await getDocs(
      query(
        collection(firestore, 'courses'),
        where('status', '==', 'active'),
        where('marketplaceVisible', '==', true),
      ),
    );
    return snap.docs.map(courseFromDoc);
  }
  async getCourse(id: string) {
    const { firestore } = await getFirebaseServices();
    const snap = await getDoc(doc(firestore, 'courses', id));
    if (!snap.exists()) return null;
    return courseFromDoc(snap as QueryDocumentSnapshot<DocumentData>);
  }
  async getProductsForCourse(courseId: string) {
    if (!courseId) throw new Error('A course ID is required to load products.');
    const { firestore } = await getFirebaseServices();
    const snap = await getDocs(
      query(
        collection(firestore, 'courses', courseId, 'products'),
        where('status', '==', 'active'),
      ),
    );
    return snap.docs.map((s) => productFromDoc(s, courseId));
  }
}
