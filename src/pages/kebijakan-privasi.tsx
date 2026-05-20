import React from 'react';
import Head from 'next/head';

export default function KebijakanPrivasi() {
  return (
    <>
      <Head>
        <title>Kebijakan Privasi - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Kebijakan Privasi</h1>
        <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
          <p>Privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana LoakinAja mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.</p>
          <h3 className="text-lg font-bold text-gray-900 mt-6">1. Informasi yang Kami Kumpulkan</h3>
          <p>Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, seperti nama, alamat email, nomor telepon, dan informasi pembayaran saat melakukan transaksi.</p>
          <h3 className="text-lg font-bold text-gray-900 mt-4">2. Penggunaan Informasi</h3>
          <p>Informasi yang kami kumpulkan digunakan untuk memproses transaksi, mengirimkan pemberitahuan penting, mencegah penipuan, dan meningkatkan layanan kami.</p>
          <h3 className="text-lg font-bold text-gray-900 mt-4">3. Berbagi Informasi</h3>
          <p>Kami tidak akan menjual informasi pribadi Anda kepada pihak ketiga. Kami hanya berbagi informasi dengan mitra logistik dan pembayaran yang diperlukan untuk menyelesaikan transaksi Anda.</p>
        </div>
      </div>
    </>
  );
}
