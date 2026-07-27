import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Functions } from 'firebase/functions';
import type { FirebaseStorage } from 'firebase/storage';
export interface FirebaseServices {
  auth: Auth;
  firestore: Firestore;
  functions: Functions;
  storage: FirebaseStorage;
  projectId: 'golfer-goodies-local';
}
