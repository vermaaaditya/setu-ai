import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Real Firebase config for Setu.AI
const firebaseConfig = {
  apiKey: "AIzaSyBsVnRLBiz482WhnA_1wnSu0Utk7k-rvYo",
  authDomain: "setuai-4a43e.firebaseapp.com",
  projectId: "setuai-4a43e",
  storageBucket: "setuai-4a43e.firebasestorage.app",
  messagingSenderId: "50351025513",
  appId: "1:50351025513:web:cfd001ed88bd578dae21f8",
  measurementId: "G-HSND37RY55"
};

// Initialize Firebase only if we have a config (or gracefully fail for the prototype)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
