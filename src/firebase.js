import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl10u26UIlQc82BNJNILwCUWfIXqa5854",
  authDomain: "luxe-2a0f1.firebaseapp.com",
  databaseURL: "https://luxe-2a0f1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "luxe-2a0f1",
  storageBucket: "luxe-2a0f1.firebasestorage.app",
  messagingSenderId: "871576437088",
  appId: "1:871576437088:web:9a2f732f0f28df39241e05"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
