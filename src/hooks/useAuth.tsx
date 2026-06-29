import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/authService';

export type AppRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const response = await authService.getCurrentUser();
      const currentUser = response?.user ? response.user : response;

      if (currentUser && currentUser.email) {
        setUser(currentUser);
        setRole(currentUser.role ? (currentUser.role.toLowerCase() as AppRole) : null);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch (error) {
      console.error('Failed to authenticate:', error);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const response = await authService.register(email, password, name);
    let currentUser: User | null = null;

    if (response?.token) {
      localStorage.setItem('jwt_token', response.token);
      currentUser = response.user ?? response;
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        setRole(currentUser.role ? (currentUser.role.toLowerCase() as AppRole) : null);
      }
    }

    return currentUser;
  };

  const signIn = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const currentUser = response.user ?? response;
    if (currentUser && currentUser.email) {
      setUser(currentUser);
      setRole(currentUser.role ? (currentUser.role.toLowerCase() as AppRole) : null);
      return currentUser;
    }
    return null;
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
