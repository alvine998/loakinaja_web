import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'definisi', title: '1. Definisi' },
  { id: 'akun', title: '2. Akun Pengguna' },
  { id: 'barang-jasa', title: '3. Barang & Jasa' },
  { id: 'barang-dilarang', title: '4. Barang yang Dilarang' },
  { id: 'transaksi', title: '5. Transaksi & Rekening Bersama' },
  { id: 'token', title: '6. Token & Biaya' },
  { id: 'kewajiban', title: '7. Kewajiban & Larangan Pengguna' },
  { id: 'konten', title: '8. Konten & Kekayaan Intelektual' },
  { id: 'tanggung-jawab', title: '9. Batasan Tanggung Jawab' },
  { id: 'penyelesaian', title: '10. Penyelesaian Sengketa' },
  { id: 'perubahan', title: '11. Perubahan & Penghentian Layanan' },
  { id: 'kontak', title: '12. Hubungi Kami' },
];

export default function SyaratKetentuan() {
  return (
    <>
      <Head>
        <title>Syarat dan Ketentuan - LoakinAja</title>
        <meta
          name="description"
          content="Syarat dan Ketentuan penggunaan platform LoakinAja: akun, transaksi, Rekening Bersama, token, larangan, dan penyelesaian sengketa."
        />
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-loak-blue transition-colors">Beranda</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-600">Syarat dan Ketentuan</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Syarat dan Ketentuan</h1>
        <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 20 Mei 2026</p>

        <p className="text-gray-600 leading-relaxed text-sm mb-8">
          Selamat datang di LoakinAja. Syarat dan Ketentuan ini mengatur penggunaan
          layanan yang ditawarkan oleh LoakinAja terkait penggunaan platform kami.
          Dengan mendaftar, mengakses, atau menggunakan LoakinAja, Anda dianggap
          telah membaca, memahami, dan menyetujui seluruh isi Syarat dan Ketentuan
          ini beserta{' '}
          <Link href="/kebijakan-privasi" className="text-loak-blue hover:underline font-medium">
            Kebijakan Privasi
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
          <section id="definisi" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Definisi</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>&ldquo;Platform&rdquo;</strong> berarti situs web dan aplikasi LoakinAja beserta seluruh fiturnya.</li>
              <li><strong>&ldquo;Pengguna&rdquo;</strong> berarti setiap orang yang mengakses Platform, baik sebagai Pembeli, Penjual, maupun pengunjung.</li>
              <li><strong>&ldquo;Rekening Bersama&rdquo;</strong> berarti mekanisme penampungan dana sementara oleh LoakinAja hingga transaksi dinyatakan selesai.</li>
              <li><strong>&ldquo;Token&rdquo;</strong> berarti saldo internal yang digunakan untuk memasang iklan dan mengakses fitur berbayar.</li>
            </ul>
          </section>

          <section id="akun" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Akun Pengguna</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Anda wajib memberikan informasi yang akurat, lengkap, dan terkini saat mendaftar (nama, email, nomor telepon).</li>
              <li>Anda bertanggung jawab penuh atas keamanan kata sandi dan semua aktivitas yang terjadi pada akun Anda.</li>
              <li>Satu orang hanya diperbolehkan memiliki satu akun aktif, kecuali disetujui tertulis oleh LoakinAja.</li>
              <li>Pengguna wajib berusia minimal 17 tahun atau telah menikah, atau menggunakan akun di bawah pengawasan orang tua/wali.</li>
              <li>LoakinAja berhak menangguhkan atau menutup akun yang terbukti memberikan data palsu, menyalahgunakan layanan, atau melanggar ketentuan ini.</li>
            </ul>
          </section>

          <section id="barang-jasa" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Barang &amp; Jasa</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Penjual wajib memberikan deskripsi barang yang jujur, termasuk kondisi, kekurangan, kelengkapan, dan foto aktual barang.</li>
              <li>Harga yang tercantum sudah termasuk kesepakatan antara Pembeli dan Penjual; biaya kirim dan asuransi dibebankan sesuai pilihan pengiriman.</li>
              <li>LoakinAja bukan penjual barang. Kami menyediakan platform yang mempertemukan Pembeli dan Penjual.</li>
            </ul>
          </section>

          <section id="barang-dilarang" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Barang yang Dilarang</h2>
            <p className="mb-2">Pengguna dilarang menjual barang/jasa berikut:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Barang ilegal, obat-obatan terlarang, senjata api/tajam, dan bahan peledak.</li>
              <li>Barang curian, hasil kejahatan, atau barang yang peredarannya dibatasi undang-undang.</li>
              <li>Data pribadi, akun bajakan, malware, dan konten yang melanggar hak cipta.</li>
              <li>Hewan yang dilindungi, organ tubuh, serta layanan yang melanggar hukum atau norma kesusilaan di Indonesia.</li>
            </ul>
            <p className="mt-2">Iklan yang melanggar akan dihapus tanpa pemberitahuan dan akun dapat diblokir permanen.</p>
          </section>

          <section id="transaksi" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Transaksi &amp; Rekening Bersama</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Semua transaksi disarankan melalui sistem Rekening Bersama kami demi keamanan kedua belah pihak.</li>
              <li>Dana Pembeli ditahan sistem dan baru diteruskan ke Penjual setelah barang diterima dan sesuai deskripsi, atau setelah masa komplain berakhir.</li>
              <li>Komplain dapat diajukan melalui Pusat Resolusi dalam waktu 2x24 jam setelah status barang diterima.</li>
              <li>LoakinAja tidak bertanggung jawab atas kerugian akibat transaksi yang dilakukan di luar Platform.</li>
            </ul>
          </section>

          <section id="token" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Token &amp; Biaya</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Memasang 1 iklan membutuhkan 1 Token. Pengguna baru mendapatkan 3 Token gratis saat mendaftar.</li>
              <li>Token yang sudah dibeli tidak dapat diuangkan kembali, dipindahtangankan, atau ditukar dengan uang tunai.</li>
              <li>Saat ini berjualan di LoakinAja 100% GRATIS tanpa potongan biaya admin dari hasil penjualan.</li>
              <li>LoakinAja dapat mengubah skema harga Token dengan pemberitahuan minimal 7 hari sebelumnya.</li>
            </ul>
          </section>

          <section id="kewajiban" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Kewajiban &amp; Larangan Pengguna</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dilarang melakukan penipuan, pemalsuan identitas, spam, phishing, atau manipulasi ulasan/rating.</li>
              <li>Dilarang mengunggah konten SARA, pornografi, ujaran kebencian, atau ancaman kekerasan.</li>
              <li>Dilarang meretas, mengganggu infrastruktur Platform, atau mengakses sistem secara tidak sah.</li>
              <li>Dilarang mengalihkan transaksi ke luar Platform dengan tujuan menghindari perlindungan Rekening Bersama.</li>
            </ul>
          </section>

          <section id="konten" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Konten &amp; Kekayaan Intelektual</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Seluruh merek, logo, desain, dan kode Platform adalah milik LoakinAja dan dilindungi undang-undang.</li>
              <li>Dengan mengunggah foto/deskripsi, Anda memberikan lisensi kepada LoakinAja untuk menampilkan dan mempromosikan konten tersebut di Platform.</li>
              <li>Anda menjamin konten yang diunggah adalah milik Anda atau Anda berhak menggunakannya.</li>
            </ul>
          </section>

          <section id="tanggung-jawab" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">9. Batasan Tanggung Jawab</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Platform disediakan &ldquo;sebagaimana adanya&rdquo;. LoakinAja berupaya menjaga layanan selalu tersedia, namun tidak menjamin bebas gangguan 100%.</li>
              <li>Kualitas, keaslian, dan legalitas barang sepenuhnya menjadi tanggung jawab Penjual.</li>
              <li>Sejauh diizinkan hukum, tanggung jawab LoakinAja terbatas pada nilai transaksi yang disengketakan.</li>
            </ul>
          </section>

          <section id="penyelesaian" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">10. Penyelesaian Sengketa</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sengketa diselesaikan terlebih dahulu secara musyawarah melalui Pusat Resolusi dan layanan pelanggan kami.</li>
              <li>Apabila tidak tercapai kesepakatan dalam 14 hari kalender, sengketa tunduk pada hukum Republik Indonesia dan diselesaikan melalui pengadilan yang berwenang.</li>
            </ul>
          </section>

          <section id="perubahan" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">11. Perubahan &amp; Penghentian Layanan</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>LoakinAja dapat memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Perubahan material akan diumumkan melalui Platform atau email.</li>
              <li>Penggunaan berkelanjutan setelah perubahan berarti Anda menyetujui versi terbaru.</li>
              <li>Anda dapat berhenti menggunakan layanan kapan saja dengan menutup akun melalui layanan pelanggan.</li>
            </ul>
          </section>

          <section id="kontak" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 mb-2">12. Hubungi Kami</h2>
            <p>
              Pertanyaan mengenai Syarat dan Ketentuan ini dapat disampaikan melalui halaman{' '}
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
          , Anda menyatakan setuju terhadap Syarat dan Ketentuan ini.
        </div>
      </div>
    </>
  );
}
