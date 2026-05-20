import React from 'react';
import SEO from '@/components/SEO';
import Link from 'next/link';
import { Smartphone, Monitor, Camera, Tv, Car, Home as HomeIcon } from 'lucide-react';

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
    { id: 1, title: 'iPhone 13 Pro Max 256GB - Mulus Like New', price: 'Rp 14.500.000', location: 'Jakarta Selatan', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=iPhone' },
    { id: 2, title: 'Macbook Pro M1 2020 8/256GB', price: 'Rp 11.200.000', location: 'Bandung', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Macbook' },
    { id: 3, title: 'Kamera Mirrorless Sony A6400', price: 'Rp 10.000.000', location: 'Surabaya', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Kamera' },
    { id: 4, title: 'PS5 Digital Edition Bekas', price: 'Rp 7.500.000', location: 'Yogyakarta', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=PS5' },
    { id: 5, title: 'Honda Vario 150 2021', price: 'Rp 18.000.000', location: 'Semarang', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Vario' },
    { id: 6, title: 'Monitor LG 24 Inch IPS', price: 'Rp 1.200.000', location: 'Malang', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Monitor' },
  ];

  return (
    <>
      <SEO />

      <div className="flex flex-col gap-8">
        {/* Hero Banner */}
        <div className="w-full h-64 md:h-80 bg-gradient-to-r from-loak-blue-dark to-loak-blue rounded-xl flex items-center justify-between px-8 md:px-16 text-white shadow-md overflow-hidden relative">
          <div className="z-10 max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Temukan Barang Bekas Berkualitas!</h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">Jual beli aman dengan fitur Rekening Bersama LoakinAja.</p>
            <button className="bg-white text-loak-blue font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors">
              Mulai Belanja
            </button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute right-32 bottom-0 w-48 h-48 bg-white opacity-10 rounded-full -mb-10"></div>
        </div>

        {/* Categories Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Kategori Populer</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.slug}>
                <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-loak-light transition-all cursor-pointer group">
                  <div className="bg-loak-light p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Products */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Rekomendasi Untukmu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col group">
                  <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 font-medium">{product.title}</h3>
                    <p className="text-loak-blue font-bold mt-auto mb-1">{product.price}</p>
                    <p className="text-xs text-gray-500">{product.location}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
