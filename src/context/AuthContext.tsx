import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  buyTokens as dbBuyTokens,
} from '@/lib/db';

type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tokens: number;
  createdAt: string;
};

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<PublicUser>;
  login: (email: string, password: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  addTokens: (packageId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const current = await getCurrentUser();
    setUser(current);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const register = useCallback(async (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const u = await registerUser(input);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await loginUser(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const addTokens = useCallback(async (packageId: string) => {
    const u = await dbBuyTokens(packageId);
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, refresh, addTokens }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
