import React from 'react';
import SEO from '@/components/SEO';
import Link from 'next/link';
import { Smartphone, Monitor, Camera, Tv, Car, Home as HomeIcon, Search, ShieldCheck, BadgeCheck, Truck, ArrowRight, Star, Sparkles } from 'lucide-react';

export default function Home() {
  const categories = [
    { name: 'Handphone', icon: <Smartphone className="w-6 h-6 text-loak-blue" />, slug: 'handphone' },
    { name: 'Komputer', icon: <Monitor className="w-6 h-6 text-loak-blue" />, slug: 'komputer' },
    { name: 'Elektronik', icon: <Tv className="w-6 h-6 text-loak-blue" />, slug: 'elektronik' },
    { name: 'Kamera', icon: <Camera className="w-6 h-6 text-loak-blue" />, slug: 'kamera' },
    { name: 'Otomotif', icon: <Car className="w-6 h-6 text-loak-blue" />, slug: 'otomotif' },
    { name: 'Properti', icon: <HomeIcon className="w-6 h-6 text-loak-blue" />, slug: 'properti' },
  ];

  const products = [
    { id: 1, title: 'iPhone 13 Pro Max 256GB - Mulus Like New', price: 'Rp 14.500.000', location: 'Jakarta Selatan', condition: 'Like New', rating: 4.9, image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=iPhone' },
    { id: 2, title: 'Macbook Pro M1 2020 8/256GB', price: 'Rp 11.200.000', location: 'Bandung', condition: 'Sangat Baik', rating: 4.8, image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Macbook' },
    { id: 3, title: 'Kamera Mirrorless Sony A6400', price: 'Rp 10.000.000', location: 'Surabaya', condition: 'Baik', rating: 4.7, image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Kamera' },
    { id: 4, title: 'PS5 Digital Edition Bekas', price: 'Rp 7.500.000', location: 'Yogyakarta', condition: 'Sangat Baik', rating: 4.9, image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=PS5' },
    { id: 5, title: 'Honda Vario 150 2021', price: 'Rp 18.000.000', location: 'Semarang', condition: 'Baik', rating: 4.6, image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Vario' },
    { id: 6, title: 'Monitor LG 24 Inch IPS', price: 'Rp 1.200.000', location: 'Malang', condition: 'Baik', rating: 4.8, image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Monitor' },
  ];

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

  return (
    <>
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
                onSubmit={(e) => e.preventDefault()}
                className="mt-7 flex max-w-md items-center gap-2 rounded-xl bg-white p-2 shadow-lg"
              >
                <Search className="ml-2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari handphone, laptop, motor..."
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
        <section className="grid gap-4 sm:grid-cols-3">
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
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-6">
            {categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.slug} className="group">
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-loak-blue/30 hover:shadow-lg sm:p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-loak-light transition-transform group-hover:scale-110 sm:h-14 sm:w-14">
                    {category.icon}
                  </div>
                  <span className="text-center text-[13px] font-medium text-gray-700 sm:text-sm">{category.name}</span>
                </div>
              </Link>
            ))}
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
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-loak-blue-dark shadow-sm">
                      {product.condition}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-800">{product.title}</h3>
                    <div className="mb-1 flex items-center gap-1 text-xs text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                    <p className="mt-auto text-loak-blue font-bold">{product.price}</p>
                    <p className="text-xs text-gray-500">{product.location}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-loak-light px-6 py-12 text-center md:px-16">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-loak-blue/10"></div>
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-loak-blue/10"></div>
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">Punya Barang Tak Terpakai?</h2>
            <p className="mt-3 text-gray-600">
              Jual di LoakinAja dan dapatkan uang dengan cepat. Gratis posting, aman dengan Rekening Bersama.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
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
