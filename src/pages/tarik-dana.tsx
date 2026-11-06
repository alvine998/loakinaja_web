import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import SellerWithdrawal from '@/components/SellerWithdrawal';

export default function TarikDana() {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>Tarik Dana - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panduan Tarik Dana (Withdrawal)</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/credit-card-payment.svg" alt="Ilustrasi pembayaran kartu" className="h-28 w-auto" />
        </div>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>Hasil penjualan melalui Rekening Bersama masuk ke saldo tersedia setelah pembeli mengonfirmasi barang telah diterima. Permintaan penarikan diproses admin ke rekening bank yang Anda daftarkan pada formulir.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pastikan saldo berasal dari transaksi Rekening Bersama berstatus selesai.</li>
            <li>Masukkan nominal minimal Rp 10.000 dan detail rekening tujuan.</li>
            <li>Kirim permintaan penarikan dan pantau statusnya di Dashboard Penjual.</li>
            <li>Admin akan memeriksa dan melakukan transfer secara manual. Saldo dikembalikan jika permintaan ditolak.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            *Catatan: Penandaan iklan sebagai “Terjual” saja tidak membuat saldo. Dana hanya tersedia setelah transaksi Rekening Bersama terkonfirmasi dan dilepas.
          </p>
        </div>
        {user ? <SellerWithdrawal /> : <Link href="/login?next=/tarik-dana" className="mt-6 inline-flex rounded-lg bg-loak-blue px-5 py-3 text-sm font-semibold text-white hover:bg-loak-blue-dark">Masuk untuk tarik dana</Link>}
      </div>
    </>
  );
}
