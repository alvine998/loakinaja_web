import React from 'react';
import Head from 'next/head';

export default function SyaratKetentuan() {
  return (
    <>
      <Head>
        <title>Syarat dan Ketentuan - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Syarat dan Ketentuan</h1>
        <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
          <p>Terakhir diperbarui: 20 Mei 2026</p>
          <p>Selamat datang di LoakinAja. Syarat dan Ketentuan ini mengatur penggunaan layanan yang ditawarkan oleh LoakinAja terkait penggunaan platform kami.</p>
          <h3 className="text-lg font-bold text-gray-900 mt-6">1. Akun Pengguna</h3>
          <p>Anda wajib memberikan informasi yang akurat saat mendaftar. Anda bertanggung jawab penuh atas keamanan kata sandi dan semua aktivitas yang terjadi pada akun Anda.</p>
          <h3 className="text-lg font-bold text-gray-900 mt-4">2. Transaksi</h3>
          <p>Semua transaksi disarankan melalui sistem Rekening Bersama kami. LoakinAja tidak bertanggung jawab atas penipuan yang terjadi jika pengguna melakukan transaksi di luar platform.</p>
          <h3 className="text-lg font-bold text-gray-900 mt-4">3. Barang yang Dilarang</h3>
          <p>Pengguna dilarang menjual barang ilegal, obat-obatan terlarang, senjata api, barang curian, dan barang-barang yang melanggar hukum di Indonesia.</p>
        </div>
      </div>
    </>
  );
}
