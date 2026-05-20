import React from 'react';
import Head from 'next/head';

export default function JaminanAman() {
  return (
    <>
      <Head>
        <title>Jaminan Aman - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Jaminan Aman 100%</h1>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>Belanja barang bekas tanpa khawatir penipuan? Hanya di LoakinAja! Kami menerapkan sistem keamanan berlapis untuk melindungi penjual dan pembeli.</p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="p-5 border border-gray-100 rounded-lg bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">Rekening Bersama (Escrow)</h3>
              <p className="text-sm">Dana pembeli akan ditahan oleh sistem kami dan baru akan diteruskan ke penjual setelah barang diterima dan sesuai dengan deskripsi.</p>
            </div>
            <div className="p-5 border border-gray-100 rounded-lg bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">Verifikasi Pengguna</h3>
              <p className="text-sm">Semua penjual dan pembeli diwajibkan untuk melakukan verifikasi nomor handphone untuk mengurangi akun fiktif.</p>
            </div>
            <div className="p-5 border border-gray-100 rounded-lg bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">Pusat Resolusi</h3>
              <p className="text-sm">Jika terjadi masalah pada transaksi, tim resolusi kami siap menengahi dan memberikan solusi terbaik berdasarkan bukti-bukti yang ada.</p>
            </div>
            <div className="p-5 border border-gray-100 rounded-lg bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">Sistem Rating & Ulasan</h3>
              <p className="text-sm">Anda dapat melihat reputasi penjual berdasarkan rating dan ulasan dari pembeli sebelumnya untuk memastikan kredibilitas mereka.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
