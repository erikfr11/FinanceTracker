import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type DummyUser } from '../data/dummyData';
import { API_BASE_URL, getStoredToken, setStoredToken, removeStoredToken, fetchWithAuth } from '../services/api';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  preferredCurrency: string;
  isPremiumUser: boolean;
  isAdmin: boolean;
  avatarUrl?: string;
  createdAtUtc?: string;
  lastLoginAtUtc?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: (DummyUser & { isAdmin?: boolean }) | AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<(DummyUser & { isAdmin?: boolean }) | AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Try our custom endpoint first for full user details & role
      const meRes = await fetchWithAuth('/api/users/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser({
          id: meData.id,
          firstName: meData.firstName || meData.email.split('@')[0],
          lastName: meData.lastName || 'User',
          email: meData.email,
          preferredCurrency: meData.preferredCurrency || 'EUR',
          isPremiumUser: meData.isPremiumUser ?? true,
          isAdmin: meData.isAdmin ?? false,
          createdAtUtc: meData.createdAtUtc,
          lastLoginAtUtc: meData.lastLoginAtUtc,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        });
        setIsAuthenticated(true);
      } else {
        // Fallback to /manage/info
        const res = await fetchWithAuth('/manage/info');
        if (res.ok) {
          const info = await res.json();
          const parts = (info.email || '').split('@');
          const defaultName = parts[0] || 'Admin';
          const isAdminUser = info.email?.toLowerCase().includes('admin');
          setUser({
            id: info.id || '1',
            firstName: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
            lastName: 'User',
            email: info.email,
            preferredCurrency: 'EUR',
            isPremiumUser: true,
            isAdmin: isAdminUser,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          });
          setIsAuthenticated(true);
        } else {
          removeStoredToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch {
      removeStoredToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let errorMsg = 'Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.';
      try {
        const data = await res.json();
        if (data.detail) errorMsg = data.detail;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    if (data.accessToken) {
      setStoredToken(data.accessToken);
      await fetchCurrentUser();
    }
  };

  const register = async (_firstName: string, _lastName: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error('Registrierung fehlgeschlagen.');
    }

    await login(email, password);
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
