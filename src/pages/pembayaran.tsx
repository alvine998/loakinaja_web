import React from 'react';
import Head from 'next/head';

export default function Pembayaran() {
  return (
    <>
      <Head>
        <title>Pembayaran - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Metode Pembayaran</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/mobile-payments.svg" alt="Ilustrasi pembayaran mobile" className="h-28 w-auto" />
        </div>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>LoakinAja menyediakan berbagai metode pembayaran yang aman dan praktis untuk memudahkan transaksi Anda.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Transfer Bank:</strong> Pembayaran melalui ATM, Internet Banking, atau Mobile Banking dari berbagai bank terkemuka di Indonesia.</li>
            <li><strong>Virtual Account:</strong> Pembayaran otomatis dan real-time menggunakan Virtual Account dari Bank BCA, Mandiri, BNI, BRI, dll.</li>
            <li><strong>E-Wallet:</strong> Dukungan pembayaran menggunakan dompet digital seperti GoPay, OVO, Dana, dan ShopeePay.</li>
            <li><strong>Minimarket:</strong> Pembayaran tunai melalui gerai Alfamart atau Indomaret terdekat.</li>
          </ul>
          <p className="mt-4 p-4 bg-blue-50 text-loak-blue rounded-lg border border-blue-100">
            <strong>Catatan:</strong> Semua pembayaran akan ditahan di <strong>Rekening Bersama LoakinAja</strong> hingga barang diterima dan dikonfirmasi oleh pembeli.
          </p>
        </div>
      </div>
    </>
  );
}
