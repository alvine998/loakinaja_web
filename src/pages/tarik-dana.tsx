import React from 'react';
import Head from 'next/head';

export default function TarikDana() {
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
          <p>Setelah barang Anda terjual dan dikonfirmasi oleh pembeli, dana akan masuk ke Saldo LoakinAja Anda. Berikut adalah cara untuk menarik dana ke rekening pribadi:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Buka menu <strong>Saldo Saya</strong> dari profil Anda.</li>
            <li>Pastikan Anda telah menambahkan Rekening Bank yang valid dan atas nama Anda sendiri.</li>
            <li>Klik tombol <strong>Tarik Dana</strong>.</li>
            <li>Masukkan nominal dana yang ingin ditarik.</li>
            <li>Masukkan PIN keamanan atau konfirmasi OTP yang dikirimkan ke nomor Anda.</li>
            <li>Tunggu proses pencairan. Dana biasanya akan masuk ke rekening Anda dalam waktu 1x24 jam kerja.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            *Catatan: Minimal penarikan dana adalah Rp 10.000. Beberapa bank mungkin mengenakan biaya transfer sesuai kebijakan bank masing-masing.
          </p>
        </div>
      </div>
    </>
  );
}
