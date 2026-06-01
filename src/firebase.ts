import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Defined configuration with direct fallback as specified in user guidelines
const config = {
  apiKey: firebaseConfig.apiKey || "AIzaSyBrAw40jQ4278dxs3coSoSOYSEkIzXaVXo",
  authDomain: firebaseConfig.authDomain || "gen-lang-client-0540857696.firebaseapp.com",
  projectId: firebaseConfig.projectId || "gen-lang-client-0540857696",
  storageBucket: firebaseConfig.storageBucket || "gen-lang-client-0540857696.firebasestorage.app",
  messagingSenderId: firebaseConfig.messagingSenderId || "271648695252",
  appId: firebaseConfig.appId || "1:271648695252:web:ead338afdd2cdd17d86c41"
};

// Initialize the Firebase configuration
const app = initializeApp(config);

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app);

export { app, db, realtimeDb, auth, storage };

// Operational types for structured permission error messages
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Cleanly catches Firestore exceptions and packs permission errors into an informative JSON string.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Dry run connection verify as required in Firebase specifications
async function testConnection() {
  try {
    // Only attempt the call if the project has been fully set up with active configuration
    if (config.apiKey && config.apiKey !== 'placeholder-api-key') {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration. The Firestore client appears to be offline.");
    }
  }
}

testConnection();
