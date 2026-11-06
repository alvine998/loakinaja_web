import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { getPpobOrder, PpobOrder, verifyPpobPayment } from '@/lib/db';
import { formatRupiah } from '@/lib/format';

const statusLabels: Record<string, string> = {
  quoted: 'Menunggu pembayaran', creating_payment: 'Menyiapkan pembayaran', awaiting_payment: 'Menunggu pembayaran',
  processing: 'Sedang diproses', pending: 'Diproses provider', success: 'Transaksi berhasil', failed: 'Transaksi gagal', expired: 'Kedaluwarsa',
};

export default function PpobOrderPage() {
  const router = useRouter();
  const [order, setOrder] = useState<PpobOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    if (!router.isReady || typeof window === 'undefined') return;
    const id = typeof router.query.id === 'string' ? router.query.id : '';
    const stored = id ? window.sessionStorage.getItem(`loakinaja_ppob_guest_${id}`) : null;
    setGuestToken(stored);
    setAuthResolved(true);
  }, [router.isReady, router.query.id]);

  const sync = useCallback(async () => {
    const id = typeof router.query.id === 'string' ? router.query.id : '';
    if (!id) return;
    try {
      const result = await verifyPpobPayment(id, guestToken);
      setOrder(result);
      setError('');
    } catch (syncError) {
      setError((syncError as Error).message);
      const result = await getPpobOrder(id, guestToken).catch(() => null);
      if (result) setOrder(result);
      else setNotFound(true);
    }
  }, [router.query.id, guestToken]);

  useEffect(() => {
    if (!router.isReady || !authResolved || !router.query.id) return;
    sync();
    const timer = setInterval(sync, 30000);
    return () => clearInterval(timer);
  }, [router.isReady, authResolved, router.query.id, sync]);

  if (!authResolved || !router.isReady) return <p className="py-20 text-center text-gray-500">Memuat...</p>;
  if (notFound) return <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><XCircle className="mx-auto h-10 w-10 text-red-500" /><h1 className="mt-3 text-xl font-bold">Transaksi tidak ditemukan</h1><Link href="/ppob" className="mt-5 inline-block text-sm font-semibold text-loak-blue">Kembali ke PPOB</Link></div>;
  if (!order) return <p className="py-20 text-center text-gray-500">Memuat transaksi...</p>;

  const icon = order.status === 'success' ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : order.status === 'failed' ? <XCircle className="h-8 w-8 text-red-500" /> : <Clock3 className="h-8 w-8 text-amber-600" />;
  const isPending = ['awaiting_payment', 'processing', 'pending'].includes(order.status);

  return (
    <>
      <Head><title>Status Transaksi PPOB - LoakinAja</title></Head>
      <div className="mx-auto max-w-xl">
        <Link href="/ppob" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-loak-blue"><ArrowLeft className="h-4 w-4" />Kembali ke PPOB</Link>
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">{icon}</div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{statusLabels[order.status] || order.status}</h1>
            <p className="mt-1 text-sm text-gray-500">{order.message || order.productName}</p>
          </div>
          {error && <div role="alert" className="mt-5 flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
          <dl className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Produk</dt><dd className="text-right font-semibold text-gray-800">{order.productName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Nomor tujuan</dt><dd className="text-right font-mono text-gray-800">{order.customerNo}</dd></div>
            {order.quoteData?.customer_name != null && <div className="flex justify-between gap-4"><dt className="text-gray-500">Nama pelanggan</dt><dd className="text-right text-gray-800">{String(order.quoteData.customer_name)}</dd></div>}
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Nomor transaksi</dt><dd className="break-all text-right font-mono text-xs text-gray-800">{order.refId}</dd></div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-3"><dt className="font-semibold text-gray-800">Total</dt><dd className="text-lg font-extrabold text-loak-blue">{formatRupiah(order.amount)}</dd></div>
            {order.serialNumber && <div className="rounded-lg bg-green-50 p-3"><dt className="text-xs font-semibold text-green-800">Nomor serial / token</dt><dd className="mt-1 break-all font-mono text-sm text-green-900">{order.serialNumber}</dd></div>}
          </dl>
          {order.paymentUrl && order.status === 'awaiting_payment' && <a href={order.paymentUrl} target="_blank" rel="noreferrer" className="mt-5 block rounded-xl bg-loak-blue px-4 py-3 text-center text-sm font-bold text-white hover:bg-loak-blue-dark">Lanjutkan pembayaran</a>}
          <button type="button" onClick={sync} className="mx-auto mt-5 flex items-center gap-2 text-sm font-semibold text-loak-blue"><RefreshCw className="h-4 w-4" />Perbarui status</button>
          {isPending && order.status !== 'awaiting_payment' && <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500"><Loader2 className="h-3.5 w-3.5 animate-spin" />Status provider diperbarui otomatis.</p>}
          {!guestToken && <p className="mt-4 text-center text-xs text-amber-700">Link akses status ini tidak tersedia di perangkat ini. Buka kembali dari perangkat yang digunakan saat checkout.</p>}
          {order.status === 'success' && <p className="mt-4 text-center text-xs text-green-700">Pembayaran dan transaksi provider berhasil.</p>}
          {order.status === 'failed' && <p className="mt-4 text-center text-xs text-red-700">Transaksi tidak berhasil. Hubungi kami dengan nomor transaksi di atas jika pembayaran sudah terdebit.</p>}
        </section>
      </div>
    </>
  );
}
