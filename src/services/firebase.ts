import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import type { UserPreferences } from '../types';
import { DEFAULT_NEWS_SOURCES } from './news';

// ============================================================
// FIREBASE CONFIGURATION
// Replace these values with your own Firebase project config.
// Go to https://console.firebase.google.com â your project â
// Project Settings â General â Your apps â Firebase SDK snippet
// ============================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isConfigured = false;

// Check if Firebase is properly configured
function checkConfig(): boolean {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    return false;
  }
  return true;
}

export function initFirebase() {
  if (app) return { app, auth: auth!, db: db!, isConfigured };

  isConfigured = checkConfig();
  if (!isConfigured) {
    console.warn('Firebase not configured. Running in demo mode. Update src/services/firebase.ts with your Firebase config.');
    return { app: null, auth: null, db: null, isConfigured: false };
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  return { app, auth, db, isConfigured: true };
}

export function getFirebaseAuth(): Auth | null {
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  return db;
}

export function isFirebaseConfigured(): boolean {
  return isConfigured;
}

// Auth methods
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  if (!auth) return;
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Preferences methods
const DEFAULT_PREFS: UserPreferences = {
  favorites: [],
  newsSources: DEFAULT_NEWS_SOURCES,
  defaultTab: 'all',
  refreshInterval: 60,
};

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  if (!db) return { ...DEFAULT_PREFS };
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_PREFS, ...docSnap.data() } as UserPreferences;
    }
    // Create default preferences
    await setDoc(docRef, DEFAULT_PREFS);
    return { ...DEFAULT_PREFS };
  } catch (err) {
    console.error('Failed to get user preferences:', err);
    return { ...DEFAULT_PREFS };
  }
}

export async function saveUserPreferences(userId: string, prefs: Partial<UserPreferences>) {
  if (!db) return;
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, prefs).catch(() => setDoc(docRef, { ...DEFAULT_PREFS, ...prefs }));
  } catch (err) {
    console.error('Failed to save user preferences:', err);
  }
}
