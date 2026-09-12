import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Coins,
  Info,
  Store,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  createTokenOrder,
  getPaymentMethod,
  PAYMENT_METHODS,
  PRICE_PER_TOKEN,
  TOKEN_PACKAGES,
} from '@/lib/db';
import { formatRupiah } from '@/lib/format';

function GroupIcon({ group }: { group: string }) {
  if (group === 'Virtual Account') {
    return <Building2 className="h-4 w-4" />;
  }
  if (group === 'E-Wallet') {
    return <Wallet className="h-4 w-4" />;
  }
  return <Store className="h-4 w-4" />;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [packageId, setPackageId] = useState('');
  const [ready, setReady] = useState(false);
  const [methodId, setMethodId] = useState(PAYMENT_METHODS[0].id);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/token');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!router.isReady) return;
    setPackageId(
      typeof router.query.package === 'string' ? router.query.package : ''
    );
    setReady(true);
  }, [router]);

  if (loading) {
    return <p className="text-center text-gray-500 py-20">Memuat...</p>;
  }

  if (!user || !ready) {
    return null;
  }

  const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId);

  if (!pkg) {
    return (
      <>
        <Head>
          <title>Pembayaran - LoakinAja</title>
        </Head>
        <div className="max-w-md mx-auto my-8 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Paket token tidak ditemukan</h1>
          <p className="mt-2 text-sm text-gray-500">
            Pilih salah satu paket token untuk melanjutkan pembayaran.
          </p>
          <Link
            href="/token"
            className="mt-6 inline-block w-full rounded-xl bg-loak-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-loak-blue-dark"
          >
            Kembali ke Beli Token
          </Link>
        </div>
      </>
    );
  }

  const amount = pkg.tokens * PRICE_PER_TOKEN;
  const method = getPaymentMethod(methodId);
  const groups = PAYMENT_METHODS.reduce<Record<string, typeof PAYMENT_METHODS>>(
    (acc, m) => {
      acc[m.group] = [...(acc[m.group] ?? []), m];
      return acc;
    },
    {}
  );

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const order = await createTokenOrder(pkg.id, methodId);
      router.push(`/payment?order=${encodeURIComponent(order.id)}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pembayaran Token - LoakinAja</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        <Link
          href="/token"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-loak-blue"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Pembayaran</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pilih metode pembayaran, lalu selesaikan pembayaran sesuai nominal.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold text-gray-900">Metode Pembayaran</h2>

            {Object.entries(groups).map(([group, methods]) => (
              <div key={group}>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <GroupIcon group={group} /> {group}
                </p>
                <div className="space-y-2">
                  {methods.map((m) => {
                    const selected = m.id === methodId;
                    return (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          selected
                            ? 'border-loak-blue bg-loak-light'
                            : 'border-gray-200 hover:border-loak-blue/50 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={m.id}
                          checked={selected}
                          onChange={() => setMethodId(m.id)}
                          className="h-4 w-4 shrink-0 accent-loak-blue"
                        />
                        <span className="min-w-0 flex-1 text-sm font-medium text-gray-800">
                          {m.label}
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0 text-loak-blue" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24" aria-label="Ringkasan pesanan">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-bold text-gray-900">Ringkasan Pesanan</h2>

              <div className="mt-4 flex items-start gap-3 rounded-xl bg-loak-light p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                  <Coins className="h-5 w-5 text-loak-blue" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {pkg.tokens} Token · {pkg.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    1 token = {formatRupiah(PRICE_PER_TOKEN)}
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Harga token</dt>
                  <dd className="text-right text-gray-800">
                    {pkg.tokens} × {formatRupiah(PRICE_PER_TOKEN)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Metode pembayaran</dt>
                  <dd className="text-right text-gray-800">{method?.label ?? '-'}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
                  <dt className="font-bold text-gray-900">Total</dt>
                  <dd className="text-right text-lg font-extrabold text-loak-blue">
                    {formatRupiah(amount)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-5 w-full rounded-xl bg-loak-blue px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
              >
                {submitting ? 'Membuat pesanan...' : 'Bayar Sekarang'}
              </button>

              <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-gray-400">
                <Info className="h-4 w-4 shrink-0" />
                Kode pembayaran akan dibuat setelah kamu menekan Bayar Sekarang. Token
                otomatis ditambahkan ke akun setelah pembayaran berhasil.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
