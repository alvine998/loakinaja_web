import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'pengumpulan', title: '1. Informasi yang Kami Kumpulkan' },
  { id: 'penggunaan', title: '2. Penggunaan Informasi' },
  { id: 'berbagi', title: '3. Berbagi Informasi' },
  { id: 'keamanan', title: '4. Penyimpanan & Keamanan Data' },
  { id: 'cookies', title: '5. Cookies & Pelacakan' },
  { id: 'hak', title: '6. Hak-Hak Anda' },
  { id: 'retensi', title: '7. Retensi Data' },
  { id: 'anak', title: '8. Privasi Anak' },
  { id: 'perubahan', title: '9. Perubahan Kebijakan' },
  { id: 'kontak', title: '10. Hubungi Kami' },
];

export default function KebijakanPrivasi() {
  return (
    <>
      <Head>
        <title>Kebijakan Privasi - LoakinAja</title>
        <meta
          name="description"
          content="Kebijakan Privasi LoakinAja: informasi yang dikumpulkan, penggunaan, berbagi data, keamanan, cookies, dan hak-hak pengguna."
        />
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-loak-blue transition-colors">Beranda</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-600">Kebijakan Privasi</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kebijakan Privasi</h1>
        <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 20 Mei 2026</p>

        <p className="text-gray-600 leading-relaxed text-sm mb-8">
          Privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan
          bagaimana LoakinAja mengumpulkan, menggunakan, dan melindungi informasi
          pribadi Anda saat menggunakan platform kami. Dengan mendaftar dan
          menggunakan LoakinAja, Anda menyetujui praktik yang dijelaskan di sini
          serta{' '}
          <Link href="/syarat-ketentuan" className="text-loak-blue hover:underline font-medium">
            Syarat dan Ketentuan
          </Link>{' '}
          kami.
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
          <section id="pengumpulan" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Informasi yang Kami Kumpulkan</h2>
            <p className="mb-2">Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, antara lain:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Data identitas:</strong> nama lengkap, alamat email, nomor telepon.</li>
              <li><strong>Data kredensial:</strong> kata sandi terenkripsi untuk keamanan akun.</li>
              <li><strong>Data transaksi:</strong> riwayat pembelian, penjualan, iklan yang dipasang, dan penggunaan Token.</li>
              <li><strong>Data komunikasi:</strong> pesan chat dengan penjual/pembeli dan laporan ke Pusat Resolusi.</li>
              <li><strong>Data teknis otomatis:</strong> jenis perangkat, browser, alamat IP, dan aktivitas penggunaan platform.</li>
            </ul>
          </section>

          <section id="penggunaan" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Penggunaan Informasi</h2>
            <p className="mb-2">Informasi yang kami kumpulkan digunakan untuk:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Memproses transaksi, mengelola Rekening Bersama, dan mengirimkan pemberitahuan penting.</li>
              <li>Memverifikasi identitas, mencegah penipuan, dan menjaga keamanan platform.</li>
              <li>Meningkatkan layanan, personalisasi pengalaman, dan analisis penggunaan.</li>
              <li>Menghubungi Anda terkait akun, pembaruan kebijakan, atau penawaran yang relevan (Anda dapat berhenti berlangganan kapan saja).</li>
            </ul>
          </section>

          <section id="berbagi" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Berbagi Informasi</h2>
            <p className="mb-2">Kami tidak akan menjual informasi pribadi Anda kepada pihak ketiga. Kami hanya berbagi informasi dalam kondisi berikut:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dengan mitra logistik dan pembayaran yang diperlukan untuk menyelesaikan transaksi Anda.</li>
              <li>Dengan penegak hukum apabila diwajibkan oleh peraturan perundang-undangan yang berlaku di Indonesia.</li>
              <li>Dengan pihak lawan transaksi (misalnya nomor telepon tersamar) sebatas yang diperlukan untuk pengiriman barang.</li>
              <li>Dalam hal merger, akuisisi, atau pengalihan usaha, dengan pemberitahuan terlebih dahulu kepada Anda.</li>
            </ul>
          </section>

          <section id="keamanan" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Penyimpanan &amp; Keamanan Data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Kata sandi disimpan dalam bentuk terenkripsi (hash) dan tidak dapat dibaca oleh siapa pun, termasuk tim kami.</li>
              <li>Akses ke data pribadi dibatasi hanya untuk personel berwenang dengan keperluan operasional.</li>
              <li>Kami menerapkan enkripsi transmisi (HTTPS), pemantauan anomali login, dan verifikasi OTP untuk tindakan sensitif.</li>
              <li>Meskipun demikian, tidak ada sistem yang 100% aman. Segera hubungi kami jika mencurigai akses tidak sah ke akun Anda.</li>
            </ul>
          </section>

          <section id="cookies" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Cookies &amp; Teknologi Pelacakan</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Kami menggunakan cookies untuk menjaga sesi login, mengingat preferensi, dan memahami cara Anda menggunakan platform.</li>
              <li>Anda dapat menonaktifkan cookies melalui pengaturan browser, namun sebagian fitur (misalnya tetap masuk) mungkin tidak berfungsi optimal.</li>
            </ul>
          </section>

          <section id="hak" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Hak-Hak Anda</h2>
            <p className="mb-2">Sesuai UU Perlindungan Data Pribadi, Anda berhak untuk:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Mengakses, memperbaiki, dan memperbarui data pribadi Anda melalui pengaturan akun.</li>
              <li>Meminta penghapusan akun dan data pribadi, kecuali data yang wajib disimpan menurut hukum.</li>
              <li>Menarik persetujuan pemrosesan data dan menolak komunikasi pemasaran.</li>
              <li>Mengajukan keberatan atau keluhan terkait pemrosesan data melalui kontak di bawah.</li>
            </ul>
          </section>

          <section id="retensi" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Retensi Data</h2>
            <p>
              Kami menyimpan data pribadi selama akun Anda aktif dan selama diperlukan untuk
              memenuhi kewajiban hukum, menyelesaikan sengketa, dan menegakkan perjanjian.
              Data transaksi keuangan dapat disimpan lebih lama sesuai ketentuan perpajakan
              dan hukum yang berlaku.
            </p>
          </section>

          <section id="anak" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Privasi Anak</h2>
            <p>
              Layanan kami tidak ditujukan untuk anak di bawah usia 17 tahun tanpa
              pengawasan orang tua/wali. Jika Anda mengetahui anak memberikan data
              pribadi tanpa persetujuan, hubungi kami agar data tersebut dapat dihapus.
            </p>
          </section>

          <section id="perubahan" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">9. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan
              material akan kami umumkan melalui platform atau email sebelum berlaku.
              Penggunaan berkelanjutan setelah perubahan berarti Anda menyetujui versi terbaru.
            </p>
          </section>

          <section id="kontak" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">10. Hubungi Kami</h2>
            <p>
              Untuk pertanyaan, permintaan akses/penghapusan data, atau keluhan privasi,
              hubungi kami melalui halaman{' '}
              <Link href="/hubungi-kami" className="text-loak-blue hover:underline font-medium">
                Hubungi Kami
              </Link>{' '}
              atau email support@loakinaja.com (08:00&ndash;22:00 WIB setiap hari).
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-lg bg-loak-light/50 border border-loak-blue/10 p-5 text-sm text-gray-600">
          Dengan mencentang persetujuan pada halaman{' '}
          <Link href="/register" className="text-loak-blue hover:underline font-medium">
            pendaftaran
          </Link>
          , Anda menyatakan telah membaca dan menyetujui Kebijakan Privasi ini.
        </div>
      </div>
    </>
  );
}
