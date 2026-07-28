import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getIdentityProvider, type IdentityState } from './identity';
import { getMembershipsForUser } from '../management/demo-management';
import { environment } from '../config/environment';
import { getCourseManagementRepository } from '../management/course-management-repository';
import type { CourseMembership } from './authorization';
const Context = createContext<{
  state: IdentityState;
  memberships: CourseMembership[];
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);
export function IdentityProvider({ children }: { children: ReactNode }) {
  const identity = useMemo(getIdentityProvider, []);
  const [state, setState] = useState<IdentityState>({ status: 'loading' });
  useEffect(() => identity.subscribe(setState), [identity]);
  const [remoteMemberships, setRemoteMemberships] = useState<
    CourseMembership[]
  >([]);
  useEffect(() => {
    if (state.status !== 'signed_in' || environment.mode === 'demo') {
      setRemoteMemberships([]);
      return;
    }
    let live = true;
    void getCourseManagementRepository()
      .getMemberships(state.user)
      .then((items) => live && setRemoteMemberships(items))
      .catch(() => live && setRemoteMemberships([]));
    return () => {
      live = false;
    };
  }, [state]);
  const memberships =
    state.status === 'signed_in'
      ? environment.mode === 'demo'
        ? getMembershipsForUser(state.user)
        : remoteMemberships
      : [];
  return (
    <Context.Provider
      value={{
        state,
        memberships,
        signIn: (email, password = '') =>
          identity.signInWithEmailAndPassword(email, password),
        signOut: () => identity.signOut(),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useIdentity() {
  const value = useContext(Context);
  if (!value) throw new Error('IdentityProvider is required.');
  return value;
}
