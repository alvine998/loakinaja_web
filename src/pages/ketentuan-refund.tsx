import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'ruang-lingkup', title: '1. Ruang Lingkup' },
  { id: 'rekening-bersama', title: '2. Transaksi Rekening Bersama' },
  { id: 'token', title: '3. Pembelian Token Penjual' },
  { id: 'ppob', title: '4. Transaksi Pulsa & Tagihan (PPOB)' },
  { id: 'syarat-pengajuan', title: '5. Syarat & Batas Waktu Pengajuan' },
  { id: 'bukti', title: '6. Bukti yang Diperlukan' },
  { id: 'proses-waktu', title: '7. Proses & Estimasi Pengembalian Dana' },
  { id: 'pengecualian', title: '8. Pengecualian Refund' },
  { id: 'kontak', title: '9. Hubungi Kami' },
];

export default function KetentuanRefund() {
  return (
    <>
      <Head>
        <title>Ketentuan Refund - LoakinAja</title>
        <meta
          name="description"
          content="Ketentuan Refund dan pengembalian dana LoakinAja untuk transaksi Rekening Bersama, pembelian Token Penjual, dan layanan PPOB."
        />
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-loak-blue transition-colors">Beranda</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-600">Ketentuan Refund</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ketentuan Refund</h1>
        <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 23 November 2026</p>

        <p className="text-gray-600 leading-relaxed text-sm mb-8">
          Ketentuan Refund ini menjelaskan aturan dan prosedur pengembalian dana
          (<em>refund</em>) di platform LoakinAja. Ketentuan ini merupakan bagian
          yang tidak terpisahkan dari{' '}
          <Link href="/syarat-ketentuan" className="text-loak-blue hover:underline font-medium">
            Syarat dan Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="/kebijakan-privasi" className="text-loak-blue hover:underline font-medium">
            Kebijakan Privasi
          </Link>{' '}
          LoakinAja.
        </p>

        <div className="rounded-lg bg-gray-50 border border-gray-100 p-5 mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Daftar Isi</p>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-loak-blue hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-8 text-gray-600 leading-relaxed text-sm">
          <section id="ruang-lingkup" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Ruang Lingkup</h2>
            <p className="mb-2">
              Kebijakan pengembalian dana berlaku untuk layanan resmi yang diproses
              melalui LoakinAja, yaitu:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Transaksi jual beli barang bekas yang menggunakan fitur <strong>Rekening Bersama</strong> LoakinAja.</li>
              <li>Pembelian <strong>Token Penjual</strong> melalui payment gateway iPaymu.</li>
              <li>Pembelian produk digital <strong>Pulsa &amp; Tagihan (PPOB)</strong> melalui payment gateway iPaymu.</li>
            </ul>
          </section>

          <section id="rekening-bersama" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Transaksi Rekening Bersama</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Pembeli berhak mengajukan refund apabila barang tidak dikirim oleh Penjual melewati batas waktu pengiriman yang disepakati.</li>
              <li>Pembeli berhak mengajukan refund apabila barang yang diterima tidak sesuai dengan deskripsi atau foto iklan, rusak saat diterima, atau bukan barang asli sesuai kesepakatan.</li>
              <li>Dana Rekening Bersama hanya dapat dikembalikan selama status transaksi belum dilepaskan kepada Penjual.</li>
              <li>Untuk pengembalian barang, Pembeli wajib mengirimkan kembali barang ke Penjual setelah disetujui oleh tim admin LoakinAja; dana dikembalikan setelah barang diterima kembali oleh Penjual atau sesuai keputusan mediasi admin.</li>
            </ul>
          </section>

          <section id="token" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Pembelian Token Penjual</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Token yang sudah berhasil masuk ke saldo akun pengguna bersifat final dan tidak dapat diuangkan kembali atau dibatalkan.</li>
              <li>Refund dapat diajukan apabila pembayaran melalui iPaymu telah terdebit namun status pesanan gagal atau token tidak bertambah setelah verifikasi sistem.</li>
              <li>Apabila terjadi pembayaran ganda (<em>double debit</em>) untuk pesanan yang sama, kelebihan dana akan dikembalikan setelah diverifikasi dengan catatan transaksi iPaymu.</li>
            </ul>
          </section>

          <section id="ppob" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Transaksi Pulsa &amp; Tagihan (PPOB)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Transaksi PPOB yang sudah berstatus <strong>berhasil</strong> dari provider tidak dapat dibatalkan maupun di-refund, termasuk jika pengguna salah memasukkan nomor tujuan atau ID pelanggan.</li>
              <li>Apabila pembayaran melalui iPaymu sudah berhasil namun transaksi ke provider berstatus <strong>gagal</strong>, pengguna berhak mendapatkan pengembalian dana penuh sesuai nominal yang dibayarkan.</li>
              <li>Untuk transaksi berstatus <strong>pending</strong>, proses refund baru dapat dilakukan setelah status akhir dari provider dipastikan gagal.</li>
            </ul>
          </section>

          <section id="syarat-pengajuan" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Syarat &amp; Batas Waktu Pengajuan</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Pengajuan komplain/refund untuk transaksi Rekening Bersama wajib dilakukan sebelum Pembeli menekan tombol konfirmasi penerimaan barang dan maksimal <strong>2 × 24 jam</strong> setelah paket dinyatakan tiba menurut pelacakan ekspedisi.</li>
              <li>Pengajuan refund untuk kegagalan transaksi Token atau PPOB dapat diajukan maksimal <strong>7 hari kalender</strong> sejak tanggal pembayaran.</li>
              <li>Pengguna wajib memberikan informasi rekening bank tujuan pengembalian dana atas nama pemilik transaksi yang sah.</li>
            </ul>
          </section>

          <section id="bukti" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Bukti yang Diperlukan</h2>
            <p className="mb-2">Saat mengajukan refund, mohon sertakan dokumen pendukung berikut:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nomor pesanan atau nomor transaksi (<code>refId</code> / Order ID).</li>
              <li>Bukti pembayaran yang sah (tangkapan layar mutasi rekening atau konfirmasi iPaymu).</li>
              <li>Untuk transaksi Rekening Bersama: video <em>unboxing</em> tanpa jeda sejak paket masih tersegel serta foto kondisi barang yang diterima.</li>
            </ul>
          </section>

          <section id="proses-waktu" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Proses &amp; Estimasi Pengembalian Dana</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Tim LoakinAja akan memverifikasi pengajuan dalam waktu <strong>1–3 hari kerja</strong> setelah seluruh bukti diterima lengkap.</li>
              <li>Setelah pengajuan disetujui, pengembalian dana diproses melalui transfer bank ke rekening pengguna dalam waktu <strong>3–7 hari kerja</strong> (tidak termasuk hari Sabtu, Minggu, dan hari libur nasional).</li>
              <li>Status perkembangan pengajuan refund akan diinformasikan melalui email terdaftar atau saluran kontak resmi LoakinAja.</li>
            </ul>
          </section>

          <section id="pengecualian" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Pengecualian Refund</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Transaksi yang dilakukan secara langsung di luar sistem Rekening Bersama LoakinAja bukan merupakan tanggung jawab LoakinAja dan tidak dapat diajukan refund.</li>
              <li>Kesalahan input nomor tujuan, nominal, atau data pesanan oleh pengguna pada layanan PPOB yang telah berhasil diproses provider.</li>
              <li>Akun atau transaksi yang terbukti melanggar <Link href="/syarat-ketentuan" className="text-loak-blue hover:underline">Syarat dan Ketentuan</Link> atau terindikasi penyalahgunaan maupun penipuan.</li>
            </ul>
          </section>

          <section id="kontak" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">9. Hubungi Kami</h2>
            <p>
              Untuk mengajukan refund atau menanyakan status pengembalian dana, silakan
              hubungi tim kami melalui halaman{' '}
              <Link href="/hubungi-kami" className="text-loak-blue hover:underline font-medium">
                Hubungi Kami
              </Link>{' '}
              atau kirim email ke{' '}
              <a href="mailto:support@loakinaja.com" className="text-loak-blue hover:underline">
                support@loakinaja.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 text-xs text-gray-400">
          Dengan bertransaksi melalui LoakinAja, Anda menyatakan telah membaca dan menyetujui Ketentuan Refund ini.
        </div>
      </div>
    </>
  );
}
