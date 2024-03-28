// Import Firebase dependencies
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth,  } from 'firebase/auth';
import { getDatabase, ref, push } from "firebase/database";
import { getFirestore } from "firebase/firestore";


// Initialize Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlkGR7zopaTdoOkMR301pNoUIHwy1lqR8",
  authDomain: "sahukar-b823a.firebaseapp.com",
  databaseURL: "https://sahukar-b823a-default-rtdb.firebaseio.com",
  projectId: "sahukar-b823a",
  storageBucket: "sahukar-b823a.appspot.com",
  messagingSenderId: "16976379157",
  appId: "1:16976379157:web:6655596ed443267c4cbd1c"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const firestore = getFirestore(app);

// Get Realtime Database instance
const database = getDatabase(app);

// Get Firebase Auth instance
let auth;

// Check if Firebase Auth has already been initialized
try {
  auth = getAuth(app);
} catch (error) {
  if (error.code !== 'auth/not-initialized') {
    throw error;
  }
}

// If Firebase Auth hasn't been initialized, do so with AsyncStorage persistence
if (!auth) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

// Export Firebase authentication, database, and Firestore
export { auth, database, ref, push };
export const db = firestore;
