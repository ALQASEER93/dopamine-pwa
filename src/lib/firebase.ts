
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

let messagingPromise: Promise<Messaging | null> | null = null;

export function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      if (!(await isSupported())) return null;
      const app = getFirebaseApp();
      return getMessaging(app);
    })();
  }
  return messagingPromise;
}
