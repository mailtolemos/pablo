import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  initFirebase,
  onAuthChange,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getUserPreferences,
  saveUserPreferences,
  isFirebaseConfigured,
} from '../services/firebase';
import type { UserPreferences, NewsSource } from '../types';
import { DEFAULT_NEWS_SOURCES } from '../services/news';

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | DemoUser | null;
  preferences: UserPreferences;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (method: 'google' | 'email', email?: string, password?: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (assetId: string) => void;
  updateNewsSources: (sources: NewsSource[]) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const DEFAULT_PREFS: UserPreferences = {
  favorites: [],
  newsSources: DEFAULT_NEWS_SOURCES,
  defaultTab: 'all',
  refreshInterval: 60,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const { isConfigured } = initFirebase();

    if (!isConfigured) {
      setIsDemoMode(true);
      setIsLoading(false);
      // Load demo preferences from localStorage
      try {
        const saved = localStorage.getItem('pablo_demo_prefs');
        if (saved) setPreferences(JSON.parse(saved));
        const savedUser = localStorage.getItem('pablo_demo_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {}
      return;
    }

    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const prefs = await getUserPreferences(firebaseUser.uid);
        setPreferences(prefs);
      } else {
        setPreferences(DEFAULT_PREFS);
      }
      setIsLoading(false);
    });

    return unsub;
  }, []);

  const login = async (method: 'google' | 'email', email?: string, password?: string) => {
    if (isDemoMode) {
      const demoUser: DemoUser = {
        uid: 'demo-' + Date.now(),
        email: email || 'trader@pablo.io',
        displayName: email?.split('@')[0] || 'Trader',
        photoURL: null,
      };
      setUser(demoUser);
      localStorage.setItem('pablo_demo_user', JSON.stringify(demoUser));
      return;
    }
    if (method === 'google') {
      await signInWithGoogle();
    } else if (email && password) {
      await signInWithEmail(email, password);
    }
  };

  const signup = async (email: string, password: string) => {
    if (isDemoMode) {
      return login('email', email, password);
    }
    await signUpWithEmail(email, password);
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      setPreferences(DEFAULT_PREFS);
      localStorage.removeItem('pablo_demo_user');
      localStorage.removeItem('pablo_demo_prefs');
      return;
    }
    await signOut();
  };

  const persistPrefs = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    if (isDemoMode) {
      localStorage.setItem('pablo_demo_prefs', JSON.stringify(newPrefs));
    } else if (user) {
      saveUserPreferences(user.uid, newPrefs);
    }
  };

  const toggleFavorite = (assetId: string) => {
    const newFavs = preferences.favorites.includes(assetId)
      ? preferences.favorites.filter(f => f !== assetId)
      : [...preferences.favorites, assetId];
    persistPrefs({ ...preferences, favorites: newFavs });
  };

  const updateNewsSources = (sources: NewsSource[]) => {
    persistPrefs({ ...preferences, newsSources: sources });
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    persistPrefs({ ...preferences, ...prefs });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        isLoading,
        isDemoMode,
        login,
        signup,
        logout,
        toggleFavorite,
        updateNewsSources,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
