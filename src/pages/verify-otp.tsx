import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShieldCheck } from 'lucide-react';

export default function VerifyOtp() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) router.replace('/login');
  }, [router]);

  return (
    <>
      <Head>
        <title>Verifikasi OTP - LoakinAja</title>
      </Head>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-loak-light">
            <ShieldCheck className="h-6 w-6 text-loak-blue" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Verifikasi OTP belum tersedia</h1>
          <p className="mt-2 text-sm text-gray-500">
            Masuk langsung menggunakan email atau nomor telepon dan password.
          </p>
          <Link href="/login" className="mt-6 block rounded-lg bg-loak-blue px-4 py-3 text-sm font-bold text-white hover:bg-loak-blue-dark">
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </>
  );
}
