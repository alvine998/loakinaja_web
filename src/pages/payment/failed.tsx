import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPaymentMethod, getTokenOrder, TokenOrder } from '@/lib/db';
import { formatDateTime, formatRupiah } from '@/lib/format';

export default function PaymentFailedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [orderId, setOrderId] = useState('');
  const [ready, setReady] = useState(false);
  const [order, setOrder] = useState<TokenOrder | null>(null);
  const [notFound, setNotFound] = useState(false);

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
    let active = true;
    getTokenOrder(orderId).then((found) => {
      if (!active) return;
      if (!found) {
        setNotFound(true);
        return;
      }
      setOrder(found);
    });
    return () => {
      active = false;
    };
  }, [ready, user, orderId]);

  // An unfinished order belongs on the waiting page, a paid one on the receipt.
  useEffect(() => {
    if (!order) return;
    if (order.status === 'pending') {
      router.replace(`/payment?order=${encodeURIComponent(order.id)}`);
    } else if (order.status === 'paid') {
      router.replace(`/payment/success?order=${encodeURIComponent(order.id)}`);
    }
  }, [order, router]);

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
            Pesanan ini tidak ada atau bukan milik akun kamu.
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

  const expired = order.status === 'expired';
  const method = getPaymentMethod(order.method);

  return (
    <>
      <Head>
        <title>{expired ? 'Pembayaran Kedaluwarsa' : 'Pembayaran Gagal'} - LoakinAja</title>
      </Head>

      <div className="max-w-lg mx-auto">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            {expired ? (
              <Clock className="h-8 w-8 text-red-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {expired ? 'Waktu Pembayaran Habis' : 'Pembayaran Gagal'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {expired
              ? 'Pesanan dibatalkan otomatis karena melewati batas waktu 15 menit.'
              : 'Pembayaran pesanan ini tidak berhasil diselesaikan.'}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <p className="min-w-0 text-sm text-red-700">
              Token <strong>tidak terpotong</strong> dan tidak ditambahkan ke akun kamu.
              Kamu bisa membuat pesanan baru kapan saja.
            </p>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Nomor Pesanan</dt>
              <dd className="break-all text-right font-mono text-xs text-gray-800">
                {order.id}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Paket</dt>
              <dd className="text-right text-gray-800">
                {order.tokens} Token · {order.packageLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Metode pembayaran</dt>
              <dd className="text-right text-gray-800">{method?.label ?? order.method}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Dibuat</dt>
              <dd className="text-right text-gray-800">
                {formatDateTime(order.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
              <dt className="font-bold text-gray-900">Total tagihan</dt>
              <dd className="text-right text-lg font-extrabold text-gray-400 line-through">
                {formatRupiah(order.amount)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/checkout?package=${encodeURIComponent(order.packageId)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-loak-blue px-4 py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark sm:py-3"
            >
              <RefreshCw className="h-4 w-4" /> Coba Bayar Lagi
            </Link>
            <Link
              href="/token"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-center text-sm font-semibold text-gray-600 transition-colors hover:border-loak-blue/50 hover:text-loak-blue sm:py-3"
            >
              Kembali ke Beli Token
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Sudah membayar tapi pesanan ini gagal?{' '}
          <Link href="/hubungi-kami" className="font-medium text-loak-blue hover:text-loak-blue-dark">
            Hubungi Kami
          </Link>
        </p>
      </div>
    </>
  );
}
