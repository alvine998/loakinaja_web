import React from 'react';
import Head from 'next/head';

export default function PanduanSeller() {
  return (
    <>
      <Head>
        <title>Panduan Seller - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Panduan Lengkap Penjual</h1>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>Tingkatkan penjualan Anda dengan mengikuti tips dan panduan terbaik untuk penjual di LoakinAja.</p>
          <div className="space-y-6 mt-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Fotografi Produk yang Menarik</h3>
              <p>Gunakan pencahayaan alami, latar belakang bersih (sebaiknya putih atau polos), dan ambil foto dari berbagai sudut. Jika ada cacat atau minus, foto juga bagian tersebut agar pembeli tahu.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Deskripsi Jujur dan Jelas</h3>
              <p>Hindari menyembunyikan minus barang. Pembeli lebih menghargai kejujuran. Tuliskan spesifikasi detail, kelengkapan yang didapat, dan riwayat pemakaian.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Packing Aman</h3>
              <p>Jika Anda harus mengirim barang menggunakan kurir (ekspedisi), pastikan menggunakan bubble wrap tebal dan kardus yang kokoh, terutama untuk barang elektronik dan pecah belah.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">4. Tanggap dan Ramah</h3>
              <p>Kecepatan membalas pesan sangat mempengaruhi keputusan pembeli. Gunakan bahasa yang sopan dan jawab pertanyaan pembeli dengan sabar.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
