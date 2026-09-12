import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle2, Coins, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPaymentMethod, getTokenOrder, TokenOrder } from '@/lib/db';
import { formatDateTime, formatRupiah } from '@/lib/format';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const refreshed = useRef(false);

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

  // Sync the token balance shown in the navbar with the credited tokens.
  useEffect(() => {
    if (!user || refreshed.current) return;
    refreshed.current = true;
    refresh();
  }, [user, refresh]);

  // A success page only makes sense for a settled order.
  useEffect(() => {
    if (!order || order.status === 'paid') return;
    if (order.status === 'pending') {
      router.replace(`/payment?order=${encodeURIComponent(order.id)}`);
    } else {
      router.replace(`/payment/failed?order=${encodeURIComponent(order.id)}`);
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

  const method = getPaymentMethod(order.method);

  return (
    <>
      <Head>
        <title>Pembayaran Berhasil - LoakinAja</title>
      </Head>

      <div className="max-w-lg mx-auto">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Pembayaran Berhasil
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {order.tokens} token sudah ditambahkan ke akun kamu.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 rounded-xl bg-loak-light p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
              <Coins className="h-5 w-5 text-loak-blue" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                +{order.tokens} token
              </p>
              <p className="text-xs text-gray-500">
                Saldo kamu sekarang {user.tokens} token
              </p>
            </div>
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
              <dt className="text-gray-500">Waktu pembayaran</dt>
              <dd className="text-right text-gray-800">
                {formatDateTime(order.paidAt ?? order.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
              <dt className="font-bold text-gray-900">Total dibayar</dt>
              <dd className="text-right text-lg font-extrabold text-loak-blue">
                {formatRupiah(order.amount)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/jual"
              className="w-full rounded-xl bg-loak-blue px-4 py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark sm:py-3"
            >
              Pasang Iklan Sekarang
            </Link>
            <Link
              href="/token"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-center text-sm font-semibold text-gray-600 transition-colors hover:border-loak-blue/50 hover:text-loak-blue sm:py-3"
            >
              Beli Token Lagi
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
