import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AlertCircle,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  Coins,
  Image as ImageIcon,
  Loader2,
  Package,
  PackageOpen,
  Pencil,
  PlusCircle,
  Store,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  CATEGORIES,
  CONDITIONS,
  Listing,
  ListingStatus,
  deleteListing,
  getMyListings,
  setListingStatus,
  updateListing,
} from '@/lib/db';

type Filter = 'all' | ListingStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'active', label: 'Aktif' },
  { id: 'sold', label: 'Terjual' },
];

const EMPTY_EDIT_FORM = {
  title: '',
  category: CATEGORIES[0],
  condition: CONDITIONS[0],
  price: '',
  location: '',
  description: '',
};

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-loak-light text-loak-blue">
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 break-words text-lg font-bold text-gray-900 sm:text-2xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export default function DashboardPenjual() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editing, setEditing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/dashboard');
    }
  }, [loading, user, router]);

  const loadListings = useCallback(async () => {
    setListings(await getMyListings());
  }, []);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    loadListings().finally(() => setFetching(false));
  }, [user, loadListings]);

  useEffect(() => {
    if (!editing) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditing(null);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [editing]);

  const stats = useMemo(() => {
    const active = listings.filter((l) => l.status === 'active');
    return {
      total: listings.length,
      active: active.length,
      sold: listings.length - active.length,
      value: active.reduce((sum, l) => sum + l.price, 0),
    };
  }, [listings]);

  const visible = useMemo(
    () =>
      filter === 'all' ? listings : listings.filter((l) => l.status === filter),
    [listings, filter]
  );

  const countFor = (id: Filter) =>
    id === 'all' ? stats.total : id === 'active' ? stats.active : stats.sold;

  const openEdit = (listing: Listing) => {
    setError('');
    setNotice('');
    setEditError('');
    setEditForm({
      title: listing.title,
      category: listing.category,
      condition: listing.condition,
      price: String(listing.price),
      location: listing.location,
      description: listing.description,
    });
    setEditing(listing);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setEditError('');
    if (!editForm.title.trim() || editForm.price === '' || !editForm.location.trim()) {
      setEditError('Judul, harga, dan lokasi wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      await updateListing(editing.id, {
        title: editForm.title,
        category: editForm.category,
        price: Number(editForm.price),
        condition: editForm.condition,
        description: editForm.description,
        location: editForm.location,
      });
      await loadListings();
      setEditing(null);
      setNotice('Iklan berhasil diperbarui.');
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (listing: Listing) => {
    setError('');
    setNotice('');
    setBusyId(listing.id);
    try {
      const next: ListingStatus = listing.status === 'active' ? 'sold' : 'active';
      await setListingStatus(listing.id, next);
      await loadListings();
      setNotice(
        next === 'sold'
          ? `"${listing.title}" ditandai terjual.`
          : `"${listing.title}" aktif kembali.`
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (listing: Listing) => {
    if (!window.confirm(`Hapus iklan "${listing.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    setError('');
    setNotice('');
    setBusyId(listing.id);
    try {
      await deleteListing(listing.id);
      await loadListings();
      setNotice('Iklan berhasil dihapus.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
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
        <title>Dashboard Penjual - LoakinAja</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              <Store className="h-6 w-6 shrink-0 text-loak-blue sm:h-7 sm:w-7" />
              Dashboard Penjual
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Halo <span className="font-medium text-gray-700">{user.name}</span>, kelola
              iklan dan pantau jualan kamu di sini.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/token"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-loak-blue px-5 py-2.5 text-sm font-semibold text-loak-blue transition-colors hover:bg-loak-light"
            >
              <Coins className="h-4 w-4" /> Beli Token
            </Link>
            <Link
              href="/jual"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-loak-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-loak-blue-dark"
            >
              <PlusCircle className="h-4 w-4" /> Pasang Iklan
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" /> {notice}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            icon={<Package className="h-5 w-5" />}
            label="Iklan Aktif"
            value={String(stats.active)}
            hint="Tayang untuk pembeli"
          />
          <StatCard
            icon={<BadgeCheck className="h-5 w-5" />}
            label="Terjual"
            value={String(stats.sold)}
          />
          <StatCard
            icon={<Boxes className="h-5 w-5" />}
            label="Total Iklan"
            value={String(stats.total)}
          />
          <StatCard
            icon={<Coins className="h-5 w-5" />}
            label="Token Tersisa"
            value={String(user.tokens)}
            hint="1 token = 1 iklan"
          />
          <StatCard
            icon={<Tag className="h-5 w-5" />}
            label="Nilai Iklan Aktif"
            value={formatRupiah(stats.value)}
          />
        </div>

        <div className="mt-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Iklan Saya</h2>
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
                    filter === f.id
                      ? 'bg-white text-loak-blue shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f.label} ({countFor(f.id)})
                </button>
              ))}
            </div>
          </div>

          {fetching ? (
            <p className="py-10 text-center text-sm text-gray-500">Memuat iklan...</p>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <Store className="mb-4 h-14 w-14 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-800">
                {listings.length === 0 ? 'Belum ada iklan' : 'Tidak ada iklan di filter ini'}
              </h3>
              <p className="mb-6 max-w-sm text-sm text-gray-500">
                {listings.length === 0
                  ? 'Pasang iklan pertamamu dan mulai jualan. Cukup 1 token untuk 1 iklan.'
                  : 'Coba pilih filter lain untuk melihat iklan kamu.'}
              </p>
              {listings.length === 0 ? (
                <Link
                  href="/jual"
                  className="rounded-lg bg-loak-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-loak-blue-dark"
                >
                  Pasang Iklan Pertama
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="rounded-lg border border-loak-blue px-6 py-2.5 text-sm font-semibold text-loak-blue transition-colors hover:bg-loak-light"
                >
                  Lihat Semua Iklan
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((listing) => {
                const cover = listing.images?.[0];
                const isBusy = busyId === listing.id;
                return (
                  <div
                    key={listing.id}
                    className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={listing.title}
                          className="h-20 w-20 shrink-0 rounded-lg bg-gray-100 object-cover sm:h-24 sm:w-24"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 sm:h-24 sm:w-24">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="line-clamp-2 text-sm font-medium text-gray-800">
                            {listing.title}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              listing.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {listing.status === 'active' ? 'Aktif' : 'Terjual'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {listing.category} · {listing.condition} · {listing.location}
                        </p>
                        <p className="mt-1 text-sm font-bold text-loak-blue">
                          {formatRupiah(listing.price)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Dipasang {formatDate(listing.createdAt)}
                          {listing.images?.length > 1 && ` · ${listing.images.length} foto`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => openEdit(listing)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(listing)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-loak-blue px-3 py-2 text-xs font-semibold text-loak-blue transition-colors hover:bg-loak-light disabled:opacity-50"
                      >
                        {listing.status === 'active' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Tandai Terjual
                          </>
                        ) : (
                          <>
                            <PackageOpen className="h-3.5 w-3.5" /> Aktifkan Kembali
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(listing)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto bg-black/40"
          onClick={() => !saving && setEditing(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Edit iklan"
        >
          <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
            <div
              className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Iklan</h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Perbarui informasi iklan kamu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  aria-label="Tutup"
                  className="text-gray-400 transition-colors hover:text-gray-900 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" /> {editError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSaveEdit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Judul Iklan
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kategori
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kondisi
                    </label>
                    <select
                      value={editForm.condition}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, condition: e.target.value }))
                      }
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
                    <label className="block text-sm font-medium text-gray-700">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, price: e.target.value }))
                      }
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, location: e.target.value }))
                      }
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-loak-blue px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
