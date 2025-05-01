import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function testFirestoreConnection() {
  if (!auth.currentUser) {
    console.error('❌ Firestore connection failed: No authenticated user');
    return false;
  }

  try {
    const testDoc = await addDoc(collection(db, 'test'), {
      timestamp: new Date(),
      userId: auth.currentUser.uid  // Add user ID for permission check
    });
    await deleteDoc(testDoc);
    console.log('✅ Firestore connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
}
