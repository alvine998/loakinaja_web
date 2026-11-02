import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MessageSquare, ShieldCheck, MapPin, Share2, Heart } from 'lucide-react';
import { getListing, Listing } from '@/lib/db';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Listing | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof id !== 'string') return;
    getListing(id).then(setProduct).catch((reason: Error) => setError(reason.message));
  }, [id]);

  const title = product?.title || 'Memuat produk...';
  const images = product?.images?.length ? product.images : ['https://placehold.co/800x800/E2E8F0/1E293B?text=LoakinAja'];

  return (
    <>
      <Head>
        <title>{product?.title || 'Produk'} - LoakinAja</title>
      </Head>

      <div className="text-sm text-gray-500 mb-6 flex items-center">
        <Link href="/" className="hover:text-loak-blue">Beranda</Link>
        <span className="mx-2">{'>'}</span>
        <Link href="/category/handphone" className="hover:text-loak-blue">Handphone</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-900 font-medium truncate">{title}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Image */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[0]} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              {images.map((img, index) => (
                <div key={img} className="w-20 h-20 bg-gray-100 rounded-lg cursor-pointer border-2 border-transparent hover:border-loak-blue overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Foto ${index + 1} ${title}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/3 flex-grow">
            {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-3xl font-extrabold text-loak-blue mb-4">{product ? `Rp ${product.price.toLocaleString('id-ID')}` : ''}</p>
            
            <div className="flex items-center text-sm text-gray-600 mb-6">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-semibold mr-3">{product?.condition || 'Bekas'}</span>
              <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {product?.location || ''}
            </div>

            <div className="border-t border-b py-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-2">Detail Produk</h3>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li><span className="text-gray-400 w-24 inline-block">Kondisi:</span> {product?.condition || '-'}</li>
                <li><span className="text-gray-400 w-24 inline-block">Kategori:</span> {product?.category || '-'}</li>
              </ul>

              <h3 className="font-bold text-gray-900 mb-2">Deskripsi</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {product?.description || ''}
              </p>
            </div>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-loak-blue text-sm font-medium">
                <Heart className="w-5 h-5" /> Favorit
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-loak-blue text-sm font-medium">
                <Share2 className="w-5 h-5" /> Bagikan
              </button>
            </div>
          </div>

          {/* Action Card */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Atur Pembelian</h3>
              
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-loak-blue rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{product?.seller?.name || 'Penjual'}</p>
                  <p className="text-xs text-gray-500">Penjual LoakinAja</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded-lg mb-6 border border-green-100">
                <ShieldCheck className="w-5 h-5" />
                <span>Transaksi aman dengan <strong>Rekening Bersama LoakinAja</strong></span>
              </div>

              <div className="space-y-3">
                <Link href="/chat" className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-loak-blue rounded-lg text-sm font-bold text-loak-blue hover:bg-loak-light transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  Chat Penjual
                </Link>
                
                <Link href="/chat" className="w-full block text-center py-3 px-4 rounded-lg text-sm font-bold text-white bg-loak-blue hover:bg-loak-blue-dark transition-colors shadow-sm">
                  Beli Langsung
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
