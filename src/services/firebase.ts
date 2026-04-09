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
// Replace these values with your own Firebase project config
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

function checkConfig(): boolean {
  return firebaseConfig.apiKey !== "YOUR_API_KEY";
}

export function initFirebase() {
  if (app) return { app, auth: auth!, db: db!, isConfigured };

  isConfigured = checkConfig();
  if (!isConfigured) {
    console.warn('[Pablo] Firebase not configured. Running in demo mode.');
    return { app: null, auth: null, db: null, isConfigured: false };
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  return { app, auth, db, isConfigured: true };
}

export function isFirebaseConfigured(): boolean {
  return isConfigured;
}

// ============================================================
// RATE LIMITING
// ============================================================
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(action: string, maxPerMinute: number = 10): boolean {
  const now = Date.now();
  const limit = rateLimits.get(action);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(action, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= maxPerMinute) {
    return false;
  }

  limit.count++;
  return true;
}

// ============================================================
// AUTH METHODS
// ============================================================
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured');
  if (!checkRateLimit('auth', 5)) throw new Error('Too many attempts. Please wait a moment.');
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  if (!checkRateLimit('auth', 5)) throw new Error('Too many attempts. Please wait a moment.');

  // Input validation
  if (!email || !password) throw new Error('Email and password are required');
  if (email.length > 254) throw new Error('Invalid email address');
  if (password.length > 128) throw new Error('Password too long');

  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  if (!checkRateLimit('auth', 3)) throw new Error('Too many attempts. Please wait a moment.');

  // Input validation
  if (!email || !password) throw new Error('Email and password are required');
  if (email.length > 254) throw new Error('Invalid email address');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');
  if (password.length > 128) throw new Error('Password too long');
  if (!/[A-Z]/.test(password)) throw new Error('Password must contain an uppercase letter');
  if (!/[0-9]/.test(password)) throw new Error('Password must contain a number');

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

// ============================================================
// PREFERENCES
// ============================================================
const DEFAULT_PREFS: UserPreferences = {
  favorites: [],
  newsSources: DEFAULT_NEWS_SOURCES,
  defaultTab: 'dashboard',
  refreshInterval: 60,
  dashboardWidgets: [],
  pinnedAssets: [],
};

// Sanitize preferences to prevent injection
function sanitizePrefs(prefs: any): Partial<UserPreferences> {
  const clean: Partial<UserPreferences> = {};

  if (Array.isArray(prefs.favorites)) {
    clean.favorites = prefs.favorites.filter((f: any) => typeof f === 'string' && f.length < 100).slice(0, 200);
  }
  if (Array.isArray(prefs.newsSources)) {
    clean.newsSources = prefs.newsSources.filter((s: any) =>
      typeof s.id === 'string' && typeof s.name === 'string' && typeof s.url === 'string'
    ).slice(0, 50);
  }
  if (typeof prefs.defaultTab === 'string') {
    clean.defaultTab = prefs.defaultTab;
  }
  if (typeof prefs.refreshInterval === 'number' && prefs.refreshInterval >= 10 && prefs.refreshInterval <= 600) {
    clean.refreshInterval = prefs.refreshInterval;
  }
  if (Array.isArray(prefs.dashboardWidgets)) {
    clean.dashboardWidgets = prefs.dashboardWidgets.slice(0, 20);
  }
  if (Array.isArray(prefs.pinnedAssets)) {
    clean.pinnedAssets = prefs.pinnedAssets.filter((p: any) => typeof p === 'string').slice(0, 50);
  }

  return clean;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  if (!db) return { ...DEFAULT_PREFS };
  if (!checkRateLimit('prefs-read', 20)) return { ...DEFAULT_PREFS };

  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = sanitizePrefs(docSnap.data());
      return { ...DEFAULT_PREFS, ...data };
    }
    await setDoc(docRef, DEFAULT_PREFS);
    return { ...DEFAULT_PREFS };
  } catch (err) {
    console.error('[Pablo] Failed to get user preferences:', err);
    return { ...DEFAULT_PREFS };
  }
}

export async function saveUserPreferences(userId: string, prefs: Partial<UserPreferences>) {
  if (!db) return;
  if (!checkRateLimit('prefs-write', 10)) return;

  const sanitized = sanitizePrefs(prefs);

  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, sanitized).catch(() => setDoc(docRef, { ...DEFAULT_PREFS, ...sanitized }));
  } catch (err) {
    console.error('[Pablo] Failed to save user preferences:', err);
  }
}
