import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Filter, ChevronDown } from 'lucide-react';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const categoryName = typeof slug === 'string' ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Kategori';

  const products = [
    { id: 1, title: 'iPhone 13 Pro Max 256GB - Mulus Like New', price: 'Rp 14.500.000', location: 'Jakarta Selatan', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=iPhone' },
    { id: 2, title: 'Macbook Pro M1 2020 8/256GB', price: 'Rp 11.200.000', location: 'Bandung', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Macbook' },
    { id: 3, title: 'iPad Pro 11 inch 2021 M1', price: 'Rp 10.000.000', location: 'Surabaya', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=iPad' },
    { id: 4, title: 'Samsung Galaxy S22 Ultra 256GB', price: 'Rp 12.500.000', location: 'Yogyakarta', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Samsung' },
  ];

  return (
    <>
      <Head>
        <title>{categoryName} - LoakinAja</title>
      </Head>
      
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 flex items-center">
        <Link href="/" className="hover:text-loak-blue">Beranda</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-900 font-medium">{categoryName}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 font-bold text-gray-800 mb-4 border-b pb-2">
              <Filter className="w-4 h-4" /> Filter
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Lokasi</h3>
              <div className="space-y-2">
                {['Jabodetabek', 'Bandung', 'Surabaya', 'Semarang'].map((loc) => (
                  <label key={loc} className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" className="rounded text-loak-blue focus:ring-loak-blue mr-2" />
                    {loc}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Harga</h3>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Min" className="w-full text-sm border rounded-md p-2 focus:outline-none focus:border-loak-blue" />
                <span className="text-gray-400">-</span>
                <input type="text" placeholder="Max" className="w-full text-sm border rounded-md p-2 focus:outline-none focus:border-loak-blue" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Kondisi</h3>
              <div className="space-y-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input type="checkbox" className="rounded text-loak-blue focus:ring-loak-blue mr-2" />
                  Baru
                </label>
                <label className="flex items-center text-sm text-gray-600">
                  <input type="checkbox" className="rounded text-loak-blue focus:ring-loak-blue mr-2" defaultChecked />
                  Bekas
                </label>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-loak-blue text-white font-medium py-2 rounded-lg text-sm hover:bg-loak-blue-dark transition-colors">
              Terapkan Filter
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Menampilkan produk untuk "{categoryName}"</h1>
            <button className="flex items-center gap-1 text-sm text-gray-600 bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-50">
              Urutkan <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col group">
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 font-medium">{product.title}</h3>
                    <p className="text-loak-blue font-bold text-lg mt-auto mb-1">{product.price}</p>
                    <p className="text-xs text-gray-500">{product.location}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
