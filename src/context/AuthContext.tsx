import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
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
} from '../services/firebase';
import type { UserPreferences, NewsSource, DashboardWidget } from '../types';
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
  updateDashboardWidgets: (widgets: DashboardWidget[]) => void;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'favorites', type: 'favorites', position: 0, visible: true },
  { id: 'feargreed', type: 'feargreed', position: 1, visible: true },
  { id: 'topmovers', type: 'topmovers', position: 2, visible: true },
  { id: 'news', type: 'news', position: 3, visible: true },
  { id: 'quickstats', type: 'quickstats', position: 4, visible: true },
];

const DEFAULT_PREFS: UserPreferences = {
  favorites: [],
  newsSources: DEFAULT_NEWS_SOURCES,
  defaultTab: 'dashboard',
  refreshInterval: 60,
  dashboardWidgets: DEFAULT_WIDGETS,
  pinnedAssets: [],
};

const AuthContext = createContext<AuthContextType | null>(null);

// Rate limit helper - prevent rapid save calls
function createThrottledSave(delay: number) {
  let timer: number | null = null;
  return (fn: () => void) => {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(fn, delay);
  };
}

const throttledSave = createThrottledSave(500);

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
      try {
        const saved = localStorage.getItem('pablo_demo_prefs');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPreferences({ ...DEFAULT_PREFS, ...parsed });
        }
        const savedUser = localStorage.getItem('pablo_demo_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {
        // Ignore corrupted localStorage
      }
      return;
    }

    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const prefs = await getUserPreferences(firebaseUser.uid);
        setPreferences({ ...DEFAULT_PREFS, ...prefs });
      } else {
        setPreferences(DEFAULT_PREFS);
      }
      setIsLoading(false);
    });

    return unsub;
  }, []);

  const persistPrefs = useCallback((newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    throttledSave(() => {
      if (isDemoMode) {
        try {
          localStorage.setItem('pablo_demo_prefs', JSON.stringify(newPrefs));
        } catch {
          // localStorage full or unavailable
        }
      } else if (user) {
        saveUserPreferences(user.uid, newPrefs);
      }
    });
  }, [isDemoMode, user]);

  const login = useCallback(async (method: 'google' | 'email', email?: string, password?: string) => {
    if (isDemoMode) {
      // Sanitize email input
      const cleanEmail = (email || 'trader@pablo.io').replace(/[<>'"]/g, '');
      const demoUser: DemoUser = {
        uid: 'demo-' + Date.now(),
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0] || 'Trader',
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
  }, [isDemoMode]);

  const signup = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      return login('email', email, password);
    }
    await signUpWithEmail(email, password);
  }, [isDemoMode, login]);

  const logout = useCallback(async () => {
    if (isDemoMode) {
      setUser(null);
      setPreferences(DEFAULT_PREFS);
      localStorage.removeItem('pablo_demo_user');
      localStorage.removeItem('pablo_demo_prefs');
      return;
    }
    await signOut();
  }, [isDemoMode]);

  const toggleFavorite = useCallback((assetId: string) => {
    setPreferences(prev => {
      const newFavs = prev.favorites.includes(assetId)
        ? prev.favorites.filter(f => f !== assetId)
        : [...prev.favorites, assetId];
      const newPrefs = { ...prev, favorites: newFavs };
      throttledSave(() => {
        if (isDemoMode) {
          try { localStorage.setItem('pablo_demo_prefs', JSON.stringify(newPrefs)); } catch {}
        } else if (user) {
          saveUserPreferences(user.uid, newPrefs);
        }
      });
      return newPrefs;
    });
  }, [isDemoMode, user]);

  const updateNewsSources = useCallback((sources: NewsSource[]) => {
    persistPrefs({ ...preferences, newsSources: sources });
  }, [preferences, persistPrefs]);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    persistPrefs({ ...preferences, ...prefs });
  }, [preferences, persistPrefs]);

  const updateDashboardWidgets = useCallback((widgets: DashboardWidget[]) => {
    persistPrefs({ ...preferences, dashboardWidgets: widgets });
  }, [preferences, persistPrefs]);

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
        updateDashboardWidgets,
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
