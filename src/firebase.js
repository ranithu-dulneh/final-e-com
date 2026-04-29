import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl10u26UIlQc82BNJNILwCUWfIXqa5854",
  authDomain: "luxe-2a0f1.firebaseapp.com",
  databaseURL: "https://luxe-2a0f1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "luxe-2a0f1",
  storageBucket: "luxe-2a0f1.firebasestorage.app",
  messagingSenderId: "871576437088",
  appId: "1:871576437088:web:9a2f732f0f28df39241e05",
  measurementId: "G-ZPH7116G6C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
