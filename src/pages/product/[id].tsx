import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MessageSquare, ShieldCheck, MapPin, Share2, Heart, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getListing, Listing } from '@/lib/db';
import { getCategories } from '@/lib/categories';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Listing | null>(null);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const title = product?.title || 'Memuat produk...';
  const categoryLabel = product?.category || 'Kategori';
  const [categorySlug, setCategorySlug] = useState('');
  const images = product?.images?.length ? product.images : ['https://placehold.co/800x800/E2E8F0/1E293B?text=LoakinAja'];

  useEffect(() => {
    if (typeof id !== 'string') return;
    getListing(id).then(setProduct).catch((reason: Error) => setError(reason.message));
  }, [id]);

  useEffect(() => {
    if (!product?.category) return;
    getCategories().then((categories) => {
      const matched = categories.find((category) => category.name === product.category);
      setCategorySlug(matched?.slug || product.category.toLocaleLowerCase('id-ID').trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, ''));
    });
  }, [product?.category]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setZoomOpen(false);
  }, [id]);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomOpen(false);
      if (event.key === 'ArrowRight') setSelectedImageIndex((current) => (current + 1) % images.length);
      if (event.key === 'ArrowLeft') setSelectedImageIndex((current) => (current - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [zoomOpen, images.length]);

  return (
    <>
      <Head>
        <title>{product?.title || 'Produk'} - LoakinAja</title>
      </Head>

      <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto text-sm text-gray-500">
        <ol className="flex min-w-max items-center gap-2">
          <li><Link href="/" className="transition-colors hover:text-loak-blue">Beranda</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li><Link href={`/category/${encodeURIComponent(categorySlug || categoryLabel.toLocaleLowerCase('id-ID').replace(/\s+/g, '-'))}`} className="transition-colors hover:text-loak-blue">{categoryLabel}</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li aria-current="page" className="max-w-[min(60vw,32rem)] truncate font-medium text-gray-900">{title}</li>
        </ol>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Image */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
            <button type="button" onClick={() => setZoomOpen(true)} aria-label="Perbesar foto produk" className="group relative mb-4 block aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[selectedImageIndex]} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-2 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomIn className="h-4 w-4" /> Perbesar
              </span>
            </button>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, index) => (
                <button type="button" key={`${img}-${index}`} onClick={() => setSelectedImageIndex(index)} aria-label={`Pilih foto ${index + 1}`} aria-pressed={selectedImageIndex === index} className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors ${selectedImageIndex === index ? 'border-loak-blue' : 'border-transparent hover:border-loak-blue/50'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Foto ${index + 1} ${title}`} className="w-full h-full object-cover" />
                </button>
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

      {zoomOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto produk: ${title}`}
          onClick={() => setZoomOpen(false)}
        >
          <button type="button" onClick={() => setZoomOpen(false)} aria-label="Tutup foto" className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedImageIndex((current) => (current - 1 + images.length) % images.length); }} aria-label="Foto sebelumnya" className="absolute left-3 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-6">
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}
          <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[selectedImageIndex]} alt={`${title} - foto ${selectedImageIndex + 1}`} className="max-h-[82vh] max-w-[90vw] object-contain" />
            <p className="text-sm text-white/80">{selectedImageIndex + 1} / {images.length}</p>
          </div>
          {images.length > 1 && (
            <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedImageIndex((current) => (current + 1) % images.length); }} aria-label="Foto berikutnya" className="absolute right-3 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-6">
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
