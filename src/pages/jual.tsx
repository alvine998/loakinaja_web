import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Coins,
  AlertCircle,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  createListing,
  getMyListings,
  CATEGORIES,
  CONDITIONS,
  Listing,
} from '@/lib/db';

const MAX_IMAGES = 10;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024;

type UploadImage = {
  id: string;
  dataUrl: string;
  size: number;
};

const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Photos are downscaled before being stored because the mock backend keeps
// everything in localStorage, where raw camera files would blow the quota.
async function readImage(file: File): Promise<UploadImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Gagal membaca ${file.name}.`));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () =>
      reject(new Error(`${file.name} bukan gambar yang didukung.`));
    el.src = dataUrl;
  });

  const scale = Math.min(1, 1080 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext('2d');

  let compressed = dataUrl;
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    compressed = canvas.toDataURL('image/jpeg', 0.65);
  }

  return {
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
    dataUrl: compressed,
    size: file.size,
  };
}

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
  });
  const [images, setImages] = useState<UploadImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalBytes = images.reduce((sum, img) => sum + img.size, 0);

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

  const handleFiles = async (fileList: FileList | null) => {
    // Snapshot the files before clearing the input: resetting the value empties
    // the live FileList.
    const selected = fileList ? Array.from(fileList) : [];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (selected.length === 0) return;

    setError('');
    setSuccess('');

    if (images.length + selected.length > MAX_IMAGES) {
      setError(
        `Maksimal ${MAX_IMAGES} gambar. Kamu sudah memilih ${images.length} gambar.`
      );
      return;
    }

    const notImage = selected.find((f) => !f.type.startsWith('image/'));
    if (notImage) {
      setError(`${notImage.name} bukan file gambar.`);
      return;
    }

    const selectedBytes = selected.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes + selectedBytes > MAX_TOTAL_BYTES) {
      setError(
        `Total ukuran gambar maksimal ${formatBytes(MAX_TOTAL_BYTES)}. ` +
          `Terpakai ${formatBytes(totalBytes)}, dipilih ${formatBytes(selectedBytes)}.`
      );
      return;
    }

    setUploading(true);
    try {
      const added: UploadImage[] = [];
      for (const file of selected) {
        added.push(await readImage(file));
      }
      setImages((prev) => [...prev, ...added]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((img) => img.id !== id));

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
        images: images.map((img) => img.dataUrl),
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
      });
      setImages([]);
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

  const cover = images[0]?.dataUrl;
  const priceNumber = Number(form.price);
  const previewPrice =
    form.price !== '' && Number.isFinite(priceNumber) && priceNumber >= 0
      ? `Rp ${priceNumber.toLocaleString('id-ID')}`
      : 'Rp -';

  return (
    <>
      <Head>
        <title>Jual Barang - LoakinAja</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Pasang Iklan</h1>
            <p className="text-sm text-gray-500 mt-1">
              Setiap iklan membutuhkan <strong>1 token</strong>.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-loak-light px-4 py-2 text-loak-blue-dark sm:self-auto">
            <Coins className="h-5 w-5" />
            <span className="text-sm font-semibold whitespace-nowrap">
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
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
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Foto Barang <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <span className="text-xs text-gray-500">
                  {images.length}/{MAX_IMAGES} gambar · {formatBytes(totalBytes)}/
                  {formatBytes(MAX_TOTAL_BYTES)}
                </span>
              </div>

              <label
                className={`mt-1 flex flex-col items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  uploading || images.length >= MAX_IMAGES
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-loak-blue hover:bg-loak-light/40 cursor-pointer'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading || images.length >= MAX_IMAGES}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload className="h-6 w-6 text-loak-blue" />
                <span className="text-sm font-medium text-gray-700">
                  {uploading
                    ? 'Memproses gambar...'
                    : images.length >= MAX_IMAGES
                      ? `Batas ${MAX_IMAGES} gambar tercapai`
                      : 'Pilih gambar atau ambil foto'}
                </span>
                <span className="text-xs text-gray-400">
                  Maksimal {MAX_IMAGES} gambar, total {formatBytes(MAX_TOTAL_BYTES)} (JPG, PNG, WEBP)
                </span>
              </label>

              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.dataUrl}
                        alt={`Gambar ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          Utama
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        aria-label={`Hapus gambar ${index + 1}`}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

          <aside className="lg:sticky lg:top-24" aria-label="Preview iklan">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <Eye className="h-4 w-4 text-loak-blue" />
                <h2 className="text-sm font-bold text-gray-900">Preview Iklan</h2>
              </div>
              <p className="text-xs text-gray-500">
                Begini iklan kamu terlihat oleh calon pembeli.
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt="Foto utama iklan"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">Belum ada foto</span>
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-loak-blue-dark shadow-sm">
                    {form.condition}
                  </span>

                  {images.length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                      1/{images.length}
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <h3
                    className={`mb-2 line-clamp-2 text-sm font-medium ${
                      form.title ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {form.title || 'Judul iklan kamu'}
                  </h3>
                  <p className="text-loak-blue font-bold">{previewPrice}</p>
                  <p
                    className={`text-xs ${form.location ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    {form.location || 'Lokasi'}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {form.category} · {form.condition}
                  </p>
                </div>
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {images.slice(1).map((img, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={img.dataUrl}
                      alt={`Foto ${index + 2}`}
                      className="aspect-square w-full rounded-lg border border-gray-200 object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Deskripsi
                </p>
                <p
                  className={`mt-1 line-clamp-3 text-xs leading-relaxed ${
                    form.description ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {form.description || 'Deskripsi barang kamu akan tampil di sini.'}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-loak-light text-xs font-bold text-loak-blue">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-gray-400">Penjual</p>
                </div>
              </div>
            </div>

            <p className="mt-3 px-1 text-[11px] leading-relaxed text-gray-400">
              Foto pertama dipakai sebagai gambar utama. Pastikan judul, harga, dan
              lokasi sudah benar sebelum memasang iklan.
            </p>
          </aside>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Iklan Saya</h2>
          {listings.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada iklan yang dipasang.</p>
          ) : (
            <div className="space-y-3">
              {listings.map((l) => {
                const listingCover = l.images?.[0];
                return (
                  <div
                    key={l.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    {listingCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listingCover}
                        alt={l.title}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
