import React from 'react';
import Head from 'next/head';

export default function CaraJualan() {
  return (
    <>
      <Head>
        <title>Cara Jualan - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cara Jualan di LoakinAja</h1>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>Ubah barang bekasmu menjadi uang dengan mudah! Ikuti langkah-langkah berikut untuk mulai berjualan:</p>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Daftar / Masuk:</strong> Pastikan Anda sudah memiliki akun di LoakinAja dan melengkapi profil Anda.
            </li>
            <li>
              <strong>Pasang Iklan:</strong> Klik tombol "Jual Barang" dan pilih kategori yang sesuai dengan barang Anda.
            </li>
            <li>
              <strong>Unggah Foto Terbaik:</strong> Pastikan foto terang, jelas, dan menampilkan semua sisi barang termasuk jika ada minus atau lecet.
            </li>
            <li>
              <strong>Tulis Deskripsi Lengkap:</strong> Jelaskan kondisi barang, spesifikasi, lama pemakaian, dan alasan dijual secara jujur.
            </li>
            <li>
              <strong>Tentukan Harga & Lokasi:</strong> Pasang harga yang kompetitif dan tentukan lokasi agar pembeli sekitar dapat menemukan iklan Anda dengan mudah.
            </li>
            <li>
              <strong>Responsif:</strong> Balas chat dari calon pembeli dengan cepat dan ramah untuk meningkatkan peluang terjual.
            </li>
          </ol>
        </div>
      </div>
    </>
  );
}
