import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MailSearch } from 'lucide-react';

export default function ForgotPassword() {
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
              Reset password melalui OTP belum tersedia. Hubungi dukungan LoakinAja
              untuk bantuan mengatur ulang password.
            </p>
          </div>

          <div className="space-y-6">
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
                  disabled
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                  placeholder="Reset OTP belum tersedia"
                />
              </div>
            </div>

            <div>
              <button
                  type="button"
                  disabled
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-400 cursor-not-allowed"
                >
                  Fitur Belum Tersedia
              </button>
            </div>
          </div>

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
