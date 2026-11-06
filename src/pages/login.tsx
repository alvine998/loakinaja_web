import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiUrl, clearAuthToken, saveAuthToken } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const { login, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('google_token');
    if (!token) return;

    const next = params.get('next') || '/';
    window.history.replaceState({}, '', window.location.pathname + window.location.search);
    saveAuthToken(token);
    setSubmitting(true);
    refresh()
      .then((user) => {
        if (!user) {
          clearAuthToken();
          throw new Error('Tidak dapat memverifikasi sesi Google. Silakan coba lagi.');
        }
        return router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/');
      })
      .catch((err) => {
        setError((err as Error).message);
        setSubmitting(false);
      });
  }, [refresh, router]);

  useEffect(() => {
    if (router.query.error === 'google_auth_failed') {
      setError('Masuk dengan Google gagal. Silakan coba lagi.');
    }
  }, [router.query.error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const next = (router.query.next as string) || '/';
      router.push(next);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Masuk - LoakinAja</title>
      </Head>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Masuk</h2>
            <p className="text-sm text-gray-500 mt-2">
              Belum punya akun?{' '}
              <Link href="/register" className="font-medium text-loak-blue hover:text-loak-blue-dark">
                Daftar sekarang
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email / Nomor Telepon
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                  placeholder="Contoh: email@loakinaja.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-loak-blue hover:text-loak-blue-dark">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-loak-blue rounded-r-lg"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-loak-blue hover:bg-loak-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-loak-blue transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Masuk'}
                </button>
              </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Atau masuk dengan</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href={apiUrl(`/auth/google?next=${encodeURIComponent((router.query.next as string) || '/')}`)}
                className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-loak-blue"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.85Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.87-3c-1.08.72-2.46 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.25v3.09A12 12 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.25 14.26a7.2 7.2 0 0 1 0-4.52V6.65H1.25a12 12 0 0 0 0 10.7l4-3.09Z" />
                  <path fill="#EA4335" d="M12 4.77c1.77 0 3.36.61 4.61 1.81l3.45-3.45C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.25 6.65l4 3.09c.95-2.85 3.61-4.97 6.75-4.97Z" />
                </svg>
                Masuk dengan Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
