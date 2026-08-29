import React from 'react';
import Head from 'next/head';

export default function CaraBelanja() {
  return (
    <>
      <Head>
        <title>Cara Belanja - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cara Belanja di LoakinAja</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/window-shopping.svg" alt="Ilustrasi belanja" className="h-28 w-auto" />
        </div>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>Selamat datang di panduan berbelanja LoakinAja. Ikuti langkah-langkah mudah berikut untuk mendapatkan barang impian Anda:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Cari Barang:</strong> Gunakan fitur pencarian atau telusuri kategori untuk menemukan barang yang Anda butuhkan.</li>
            <li><strong>Pilih & Periksa:</strong> Baca deskripsi produk dengan teliti, periksa foto, dan perhatikan reputasi penjual.</li>
            <li><strong>Hubungi Penjual:</strong> Gunakan fitur chat untuk menanyakan detail lebih lanjut atau negosiasi harga jika diizinkan.</li>
            <li><strong>Beli & Bayar:</strong> Klik tombol "Beli" dan pilih metode pembayaran yang tersedia melalui Rekening Bersama kami demi keamanan.</li>
            <li><strong>Terima Barang:</strong> Setelah barang sampai, periksa kondisinya. Jika sesuai, konfirmasi penerimaan agar dana diteruskan ke penjual.</li>
          </ol>
        </div>
      </div>
    </>
  );
}
