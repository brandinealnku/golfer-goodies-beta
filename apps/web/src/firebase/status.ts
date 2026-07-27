import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFirebaseServices } from './client';
export async function checkEmulators() {
  const s = await getFirebaseServices();
  const [courses, health] = await Promise.all([
    getDocs(
      query(
        collection(s.firestore, 'courses'),
        where('status', '==', 'active'),
        where('marketplaceVisible', '==', true),
      ),
    ),
    httpsCallable(s.functions, 'healthCheck')(),
  ]);
  return {
    projectId: s.projectId,
    auth: 'configured',
    firestore: 'connected',
    functions: (health.data as { status: string }).status,
    storage: 'configured',
    seed: courses.size >= 4 ? 'marketplace available' : 'seed incomplete',
    hosting: location.origin,
    lastChecked: new Date().toISOString(),
  };
}
