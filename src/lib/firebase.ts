import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: paste your real Firebase config here
const firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "PLACEHOLDER_AUTH_DOMAIN",
  projectId: "PLACEHOLDER_PROJECT_ID",
  storageBucket: "PLACEHOLDER_STORAGE_BUCKET",
  messagingSenderId: "PLACEHOLDER_MESSAGING_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID"
};

// Initialize Firebase only if we have a config (or gracefully fail for the prototype)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
