import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/authService';

export type AppRole = 'admin' | 'user';

export interface User {
  id: number;
  email: string;
  name: string;
  role: AppRole;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
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
    await authService.register(email, password, name);
    // After register, optionally sign them in or wait for them to log in
  };

  const signIn = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    if (response && response.user) {
      setUser(response.user);
      setRole(response.user.role ? (response.user.role.toLowerCase() as AppRole) : null);
    }
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
