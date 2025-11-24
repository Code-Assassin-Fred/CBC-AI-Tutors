import * as admin from "firebase-admin";

// Initialize once per server process
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
  }
  
  console.log('[firebaseAdmin] Initializing Firebase Admin SDK:', {
    projectId,
    clientEmail,
    hasPrivateKey: !!privateKey,
  });
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  
  console.log('[firebaseAdmin] Firebase Admin SDK initialized successfully');
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
// Ignore undefined fields in writes to avoid Firestore validation errors
// This must be set before any Firestore operations are performed.
try {
  // settings() is available in the Firestore Admin SDK via @google-cloud/firestore
  const dbWithSettings = adminDb as unknown as {
    settings?: (settings: { ignoreUndefinedProperties: boolean }) => void;
  };
  dbWithSettings.settings?.({ ignoreUndefinedProperties: true });
} catch {
  // No-op: if settings isn't available, we'll rely on callers to avoid undefineds
}
export const FieldValue = admin.firestore.FieldValue;