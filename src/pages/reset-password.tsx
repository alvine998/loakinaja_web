import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { hasResetPending, resetPassword } from '@/lib/db';

export default function ResetPassword() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const qIdentifier =
      typeof router.query.identifier === 'string' ? router.query.identifier : '';
    if (!qIdentifier || !hasResetPending(qIdentifier)) {
      router.replace('/forgot-password');
      return;
    }
    setIdentifier(qIdentifier);
    setReady(true);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(identifier, password);
      setSuccess(true);
      setSubmitting(false);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>Reset Password - LoakinAja</title>
      </Head>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Password Berhasil Diubah
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Silakan masuk kembali dengan password baru Anda.
              </p>
              <Link
                href="/login"
                className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-loak-blue hover:bg-loak-blue-dark transition-colors"
              >
                Masuk Sekarang
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-loak-light">
                  <KeyRound className="h-6 w-6 text-loak-blue" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Buat Password Baru
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Masukkan password baru untuk akun{' '}
                  <span className="font-medium text-gray-700">{identifier}</span>.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password Baru
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                    Konfirmasi Password Baru
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirm"
                      name="confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-loak-blue hover:bg-loak-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-loak-blue transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
