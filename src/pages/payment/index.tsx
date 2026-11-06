import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AlertCircle,
  Clock,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getTokenOrder,
  verifyTokenOrder,
  TokenOrder,
} from '@/lib/db';
import { formatCountdown, formatRupiah } from '@/lib/format';

const POLL_INTERVAL_MS = 30000;

export default function WaitingPaymentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [orderId, setOrderId] = useState('');
  const [ready, setReady] = useState(false);
  const [order, setOrder] = useState<TokenOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const expired = order ? Date.parse(order.expiresAt) <= now : false;

  const syncOrder = useCallback(async () => {
    try {
      const found = await verifyTokenOrder(orderId);
      setError('');
      setOrder(found);
    } catch (verificationError) {
      setError((verificationError as Error).message);
      try {
        const found = await getTokenOrder(orderId);
        if (!found) {
          setNotFound(true);
          return;
        }
        setOrder(found);
      } catch (orderError) {
        setError((orderError as Error).message);
      }
    }
  }, [orderId]);

  useEffect(() => {
    if (!loading && !user) {
      const next = `/payment?order=${encodeURIComponent(String(router.query.order || ''))}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [loading, user, router, router.query.order]);

  useEffect(() => {
    if (!router.isReady) return;
    setOrderId(typeof router.query.order === 'string' ? router.query.order : '');
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready || !user) return;
    if (!orderId) {
      setNotFound(true);
      return;
    }
    syncOrder();
  }, [ready, user, orderId, syncOrder]);

  useEffect(() => {
    if (!ready || !user || !orderId) return;
    const timer = setInterval(syncOrder, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ready, user, orderId, syncOrder]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Leaving the pending state always ends on one of the two result pages.
  useEffect(() => {
    if (!order) return;
    if (order.status === 'paid') {
      router.replace(`/payment/success?order=${encodeURIComponent(order.id)}`);
    } else if (order.status === 'failed' || order.status === 'expired') {
      router.replace(`/payment/failed?order=${encodeURIComponent(order.id)}`);
    }
  }, [order, router]);

  useEffect(() => {
    if (!expired || order?.status !== 'pending') return;
    syncOrder();
  }, [expired, order?.status, syncOrder]);

  if (loading) {
    return <p className="text-center text-gray-500 py-20">Memuat...</p>;
  }

  if (!user || !ready) {
    return null;
  }

  if (notFound) {
    return (
      <>
        <Head>
          <title>Pesanan Tidak Ditemukan - LoakinAja</title>
        </Head>
        <div className="max-w-md mx-auto my-8 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Pesanan tidak ditemukan</h1>
          <p className="mt-2 text-sm text-gray-500">
            Pesanan ini tidak ada atau bukan milik akun kamu. Silakan buat pesanan baru.
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

  if (!order) {
    return <p className="text-center text-gray-500 py-20">Memuat pesanan...</p>;
  }

  return (
    <>
      <Head>
        <title>Menunggu Pembayaran - LoakinAja</title>
      </Head>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-loak-light">
            <Clock className="h-7 w-7 animate-pulse text-loak-blue" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Menunggu Pembayaran
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Selesaikan pembayaran melalui Mayar agar token langsung masuk.
          </p>
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              expired ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
            }`}
          >
            <Clock className="h-4 w-4" />
            {expired
              ? 'Melewati batas waktu; memeriksa status Mayar'
              : `Sisa waktu ${formatCountdown(Date.parse(order.expiresAt) - now)}`}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Gateway Pembayaran
              </p>
              <p className="text-xs text-gray-500">Mayar</p>
            </div>
            <p className="text-xs text-gray-400">
              Pesanan #{order.id}
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-dashed border-loak-blue/40 bg-loak-light px-4 py-4 text-center">
            <p className="text-sm text-gray-700">
              Selesaikan pembayaran melalui checkout Mayar. Halaman ini akan memperbarui status pesanan otomatis.
            </p>
            {order.paymentUrl && (
              <a
                href={order.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-lg bg-loak-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark"
              >
                Buka Pembayaran Mayar
              </a>
            )}
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 px-4 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Pembayaran
            </p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              {formatRupiah(order.amount)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {order.tokens} token · {formatRupiah(order.pricePerToken)} per token
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            Status diperiksa ke Mayar secara berkala. Kamu juga bisa kembali lagi nanti untuk melihat hasilnya.
          </p>

          <button
            type="button"
            onClick={syncOrder}
            className="mx-auto mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-loak-blue"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Periksa pembayaran sekarang
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Butuh bantuan?{' '}
          <Link href="/hubungi-kami" className="font-medium text-loak-blue hover:text-loak-blue-dark">
            Hubungi Kami
          </Link>
        </p>
      </div>
    </>
  );
}
