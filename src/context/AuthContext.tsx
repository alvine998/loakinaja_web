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
} from '@/lib/db';

type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tokens: number;
  createdAt: string;
  referralCode?: string;
  referredBy?: string;
};

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    referralCode?: string;
  }) => Promise<PublicUser>;
  login: (email: string, password: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
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
    referralCode?: string;
  }) => {
    const u = await registerUser(input);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await loginUser(email, password);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, refresh }}
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
