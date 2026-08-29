import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Coins, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  createListing,
  getMyListings,
  CATEGORIES,
  CONDITIONS,
  Listing,
} from '@/lib/db';

export default function Jual() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    condition: CONDITIONS[0],
    description: '',
    location: '',
    image: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/jual');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      getMyListings().then(setListings);
    }
  }, [user]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) return;

    if (user.tokens < 1) {
      setError('Token tidak cukup. 1 token diperlukan untuk memasang 1 iklan.');
      return;
    }
    if (!form.title.trim() || !form.price || !form.location.trim()) {
      setError('Judul, harga, dan lokasi wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await createListing({
        title: form.title,
        category: form.category,
        price: Number(form.price),
        condition: form.condition,
        description: form.description,
        location: form.location,
        image: form.image || undefined,
      });
      await refresh();
      setListings(await getMyListings());
      setSuccess('Iklan berhasil dipasang! 1 token telah digunakan.');
      setForm({
        title: '',
        category: CATEGORIES[0],
        price: '',
        condition: CONDITIONS[0],
        description: '',
        location: '',
        image: '',
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-20">Memuat...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Jual Barang - LoakinAja</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pasang Iklan</h1>
            <p className="text-sm text-gray-500 mt-1">
              Setiap iklan membutuhkan <strong>1 token</strong>.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-loak-light px-4 py-2 text-loak-blue-dark">
            <Coins className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {user.tokens} token tersedia
            </span>
          </div>
        </div>

        {user.tokens < 1 && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm text-amber-800">
              Token kamu habis. Beli token untuk mulai memasang iklan.
            </p>
            <Link
              href="/token"
              className="shrink-0 text-center text-sm font-semibold text-white bg-loak-blue rounded-md px-4 py-2 hover:bg-loak-blue-dark transition-colors"
            >
              Beli Token
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" /> {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Judul Iklan</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Contoh: iPhone 13 Pro Max 256GB - Mulus"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kondisi</label>
              <select
                value={form.condition}
                onChange={(e) => set('condition', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm bg-white"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="14500000"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lokasi</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Jakarta Selatan"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Jelaskan kondisi, spesifikasi, dan alasan dijual..."
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL Gambar <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <div className="mt-1 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={form.image}
                onChange={(e) => set('image', e.target.value)}
                placeholder="https://..."
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || user.tokens < 1}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-loak-blue hover:bg-loak-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-loak-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Coins className="h-4 w-4" />
            {submitting ? 'Memproses...' : `Pasang Iklan (1 Token)`}
          </button>
        </form>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Iklan Saya</h2>
          {listings.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada iklan yang dipasang.</p>
          ) : (
            <div className="space-y-3">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.image}
                    alt={l.title}
                    className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
                    <p className="text-xs text-gray-500">
                      {l.category} · {l.condition} · {l.location}
                    </p>
                    <p className="text-sm font-bold text-loak-blue">
                      Rp {Number(l.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
