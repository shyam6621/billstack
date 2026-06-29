import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authService } from '@/services/authService';

export type AppRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  createdAt?: string;
}

interface JwtPayload {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  role: AppRole | null;
  id: string | null;
  email: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<User | null>;
  signIn: (email: string, password: string, expectedRole?: AppRole) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const TOKEN_KEY = 'billstack_token';
const USER_KEY = 'billstack_user';
const LEGACY_TOKEN_KEY = 'jwt_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeRole(role: unknown): AppRole | null {
  if (typeof role !== 'string') return null;
  const normalized = role.toUpperCase();
  return normalized === 'ADMIN' || normalized === 'USER' ? normalized : null;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload | null): boolean {
  return Boolean(payload?.exp && payload.exp * 1000 <= Date.now());
}

function normalizeUser(raw: unknown, token?: string): User | null {
  const data = (raw ?? {}) as Partial<User> & { user?: Partial<User> };
  const source = data.user ?? data;
  const payload = token ? decodeJwt(token) : null;
  const role = normalizeRole(source.role ?? payload?.role);
  const email = source.email ?? payload?.email ?? payload?.sub;
  const id = source.id ?? payload?.id;

  if (!role || !email || !id) return null;

  return {
    id: String(id),
    email: String(email),
    name: String(source.name ?? payload?.name ?? email),
    role,
    createdAt: source.createdAt,
  };
}

function persistSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function readStoredSession(): { token: string; user: User } | null {
  const token = localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);
  if (!token) return null;

  const payload = decodeJwt(token);
  if (isExpired(payload)) {
    clearSession();
    return null;
  }

  const storedUser = localStorage.getItem(USER_KEY);
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const user = normalizeUser(parsedUser, token) ?? normalizeUser(payload, token);
  return user ? { token, user } : null;
}

export function getDashboardPath(role: AppRole) {
  return role === 'ADMIN' ? '/admin' : '/dashboard';
}

export function getLoginPath(role: AppRole) {
  return role === 'ADMIN' ? '/login/admin' : '/login/user';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((nextToken: string, nextUser: User) => {
    persistSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const storedSession = readStoredSession();
    if (storedSession) {
      setToken(storedSession.token);
      setUser(storedSession.user);
    }
    setLoading(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const response = await authService.register(email, password, name);
    const nextToken = response?.token;
    const nextUser = nextToken ? normalizeUser(response, nextToken) : null;

    if (!nextToken || !nextUser) return null;
    applySession(nextToken, nextUser);
    return nextUser;
  }, [applySession]);

  const signIn = useCallback(async (email: string, password: string, expectedRole?: AppRole) => {
    const response = await authService.login(email, password);
    const nextToken = response?.token;
    const nextUser = nextToken ? normalizeUser(response, nextToken) : null;

    if (!nextToken || !nextUser) return null;
    if (expectedRole && nextUser.role !== expectedRole) {
      clearSession();
      throw new Error(`This account is registered as ${nextUser.role}. Please use the correct portal.`);
    }

    applySession(nextToken, nextUser);
    return nextUser;
  }, [applySession]);

  const signOut = async () => {
    await authService.logout();
    clearSession();
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextType>(() => ({
    token,
    user,
    role: user?.role ?? null,
    id: user?.id ?? null,
    email: user?.email ?? null,
    loading,
    signUp,
    signIn,
    signOut,
  }), [loading, signIn, signUp, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
