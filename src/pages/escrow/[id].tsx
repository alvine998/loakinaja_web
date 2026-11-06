import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Copy, LockKeyhole, PackageCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { EscrowSale, getEscrowSale, submitEscrowPayment } from '@/lib/db';
import { formatRupiah } from '@/lib/format';

export default function EscrowSalePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const [sale, setSale] = useState<EscrowSale | null>(null);
  const [error, setError] = useState('');

  const loadSale = useCallback(async () => {
    if (!id) return;
    try {
      setSale(await getEscrowSale(id));
      setError('');
    } catch (reason) {
      setError((reason as Error).message);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
  }, [authLoading, user, router]);

  useEffect(() => { void loadSale(); }, [loadSale]);

  const copyAccountNumber = async () => {
    if (!sale) return;
    await navigator.clipboard.writeText(sale.escrowAccountNumber);
  };

  const markPayment = async () => {
    if (!id) return;
    try {
      await submitEscrowPayment(id);
      await loadSale();
      setError('');
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  if (authLoading || !sale) return <p className="py-20 text-center text-sm text-gray-500">{error || 'Memuat transaksi Rekening Bersama...'}</p>;

  return (
    <>
      <Head><title>Transaksi Rekening Bersama · LoakinAja</title></Head>
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700"><LockKeyhole className="h-6 w-6" /></span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Pembayaran Rekening Bersama</h1>
          <p className="mt-2 text-sm text-gray-500">Dana akan ditahan sampai barang diterima dan pembeli mengonfirmasi pesanan.</p>
          {error && <p role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
          <dl className="mt-6 space-y-3 border-y border-gray-100 py-5 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Produk</dt><dd className="text-right font-semibold text-gray-800">{sale.listing?.title || 'Produk'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Penjual</dt><dd className="text-right text-gray-800">{sale.seller?.name || 'Penjual'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Status</dt><dd className="font-semibold capitalize text-amber-700">{sale.status.replaceAll('_', ' ')}</dd></div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-3"><dt className="font-bold text-gray-900">Total</dt><dd className="text-lg font-extrabold text-loak-blue">{formatRupiah(sale.amount)}</dd></div>
          </dl>
          {sale.status === 'awaiting_payment' && sale.buyerId === user?.id && (
            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">Transfer ke Rekening Bersama LoakinAja</p>
              <p className="mt-3 text-xs text-gray-500">{sale.escrowBankName} · {sale.escrowAccountHolder}</p>
              <div className="mt-1 flex items-center justify-between gap-3"><p className="font-mono text-lg font-bold text-gray-900">{sale.escrowAccountNumber}</p><button type="button" onClick={copyAccountNumber} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:text-loak-blue" aria-label="Salin nomor rekening"><Copy className="h-4 w-4" /></button></div>
              <p className="mt-2 text-xs text-gray-500">Setelah transfer, admin akan memverifikasi dana masuk. Jangan tandai barang diterima sebelum paket sampai.</p>
              <button type="button" onClick={markPayment} className="mt-4 w-full rounded-lg bg-loak-blue px-4 py-3 text-sm font-bold text-white hover:bg-loak-blue-dark">Saya sudah transfer</button>
            </div>
          )}
          {sale.status === 'payment_submitted' && <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Konfirmasi transfer diterima. Admin akan memverifikasi dana sebelum meneruskannya ke penjual.</p>}
          {sale.status === 'in_escrow' && sale.buyerId === user?.id && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-semibold text-blue-900">Dana sudah diamankan</p><p className="mt-1 text-xs text-blue-700">Konfirmasi penerimaan hanya setelah barang sampai dan sesuai deskripsi.</p><button type="button" onClick={() => setError('Konfirmasi pengiriman belum tersedia. Hubungi dukungan untuk menyelesaikan transaksi ini.')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"><PackageCheck className="h-4 w-4" />Konfirmasi barang diterima</button></div>}
          {sale.status === 'released' && <p className="mt-5 rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-800">Transaksi selesai. Dana telah ditambahkan ke saldo penjual.</p>}
        </section>
        <Link href="/dashboard" className="inline-flex text-sm font-semibold text-loak-blue hover:underline">Kembali ke dashboard</Link>
      </div>
    </>
  );
}
