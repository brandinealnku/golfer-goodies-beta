import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { environment } from '../config/environment';
import {
  emulatorPorts,
  getLocalFirebaseConfig,
  LOCAL_PROJECT_ID,
} from './config';
import type { FirebaseServices } from './types';
let services: FirebaseServices | undefined;
export async function getFirebaseServices(): Promise<FirebaseServices> {
  if (environment.mode !== 'emulator')
    throw new Error(
      environment.mode === 'connected'
        ? 'Connected mode is not configured.'
        : 'Firebase is unavailable in demo mode.',
    );
  if (services) return services;
  const app = getApps().length
    ? getApp()
    : initializeApp(getLocalFirebaseConfig());
  const auth = getAuth(app),
    firestore = getFirestore(app),
    functions = getFunctions(app),
    storage = getStorage(app);
  connectAuthEmulator(auth, `http://127.0.0.1:${emulatorPorts.auth}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(firestore, '127.0.0.1', emulatorPorts.firestore);
  connectFunctionsEmulator(functions, '127.0.0.1', emulatorPorts.functions);
  connectStorageEmulator(storage, '127.0.0.1', emulatorPorts.storage);
  services = {
    auth,
    firestore,
    functions,
    storage,
    projectId: LOCAL_PROJECT_ID,
  };
  return services;
}
