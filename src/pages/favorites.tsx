import React, { useCallback, useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Heart, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyFavorites, Listing, removeFavorite } from '@/lib/db';

export default function Favorites() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadFavorites = useCallback(async () => {
    setError('');
    try {
      setFavoriteProducts(await getMyFavorites());
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=/favorites');
      return;
    }
    setLoading(true);
    loadFavorites();
  }, [authLoading, user, router, loadFavorites]);

  const handleRemove = async (listing: Listing) => {
    setRemovingId(listing.id);
    setError('');
    try {
      await removeFavorite(listing.id);
      setFavoriteProducts((current) => current.filter((product) => product.id !== listing.id));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <SEO title="Favorit Saya - LoakinAja" description="Daftar barang favorit saya di LoakinAja" />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <Heart className="h-6 w-6 fill-current text-red-500" /> Favorit Saya
          </h1>
          <p className="mt-2 text-gray-500">Simpan barang incaranmu di sini agar tidak hilang.</p>
        </div>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white py-20 text-center text-sm text-gray-500">Memuat favorit...</div>
        ) : favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-lg">
                <Link href={`/product/${product.id}`} className="flex h-full flex-col">
                  <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.images?.[0] || `https://placehold.co/400x300/E2E8F0/1E293B?text=${encodeURIComponent(product.category)}`} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-grow flex-col p-3">
                    <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-800">{product.title}</h3>
                    <p className="mt-auto mb-1 font-bold text-loak-blue">Rp {product.price.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-500">{product.location}</p>
                  </div>
                </Link>
                <button type="button" onClick={() => handleRemove(product)} disabled={removingId === product.id} className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 text-gray-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50" aria-label={`Hapus ${product.title} dari favorit`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-100 bg-white py-20 text-center">
            <Heart className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-800">Belum ada barang favorit</h3>
            <p className="mb-6 max-w-sm text-gray-500">Kamu belum menambahkan barang apa pun ke daftar favorit. Yuk mulai cari barang incaranmu!</p>
            <Link href="/" className="rounded-lg bg-loak-blue px-6 py-2 font-medium text-white transition-colors hover:bg-loak-blue-dark">Mulai Belanja</Link>
          </div>
        )}
      </div>
    </>
  );
}
