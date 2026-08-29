import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Coins, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { TOKEN_PACKAGES } from '@/lib/db';

export default function TokenPage() {
  const router = useRouter();
  const { user, loading, addTokens, refresh } = useAuth();
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/token');
    }
  }, [loading, user, router]);

  if (loading) {
    return <p className="text-center text-gray-500 py-20">Memuat...</p>;
  }

  if (!user) {
    return null;
  }

  const handleBuy = async (packageId: string) => {
    setError('');
    setSuccess('');
    setBuying(packageId);
    try {
      await addTokens(packageId);
      await refresh();
      const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId);
      setSuccess(`Berhasil! ${pkg?.tokens} token ditambahkan ke akun kamu.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBuying(null);
    }
  };

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <>
      <Head>
        <title>Beli Token - LoakinAja</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Beli Token</h1>
            <p className="text-sm text-gray-500 mt-1">
              Token digunakan untuk memasang iklan. <strong>1 token = 1 iklan</strong>.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-loak-light px-4 py-2 text-loak-blue-dark">
            <Coins className="h-5 w-5" />
            <span className="text-sm font-semibold">{user.tokens} token</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" /> {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TOKEN_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all ${
                pkg.popular
                  ? 'border-loak-blue ring-2 ring-loak-blue/30'
                  : 'border-gray-100'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-loak-blue px-3 py-1 text-xs font-semibold text-white">
                  Paling Hemat
                </span>
              )}
              <div className="mb-4 flex items-center justify-center h-14 w-14 mx-auto rounded-full bg-loak-light">
                <Coins className="h-7 w-7 text-loak-blue" />
              </div>
              <p className="text-center text-lg font-bold text-gray-900">
                {pkg.tokens} Token
              </p>
              <p className="text-center text-sm text-gray-500 mb-4">{pkg.label}</p>
              <p className="text-center text-2xl font-extrabold text-loak-blue mb-5">
                {fmt(pkg.price)}
              </p>
              <button
                onClick={() => handleBuy(pkg.id)}
                disabled={buying === pkg.id}
                className="mt-auto w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-loak-blue hover:bg-loak-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buying === pkg.id ? (
                  'Memproses...'
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Beli
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-loak-light px-6 py-6 text-center">
          <p className="text-sm text-gray-600">
            Baru daftar? Kamu sudah mendapatkan{' '}
            <strong>3 token gratis</strong> untuk mulai berjualan.
          </p>
          <Link
            href="/jual"
            className="mt-3 inline-block rounded-xl bg-loak-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-loak-blue-dark"
          >
            Mulai Pasang Iklan
          </Link>
        </div>
      </div>
    </>
  );
}
