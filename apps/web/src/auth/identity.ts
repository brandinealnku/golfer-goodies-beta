import { environment, type AppMode } from '../config/environment';
import type { CourseMembershipRole } from './authorization';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  mode: AppMode;
  platformAdmin: boolean;
}
export type IdentityState =
  | { status: 'loading' }
  | { status: 'signed_out' }
  | { status: 'signed_in'; user: AuthenticatedUser }
  | { status: 'error'; message: string };
export interface IdentityProvider {
  subscribe(callback: (state: IdentityState) => void): () => void;
  signInWithEmailAndPassword(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
export interface DemoIdentity extends AuthenticatedUser {
  membership?: { courseId: string; role: CourseMembershipRole };
}
const demo = (
  uid: string,
  displayName: string,
  role?: CourseMembershipRole,
  courseId = 'summit-pines',
): DemoIdentity => ({
  uid,
  displayName,
  email: `${uid}@example.com`,
  emailVerified: true,
  mode: 'demo',
  platformAdmin: false,
  membership: role ? { courseId, role } : undefined,
});
export const demoIdentities = [
  demo('demo-golfer', 'Golfer Demo'),
  demo('summit-owner', 'Olivia Owner', 'course_owner'),
  demo('summit-manager', 'Morgan Manager', 'course_manager'),
  demo('summit-catalog', 'Casey Catalog', 'catalog_editor'),
  demo('summit-fulfillment', 'Frankie Fulfillment', 'fulfillment_staff'),
  demo('cedar-manager', 'Cameron Manager', 'course_manager', 'cedar-bend-muni'),
  demo('no-course-access', 'No Course Access'),
] as const;
const SESSION_KEY = 'gg.identity.v1';
export class DemoIdentityProvider implements IdentityProvider {
  private listeners = new Set<(state: IdentityState) => void>();
  private state: IdentityState = { status: 'signed_out' };
  constructor() {
    const uid = localStorage.getItem(SESSION_KEY);
    const user = demoIdentities.find((item) => item.uid === uid);
    if (user) this.state = { status: 'signed_in', user };
  }
  subscribe(callback: (state: IdentityState) => void) {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }
  async signInWithEmailAndPassword(email: string) {
    const user = demoIdentities.find((item) => item.email === email);
    if (!user)
      throw new Error('Choose one of the local demonstration identities.');
    localStorage.setItem(SESSION_KEY, user.uid);
    this.emit({ status: 'signed_in', user });
  }
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
    this.emit({ status: 'signed_out' });
  }
  private emit(state: IdentityState) {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }
}
class ConnectedIdentityProvider implements IdentityProvider {
  subscribe(callback: (state: IdentityState) => void) {
    callback({
      status: 'error',
      message: 'Course account sign-in is not configured for connected mode.',
    });
    return () => undefined;
  }
  async signInWithEmailAndPassword() {
    throw new Error('Connected account services are not configured.');
  }
  async signOut() {}
}
class EmulatorIdentityProvider implements IdentityProvider {
  private unsubscribe?: () => void;
  subscribe(callback: (state: IdentityState) => void) {
    callback({ status: 'loading' });
    void import('../firebase/client')
      .then(({ getFirebaseServices }) => getFirebaseServices())
      .then(async ({ auth }) => {
        const { onAuthStateChanged } = await import('firebase/auth');
        this.unsubscribe = onAuthStateChanged(
          auth,
          (user) =>
            callback(
              user
                ? {
                    status: 'signed_in',
                    user: {
                      uid: user.uid,
                      email: user.email ?? '',
                      displayName:
                        user.displayName ??
                        user.email?.split('@')[0] ??
                        'Course user',
                      emailVerified: user.emailVerified,
                      mode: 'emulator',
                      platformAdmin: false,
                    },
                  }
                : { status: 'signed_out' },
            ),
          () =>
            callback({
              status: 'error',
              message: 'Local authentication is unavailable.',
            }),
        );
      });
    return () => this.unsubscribe?.();
  }
  async signInWithEmailAndPassword(email: string, password: string) {
    const [{ auth }, { signInWithEmailAndPassword }] = await Promise.all([
      import('../firebase/client').then(({ getFirebaseServices }) =>
        getFirebaseServices(),
      ),
      import('firebase/auth'),
    ]);
    await signInWithEmailAndPassword(auth, email, password);
  }
  async signOut() {
    const [{ auth }, { signOut }] = await Promise.all([
      import('../firebase/client').then(({ getFirebaseServices }) =>
        getFirebaseServices(),
      ),
      import('firebase/auth'),
    ]);
    await signOut(auth);
  }
}
let provider: IdentityProvider;
export const getIdentityProvider = () =>
  (provider ??=
    environment.mode === 'demo'
      ? new DemoIdentityProvider()
      : environment.mode === 'emulator'
        ? new EmulatorIdentityProvider()
        : new ConnectedIdentityProvider());
