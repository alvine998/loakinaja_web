import React from 'react';
import SEO from '@/components/SEO';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';

export default function Favorites() {
  // Dummy data for favorites
  const favoriteProducts = [
    { id: 1, title: 'iPhone 13 Pro Max 256GB - Mulus Like New', price: 'Rp 14.500.000', location: 'Jakarta Selatan', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=iPhone' },
    { id: 3, title: 'Kamera Mirrorless Sony A6400', price: 'Rp 10.000.000', location: 'Surabaya', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Kamera' },
  ];

  return (
    <>
      <SEO title="Favorit Saya - LoakinAja" description="Daftar barang favorit saya di LoakinAja" />

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            Favorit Saya
          </h1>
          <p className="text-gray-500 mt-2">Simpan barang incaranmu di sini agar tidak hilang.</p>
        </div>

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col group relative">
                <Link href={`/product/${product.id}`} className="flex flex-col h-full">
                  <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 font-medium">{product.title}</h3>
                    <p className="text-loak-blue font-bold mt-auto mb-1">{product.price}</p>
                    <p className="text-xs text-gray-500">{product.location}</p>
                  </div>
                </Link>
                {/* Remove button */}
                <button 
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors z-10"
                  aria-label="Hapus dari favorit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-100 border-dashed">
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada barang favorit</h3>
            <p className="text-gray-500 max-w-sm mb-6">Kamu belum menambahkan barang apapun ke daftar favorit. Yuk mulai cari barang incaranmu!</p>
            <Link href="/" className="bg-loak-blue text-white font-medium py-2 px-6 rounded-lg hover:bg-loak-blue-dark transition-colors">
              Mulai Belanja
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
