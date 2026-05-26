import { createContext, useContext, useState, type ReactNode } from 'react';
import { dummyUser, type DummyUser } from '../data/dummyData';

interface AuthContextType {
  isAuthenticated: boolean;
  user: DummyUser | null;
  login: (email: string, password: string) => void;
  register: (firstName: string, lastName: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<DummyUser | null>(null);

  const login = (_email: string, _password: string) => {
    // TODO: Später durch echten API-Call ersetzen
    setUser(dummyUser);
    setIsAuthenticated(true);
  };

  const register = (firstName: string, lastName: string, email: string, _password: string) => {
    // TODO: Später durch echten API-Call ersetzen
    setUser({ ...dummyUser, firstName, lastName, email });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
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
