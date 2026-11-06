import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, ArrowRight, Clock3, Loader2, Search, Smartphone, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createPpobQuote, getMyPpobOrders, getPpobProducts, PpobOrder, PpobProduct, PpobType, startPpobPayment } from '@/lib/db';
import { formatRupiah } from '@/lib/format';

const statusLabels: Record<string, string> = {
  quoted: 'Siap dibayar', creating_payment: 'Menyiapkan pembayaran', awaiting_payment: 'Menunggu pembayaran',
  processing: 'Sedang diproses', pending: 'Diproses provider', success: 'Berhasil', failed: 'Gagal', expired: 'Kedaluwarsa',
};

export default function PpobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [guest, setGuest] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);
  const [type, setType] = useState<PpobType>('prepaid');
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [productCode, setProductCode] = useState('');
  const [customerNo, setCustomerNo] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [orders, setOrders] = useState<PpobOrder[]>([]);
  const [quote, setQuote] = useState<PpobOrder | null>(null);
  const [error, setError] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guestToken, setGuestToken] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    setGuest(!user);
    setAuthResolved(true);
  }, [authLoading, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (!authResolved) return;
    let active = true;
    setLoadingCatalog(true);
    getPpobProducts(type, debouncedSearch, category)
      .then((result) => {
        if (!active) return;
        setProducts(result.data);
        setCategories(result.categories);
      })
      .catch((catalogError) => active && setError((catalogError as Error).message))
      .finally(() => active && setLoadingCatalog(false));
    return () => { active = false; };
  }, [authResolved, type, debouncedSearch, category]);

  useEffect(() => {
    if (!authResolved || guest) return;
    getMyPpobOrders().then(setOrders).catch(() => undefined);
  }, [authResolved, guest]);

  const selected = useMemo(() => products.find((product) => product.code === productCode) || null, [products, productCode]);

  const handleQuote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !customerNo.trim()) return;
    const isGuest = !user;
    setGuest(isGuest);
    if (isGuest && (!buyerName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail) || buyerPhone.trim().length < 8)) {
      setError('Masukkan nama, email yang valid, dan nomor HP untuk melanjutkan sebagai tamu.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const createdOrder = await createPpobQuote({
        type,
        productCode: selected.code,
        customerNo: customerNo.trim(),
        ...(isGuest ? { buyerName: buyerName.trim(), buyerEmail: buyerEmail.trim(), buyerPhone: buyerPhone.trim() } : {}),
      });
      setQuote(createdOrder);
      if (createdOrder.guestToken) {
        setGuestToken(createdOrder.guestToken);
        window.sessionStorage.setItem(`loakinaja_ppob_guest_${createdOrder.id}`, createdOrder.guestToken);
      }
      if (!isGuest) {
        const updatedOrders = await getMyPpobOrders().catch(() => null);
        if (updatedOrders) setOrders(updatedOrders);
      }
    } catch (quoteError) {
      setError((quoteError as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!quote) return;
    setError('');
    setSubmitting(true);
    try {
      if (Date.parse(quote.quoteExpiresAt) <= Date.now()) {
        throw new Error('Kutipan harga/tagihan kedaluwarsa. Periksa kembali sebelum membayar.');
      }
      const order = await startPpobPayment(quote.id, guestToken);
      if (!order.paymentUrl) throw new Error('Tautan pembayaran tidak tersedia.');
      window.location.assign(order.paymentUrl);
    } catch (paymentError) {
      setError((paymentError as Error).message);
      setSubmitting(false);
    }
  };

  if (!authResolved) return <p className="py-20 text-center text-gray-500">Memuat...</p>;

  return (
    <>
      <Head><title>Pulsa &amp; Tagihan - LoakinAja</title></Head>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-loak-blue">Layanan digital</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Pulsa &amp; Bayar Tagihan</h1>
            <p className="mt-2 text-sm text-gray-500">Pulsa, paket data, listrik, air, telepon, BPJS, dan layanan PPOB lainnya.</p>
          </div>
          <div className="flex items-center gap-3">
            {guest ? <Link href="/login?next=/ppob" className="text-sm font-semibold text-loak-blue hover:underline">Masuk</Link> : <span className="text-sm font-medium text-gray-500">Login aktif</span>}
          </div>
        </div>

        {error && <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
              {(['prepaid', 'postpaid'] as const).map((item) => (
                <button key={item} type="button" onClick={() => { setType(item); setQuote(null); setProductCode(''); setCategory(''); }} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${type === item ? 'bg-white text-loak-blue shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                  {item === 'prepaid' ? 'Pulsa & Paket Data' : 'Pascabayar'}
                </button>
              ))}
            </div>

            <label className="mb-4 block text-sm font-semibold text-gray-700" htmlFor="ppob-customer">
              {type === 'prepaid' ? 'Nomor tujuan' : 'Nomor pelanggan'}
              <input id="ppob-customer" inputMode="numeric" autoComplete="tel" value={customerNo} onChange={(event) => { setCustomerNo(event.target.value); setQuote(null); }} placeholder={type === 'prepaid' ? 'Contoh: 081234567890' : 'Masukkan nomor pelanggan'} className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none transition focus:border-loak-blue focus:ring-2 focus:ring-loak-blue/20" />
            </label>

            {guest && (
              <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <h2 className="text-sm font-bold text-gray-800">Informasi pembeli (checkout tamu)</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Nama lengkap" autoComplete="name" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-loak-blue" />
                  <input value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} placeholder="Nomor HP" inputMode="tel" autoComplete="tel" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-loak-blue" />
                  <input value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} placeholder="Email untuk bukti pembayaran" type="email" autoComplete="email" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-loak-blue sm:col-span-2" />
                </div>
              </div>
            )}

            <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(event) => { setSearch(event.target.value); setProductCode(''); }} placeholder="Cari produk atau operator" className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-loak-blue" />
              </label>
              <select value={category} onChange={(event) => { setCategory(event.target.value); setProductCode(''); }} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-loak-blue">
                <option value="">Semua kategori</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            {loadingCatalog ? <p className="py-10 text-center text-sm text-gray-500">Memuat katalog Digiflazz...</p> : products.length ? (
              <div className="grid max-h-[440px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {products.map((product) => (
                  <button key={product.code} type="button" onClick={() => { setProductCode(product.code); setQuote(null); }} className={`rounded-xl border p-3 text-left transition-colors ${productCode === product.code ? 'border-loak-blue bg-loak-light ring-1 ring-loak-blue' : 'border-gray-100 hover:border-loak-blue/40 hover:bg-gray-50'}`}>
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900">{product.name}</span>
                        <span className="mt-1 block truncate text-xs text-gray-500">{product.brand} · {product.category}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-loak-blue">{formatRupiah(product.price)}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : <p className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">Produk tidak tersedia. Coba kata pencarian atau kategori lain.</p>}

            <button type="button" onClick={handleQuote} disabled={!selected || !customerNo.trim() || submitting || loadingCatalog} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-loak-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-loak-blue-dark disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Memeriksa...</> : <>{type === 'postpaid' ? <Zap className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}{type === 'postpaid' ? 'Cek Tagihan' : 'Lanjutkan'}</>}
            </button>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-gray-900">Konfirmasi pesanan</h2>
              {!quote ? <p className="mt-3 text-sm text-gray-500">Pilih produk dan masukkan nomor tujuan untuk melihat rincian pesanan.</p> : (
                <>
                  <div className="mt-4 rounded-xl bg-loak-light p-4">
                    <p className="text-sm font-bold text-gray-900">{quote.productName}</p>
                    <p className="mt-1 text-xs text-gray-500">{quote.customerNo}</p>
                    {quote.quoteData?.customer_name != null && <p className="mt-2 text-sm text-gray-700">Nama: {String(quote.quoteData.customer_name)}</p>}
                    {quote.quoteData?.desc != null && <p className="mt-2 text-xs text-gray-600">{JSON.stringify(quote.quoteData.desc)}</p>}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm text-gray-500">Total bayar</span>
                    <strong className="text-xl text-loak-blue">{formatRupiah(quote.amount)}</strong>
                  </div>
                  <button type="button" onClick={handlePayment} disabled={submitting} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-loak-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-loak-blue-dark disabled:opacity-50">
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan pembayaran...</> : <>Bayar melalui Mayar <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </>
              )}
              <p className="mt-3 text-xs leading-relaxed text-gray-400">Transaksi ke Digiflazz baru dikirim setelah Mayar mengonfirmasi pembayaran.</p>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between"><h2 className="text-base font-bold text-gray-900">Transaksi terbaru</h2><Clock3 className="h-4 w-4 text-gray-400" /></div>
              <div className="mt-3 space-y-2">
                {!guest && orders.length ? orders.slice(0, 5).map((order) => (
                  <Link key={order.id} href={`/ppob/order?id=${encodeURIComponent(order.id)}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-gray-50">
                    <span className="min-w-0"><span className="block truncate text-sm font-medium text-gray-800">{order.productName}</span><span className="text-xs text-gray-400">{order.customerNo}</span></span>
                    <span className={`shrink-0 text-xs font-semibold ${order.status === 'success' ? 'text-green-600' : order.status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>{statusLabels[order.status] || order.status}</span>
                  </Link>
                )) : <p className="py-3 text-sm text-gray-500">{guest ? 'Selesaikan checkout untuk melihat status transaksi di perangkat ini.' : 'Belum ada transaksi PPOB.'}</p>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
