'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const createFirebaseApp = (): FirebaseApp => {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('[firebase] Missing Firebase configuration. Check NEXT_PUBLIC_FIREBASE_* env vars.');
  }

  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }

  return getApp();
};

const app = createFirebaseApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

type EmulatorConfig = {
  host: string;
  port: number;
};

const authEmulator: EmulatorConfig = { host: 'localhost', port: 9099 };
const firestoreEmulator: EmulatorConfig = { host: 'localhost', port: 8080 };

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  if (!auth.emulatorConfig) {
    connectAuthEmulator(auth, `http://${authEmulator.host}:${authEmulator.port}`, {
      disableWarnings: true,
    });
  }

  connectFirestoreEmulator(db, firestoreEmulator.host, firestoreEmulator.port);
}
