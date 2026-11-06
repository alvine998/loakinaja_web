import React, { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { Smartphone, Search, ShieldCheck, BadgeCheck, Truck, ArrowRight, Sparkles, Zap, Droplets, HeartPulse, Wifi, Receipt } from 'lucide-react';
import { getListings, Listing, PRICE_PER_TOKEN, TOKEN_PACKAGES } from '@/lib/db';
import { CATEGORY_ICONS, DEFAULT_CATEGORIES, getCategories, type Category } from '@/lib/categories';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    getListings({ limit: 6 }).then(setProducts).catch(() => setProducts([]));
    getCategories().then(setCategories);
  }, []);

  const features = [
    { icon: <ShieldCheck className="w-6 h-6 text-loak-blue" />, title: 'Rekening Bersama', desc: 'Uang baru cair setelah barang sampai & kamu konfirmasi.' },
    { icon: <BadgeCheck className="w-6 h-6 text-loak-blue" />, title: 'Barang Terverifikasi', desc: 'Cek kondisi & keaslian sebelum menyetujui transaksi.' },
    { icon: <Truck className="w-6 h-6 text-loak-blue" />, title: 'Pengiriman Aman', desc: 'Kerja sama dengan ekspedisi terpercaya di seluruh Indonesia.' },
  ];

  const stats = [
    { value: '120rb+', label: 'Barang Terjual' },
    { value: '50rb+', label: 'Penjual Aktif' },
    { value: '4.8/5', label: 'Rating Amanah' },
  ];

  const billCategories = [
    { name: 'Pulsa & Paket Data', icon: <Smartphone className="h-5 w-5" /> },
    { name: 'Listrik', icon: <Zap className="h-5 w-5" /> },
    { name: 'Air', icon: <Droplets className="h-5 w-5" /> },
    { name: 'BPJS', icon: <HeartPulse className="h-5 w-5" /> },
    { name: 'Internet', icon: <Wifi className="h-5 w-5" /> },
    { name: 'Tagihan lain', icon: <Receipt className="h-5 w-5" /> },
  ];

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': 'https://loakinaja.com/#organization',
            name: 'LoakinAja',
            url: 'https://loakinaja.com/',
            description: 'Marketplace Indonesia untuk jual beli barang bekas berkualitas dengan dukungan Rekening Bersama.',
            email: 'support@loakinaja.com',
            telephone: '+62-812-3456-7890',
            contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: 'support@loakinaja.com', telephone: '+62-812-3456-7890', availableLanguage: ['Indonesian'] },
            address: { '@type': 'PostalAddress', streetAddress: 'Gedung Inovasi Lt. 5, Jl. Jend. Sudirman No. 123', addressLocality: 'Jakarta Selatan', postalCode: '12190', addressCountry: 'ID' },
          },
          { '@context': 'https://schema.org', '@type': 'WebSite', '@id': 'https://loakinaja.com/#website', url: 'https://loakinaja.com/', name: 'LoakinAja', inLanguage: 'id-ID', publisher: { '@id': 'https://loakinaja.com/#organization' }, potentialAction: { '@type': 'SearchAction', target: 'https://loakinaja.com/category/semua?q={search_term_string}', 'query-input': 'required name=search_term_string' } },
          { '@context': 'https://schema.org', '@type': 'WebPage', '@id': 'https://loakinaja.com/#webpage', url: 'https://loakinaja.com/', name: 'LoakinAja - Jual Beli Barang Bekas Terpercaya', isPartOf: { '@id': 'https://loakinaja.com/#website' }, about: { '@id': 'https://loakinaja.com/#organization' }, inLanguage: 'id-ID' },
          { '@context': 'https://schema.org', '@type': 'OfferCatalog', name: 'Paket token untuk memasang iklan', url: 'https://loakinaja.com/harga', itemListElement: TOKEN_PACKAGES.map((item) => ({ '@type': 'Offer', name: `${item.tokens} Token - ${item.label}`, price: item.price, priceCurrency: 'IDR', url: 'https://loakinaja.com/harga' })) },
        ]) }} />
        <meta name="content-signal" content="search=yes, ai-train=no" />
      </Head>
      <SEO />

      <div className="flex flex-col gap-12">
        {/* Hero Banner */}
        <section className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-loak-blue-dark via-loak-blue to-loak-blue-dark px-6 py-14 md:px-16 md:py-20 text-white shadow-xl">
          {/* Decorative background shapes */}
          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl"></div>
          <div className="pointer-events-none absolute -bottom-24 right-32 h-72 w-72 rounded-full bg-white/10 blur-2xl"></div>
          <div className="pointer-events-none absolute left-1/3 top-10 h-3 w-3 rounded-full bg-white/40"></div>

          <div className="relative z-10 grid max-w-5xl gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm">
                <Sparkles className="h-4 w-4" /> Marketplace Barang Bekas #1
              </span>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl text-balance">
                Temukan Barang Bekas <span className="text-loak-light">Berkualitas</span>!
              </h1>
              <p className="mt-4 max-w-md text-lg text-white/90">
                Jual beli aman & mudah dengan fitur Rekening Bersama LoakinAja. Uang aman, barang sampai, baru bayar.
              </p>

              {/* Inline search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = `/category/semua?q=${encodeURIComponent(search)}`;
                }}
                className="mt-7 flex max-w-md items-center gap-2 rounded-xl bg-white p-2 shadow-lg"
              >
                <Search className="ml-2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari handphone, laptop, motor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent px-1 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-loak-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-loak-blue-dark"
                >
                  Cari
                </button>
              </form>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap gap-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-white/80">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero floating card */}
            <div className="relative hidden md:block">
              <div className="ml-auto w-72 rounded-2xl bg-white/95 p-5 text-left shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-loak-light">
                    <ShieldCheck className="h-6 w-6 text-loak-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Transaksi Aman</p>
                    <p className="text-xs text-gray-500">Dana ditahan sebagai jaminan</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-3">
                  <div>
                    <p className="text-xs text-gray-500 line-through">Rp 15.000.000</p>
                    <p className="text-lg font-bold text-loak-blue">Rp 12.500.000</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Hemat 17%
                  </span>
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-loak-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-loak-blue-dark">
                  Mulai Belanja <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust / Features */}
        <section aria-label="Keunggulan marketplace" className="grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-loak-light">
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Categories Section */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Kategori Populer</h2>
              <p className="mt-1 text-sm text-gray-500">Pilih kategori untuk mulai menjelajah</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.id} className="group">
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-loak-blue/30 hover:shadow-lg sm:p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-loak-light transition-transform group-hover:scale-110 sm:h-14 sm:w-14">
                    {(() => { const Icon = CATEGORY_ICONS[category.icon] || Smartphone; return <Icon className="h-6 w-6 text-loak-blue" />; })()}
                  </div>
                  <span className="text-center text-[13px] font-medium text-gray-700 sm:text-sm">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bill payment section */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid gap-6 bg-gradient-to-r from-loak-light via-white to-white p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_1.2fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-loak-blue shadow-sm">
                <Receipt className="h-4 w-4" /> Layanan digital
              </span>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Bayar Tagihan, Praktis di LoakinAja</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray-600">
                Isi pulsa dan paket data, atau cek tagihan bulanan dalam satu tempat. Pembayaran mudah dan aman.
              </p>
              <Link href="/ppob" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-loak-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-loak-blue-dark">
                Bayar Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {billCategories.slice(0, 3).map((category) => (
                <Link href="/ppob" key={category.name} className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-loak-blue/30 hover:shadow-md sm:p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-loak-light text-loak-blue transition-colors group-hover:bg-loak-blue group-hover:text-white">
                    {category.icon}
                  </span>
                  <span className="text-xs font-semibold text-gray-700 sm:text-sm">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Products */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Rekomendasi Untukmu</h2>
              <p className="mt-1 text-sm text-gray-500">Barang pilihan dengan kondisi terbaik</p>
            </div>
            <Link
              href="/category/elektronik"
              className="hidden items-center gap-1 text-sm font-semibold text-loak-blue hover:text-loak-blue-dark sm:flex"
            >
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group">
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images?.[0] || `https://placehold.co/400x300/E2E8F0/1E293B?text=${encodeURIComponent(product.category)}`}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-loak-blue-dark shadow-sm">
                      {product.condition}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-800">{product.title}</h3>
                    <p className="mt-auto text-loak-blue font-bold">Rp {product.price.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-500">{product.location}</p>
                  </div>
                </div>
              </Link>
            ))}
            {products.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                Belum ada iklan aktif. Coba lagi nanti atau mulai jualan sekarang.
              </p>
            )}
          </div>
        </section>

        <section aria-label="Informasi LoakinAja" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">Tentang LoakinAja</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">LoakinAja adalah marketplace Indonesia untuk jual beli barang bekas berkualitas. Pengguna dapat menjelajahi produk berdasarkan kategori, lokasi, harga, dan kondisi. Transaksi Rekening Bersama diverifikasi manual oleh administrator.</p>
          <p className="mt-3 text-sm text-gray-600">Paket penjual mulai dari {TOKEN_PACKAGES[0]?.tokens} token seharga Rp {TOKEN_PACKAGES[0]?.price.toLocaleString('id-ID')} (Rp {PRICE_PER_TOKEN.toLocaleString('id-ID')} per token). <Link href="/harga" className="font-semibold text-loak-blue underline">Lihat semua harga</Link>.</p>
          <nav aria-label="Tentang dan kebijakan" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            <Link href="/tentang-kami" className="text-loak-blue underline">Tentang kami</Link>
            <Link href="/hubungi-kami" className="text-loak-blue underline">Kontak</Link>
            <Link href="/syarat-ketentuan" className="text-loak-blue underline">Syarat dan Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="text-loak-blue underline">Kebijakan Privasi</Link>
            <a href="mailto:support@loakinaja.com" className="text-loak-blue underline">support@loakinaja.com</a>
            <a href="tel:+6281234567890" className="text-loak-blue underline">+62 812-3456-7890</a>
          </nav>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-loak-light px-6 py-12 text-center md:px-16">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-loak-blue/10"></div>
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-loak-blue/10"></div>
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">Punya Barang Tak Terpakai?</h2>
            <p className="mt-3 text-gray-600">
              Jual di LoakinAja dan dapatkan uang dengan cepat. Cukup pakai 1 token untuk 1 iklan, aman dengan Rekening Bersama.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/jual"
                className="rounded-xl bg-loak-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-loak-blue-dark"
              >
                Mulai Jualan
              </Link>
              <Link
                href="/cara-jualan"
                className="rounded-xl border border-loak-blue px-6 py-3 text-sm font-semibold text-loak-blue transition-colors hover:bg-white"
              >
                Pelajari Caranya
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
