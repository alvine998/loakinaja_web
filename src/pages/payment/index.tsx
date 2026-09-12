import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  failTokenOrder,
  getPaymentMethod,
  getTokenOrder,
  payTokenOrder,
  TokenOrder,
} from '@/lib/db';
import { formatCountdown, formatPaymentCode, formatRupiah } from '@/lib/format';

const POLL_INTERVAL_MS = 5000;
const GATEWAY_DELAY_MS = 1200;

export default function WaitingPaymentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [orderId, setOrderId] = useState('');
  const [ready, setReady] = useState(false);
  const [order, setOrder] = useState<TokenOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const expired = order ? Date.parse(order.expiresAt) <= now : false;

  const syncOrder = useCallback(async () => {
    const found = await getTokenOrder(orderId);
    if (!found) {
      setNotFound(true);
      return;
    }
    setOrder(found);
  }, [orderId]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/token');
    }
  }, [loading, user, router]);

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

  const handleCopy = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.paymentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Gagal menyalin kode. Salin manual ya.');
    }
  };

  const handlePaid = async () => {
    setError('');
    setVerifying(true);
    try {
      // The delay stands in for the payment gateway callback.
      const [paid] = await Promise.all([
        payTokenOrder(orderId),
        new Promise((resolve) => setTimeout(resolve, GATEWAY_DELAY_MS)),
      ]);
      setOrder(paid);
    } catch (err) {
      setError((err as Error).message);
      await syncOrder();
      setVerifying(false);
    }
  };

  const handleCancel = async () => {
    setError('');
    setCanceling(true);
    try {
      setOrder(await failTokenOrder(orderId));
    } catch (err) {
      setError((err as Error).message);
      setCanceling(false);
    }
  };

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

  const method = getPaymentMethod(order.method);

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
            Selesaikan pembayaran sebelum waktu habis agar token langsung masuk.
          </p>
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              expired ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
            }`}
          >
            <Clock className="h-4 w-4" />
            {expired
              ? 'Waktu pembayaran habis'
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
                {method?.codeLabel ?? 'Kode Pembayaran'}
              </p>
              <p className="text-xs text-gray-500">{method?.label ?? order.method}</p>
            </div>
            <p className="text-xs text-gray-400">
              Pesanan #{order.id}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-loak-blue/40 bg-loak-light px-4 py-3">
            <span className="min-w-0 flex-1 break-all font-mono text-lg font-bold tracking-wider text-loak-blue-dark sm:text-xl">
              {formatPaymentCode(order.paymentCode)}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Salin kode pembayaran"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-loak-blue-dark transition-colors hover:bg-loak-blue hover:text-white"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
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

          {method && (
            <div className="mt-5">
              <p className="text-sm font-bold text-gray-900">Cara Pembayaran</p>
              <ol className="mt-2 space-y-2">
                {method.instructions.map((instruction, index) => (
                  <li key={instruction} className="flex gap-3 text-sm text-gray-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-loak-light text-[11px] font-bold text-loak-blue">
                      {index + 1}
                    </span>
                    <span className="min-w-0">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handlePaid}
              disabled={verifying || canceling || expired}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-loak-blue px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi pembayaran...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Saya Sudah Bayar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={verifying || canceling || expired}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-semibold text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {canceling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Membatalkan...
                </>
              ) : (
                'Batalkan Pesanan'
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => syncOrder()}
            className="mx-auto mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-loak-blue"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Perbarui status pembayaran
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          <span className="font-semibold">Mode demo:</span> belum ada payment gateway
          yang terhubung, jadi status pembayaran tidak dicek otomatis. Gunakan{' '}
          <span className="font-semibold">Saya Sudah Bayar</span> untuk simulasi
          pembayaran berhasil, atau <span className="font-semibold">Batalkan Pesanan</span>{' '}
          untuk simulasi pembayaran gagal.
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
