import React from 'react';
import Head from 'next/head';

export default function FAQ() {
  const faqs = [
    {
      q: 'Apakah bayar di tempat (COD) tersedia?',
      a: 'Saat ini fitur COD resmi dari sistem kami sedang dalam tahap pengembangan. Kami sangat menyarankan Anda menggunakan Rekening Bersama agar transaksi lebih aman.'
    },
    {
      q: 'Berapa lama batas waktu pengiriman barang?',
      a: 'Penjual diberikan waktu 2x24 jam (hari kerja) untuk mengirimkan barang setelah pembayaran dikonfirmasi.'
    },
    {
      q: 'Bagaimana jika barang yang datang tidak sesuai deskripsi?',
      a: 'Anda bisa mengajukan komplain melalui Pusat Resolusi dalam waktu 2x24 jam setelah status barang diterima. Dana akan ditahan sementara waktu hingga masalah diselesaikan.'
    },
    {
      q: 'Apakah ada biaya admin untuk berjualan di LoakinAja?',
      a: 'Saat ini, berjualan di LoakinAja 100% GRATIS tanpa potongan biaya admin dari hasil penjualan Anda.'
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ - Pertanyaan Umum - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pertanyaan yang Sering Diajukan (FAQ)</h1>
        <div className="space-y-6 mt-8">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
