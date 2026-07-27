export const LOCAL_PROJECT_ID = 'golfer-goodies-local' as const;
export const emulatorPorts = {
  auth: 9099,
  firestore: 8080,
  functions: 5001,
  storage: 9199,
  hosting: 5000,
  ui: 4000,
} as const;
export function getLocalFirebaseConfig() {
  const projectId =
    import.meta.env.VITE_FIREBASE_PROJECT_ID || LOCAL_PROJECT_ID;
  if (projectId !== LOCAL_PROJECT_ID)
    throw new Error('Emulator mode requires the local-only project ID.');
  return {
    apiKey: 'local-emulator-only',
    authDomain: `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: `${projectId}.firebasestorage.app`,
    appId: '1:000000000000:web:localemulatoronly',
  };
}
