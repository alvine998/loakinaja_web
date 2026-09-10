import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, MailSearch } from 'lucide-react';
import { requestPasswordReset } from '@/lib/db';

export default function ForgotPassword() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await requestPasswordReset(identifier);
      router.push(
        `/verify-otp?identifier=${encodeURIComponent(res.identifier)}&purpose=reset`
      );
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Lupa Password - LoakinAja</title>
      </Head>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-loak-light">
              <MailSearch className="h-6 w-6 text-loak-blue" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Lupa Password
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Masukkan Email / Nomor Telepon akun Anda. Kami akan mengirimkan
              kode OTP untuk verifikasi.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email / Nomor Telepon
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                  placeholder="Contoh: email@loakinaja.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-loak-blue hover:bg-loak-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-loak-blue transition-colors disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Kirim Kode OTP'}
              </button>
            </div>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Ingat password Anda?{' '}
            <Link href="/login" className="font-medium text-loak-blue hover:text-loak-blue-dark">
              Kembali Masuk
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
