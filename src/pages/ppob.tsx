import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ArrowRight, Clock3, Droplets, HeartPulse, Loader2, Search, Smartphone, Tv, Wifi, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createPpobQuote, getMyPpobOrders, getPpobProducts, PpobOrder, PpobProduct, PpobType, startPpobPayment } from '@/lib/db';
import { formatRupiah } from '@/lib/format';

const statusLabels: Record<string, string> = {
  quoted: 'Siap dibayar', creating_payment: 'Menyiapkan pembayaran', awaiting_payment: 'Menunggu pembayaran',
  processing: 'Sedang diproses', pending: 'Diproses provider', success: 'Berhasil', failed: 'Gagal', expired: 'Kedaluwarsa',
};

const services = [
  { id: 'water', label: 'Air / PDAM', description: 'Cek dan bayar tagihan air', type: 'postpaid' as const, keywords: ['pdam', 'air'], icon: Droplets, tone: 'bg-cyan-50 text-cyan-700' },
  { id: 'electricity-bill', label: 'Listrik Tagihan', description: 'Tagihan listrik pascabayar', type: 'postpaid' as const, keywords: ['pln'], icon: Zap, tone: 'bg-amber-50 text-amber-700' },
  { id: 'electricity-token', label: 'Listrik Non-Taglis', description: 'Token listrik prabayar', type: 'prepaid' as const, keywords: ['pln', 'token'], icon: Zap, tone: 'bg-yellow-50 text-yellow-700' },
  { id: 'prepaid-mobile', label: 'Pulsa Prabayar', description: 'Isi pulsa semua operator', type: 'prepaid' as const, keywords: ['pulsa'], icon: Smartphone, tone: 'bg-blue-50 text-blue-700' },
  { id: 'postpaid-mobile', label: 'Pulsa Pascabayar', description: 'Bayar tagihan seluler', type: 'postpaid' as const, keywords: ['pascabayar', 'pulsa'], icon: Smartphone, tone: 'bg-indigo-50 text-indigo-700' },
  { id: 'data', label: 'Paket Data', description: 'Internet untuk nomor seluler', type: 'prepaid' as const, keywords: ['data', 'internet'], icon: Wifi, tone: 'bg-violet-50 text-violet-700' },
  { id: 'internet', label: 'Internet & TV', description: 'WiFi, telepon, dan TV kabel', type: 'postpaid' as const, keywords: ['internet', 'wifi', 'telkom', 'indihome'], icon: Tv, tone: 'bg-purple-50 text-purple-700' },
  { id: 'bpjs', label: 'BPJS', description: 'Bayar iuran BPJS kesehatan', type: 'postpaid' as const, keywords: ['bpjs'], icon: HeartPulse, tone: 'bg-rose-50 text-rose-700' },
];

export default function PpobPage() {
  const { user, loading: authLoading } = useAuth();
  const [guest, setGuest] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);
  const [type, setType] = useState<PpobType>('prepaid');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [productCode, setProductCode] = useState('');
  const [customerNo, setCustomerNo] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [serviceProducts, setServiceProducts] = useState<PpobProduct[]>([]);
  const [category, setCategory] = useState('');
  const [orders, setOrders] = useState<PpobOrder[]>([]);
  const [quote, setQuote] = useState<PpobOrder | null>(null);
  const [error, setError] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogRefreshing, setCatalogRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const selectedService = services.find((service) => service.id === selectedServiceId) || null;

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
    if (!authResolved || !selectedService) return;
    let active = true;
    setLoadingCatalog(true);
    const loadCatalog = async () => {
      try {
        const result = await getPpobProducts(type);
        if (!active) return;
        setServiceProducts(result.data);
        setCatalogRefreshing(Boolean(result.refreshing));
        if (result.refreshing) {
          window.setTimeout(() => { if (active) void loadCatalog(); }, Math.max(2, result.retryAfterSeconds || 3) * 1000);
        }
      } catch (catalogError) {
        if (!active) return;
        setCatalogRefreshing(false);
        setError((catalogError as Error).message);
      } finally {
        if (active) setLoadingCatalog(false);
      }
    };
    void loadCatalog();
    return () => { active = false; };
  }, [authResolved, selectedServiceId, type]);

  useEffect(() => {
    if (!authResolved || guest) return;
    getMyPpobOrders().then(setOrders).catch(() => undefined);
  }, [authResolved, guest]);

  const products = useMemo(() => {
    if (!selectedService) return [];
    const keywordMatches = (product: PpobProduct) => {
      const text = `${product.name} ${product.category} ${product.brand} ${product.code}`.toLowerCase();
      return selectedService.keywords.some((keyword) => text.includes(keyword));
    };
    return serviceProducts.filter((product) => keywordMatches(product)
      && (!category || product.category === category)
      && (!debouncedSearch || `${product.name} ${product.category} ${product.brand} ${product.code}`.toLowerCase().includes(debouncedSearch.toLowerCase())));
  }, [category, debouncedSearch, selectedService, serviceProducts]);
  const visibleCategories = useMemo(() => [...new Set(serviceProducts
    .filter((product) => selectedService?.keywords.some((keyword) => `${product.name} ${product.category} ${product.brand} ${product.code}`.toLowerCase().includes(keyword)))
    .map((product) => product.category).filter(Boolean))], [selectedService, serviceProducts]);
  const selected = useMemo(() => products.find((product) => product.code === productCode) || null, [products, productCode]);

  const chooseService = (serviceId: string) => {
    const service = services.find((item) => item.id === serviceId);
    if (!service) return;
    setSelectedServiceId(service.id);
    setType(service.type);
    setServiceProducts([]);
    setProductCode('');
    setCategory('');
    setSearch('');
    setDebouncedSearch('');
    setCustomerNo('');
    setQuote(null);
    setError('');
  };

  const returnToServices = () => {
    setSelectedServiceId(null);
    setServiceProducts([]);
    setProductCode('');
    setCategory('');
    setSearch('');
    setCustomerNo('');
    setQuote(null);
    setError('');
  };

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
      <Head><title>{selectedService ? `${selectedService.label} - PPOB LoakinAja` : 'Pulsa & Tagihan - LoakinAja'}</title></Head>
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-700 px-6 py-7 text-white shadow-lg sm:px-9 sm:py-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-cyan-100">Layanan digital LoakinAja</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{selectedService ? selectedService.label : 'Semua kebutuhan, satu tempat'}</h1>
            <p className="mt-2 max-w-xl text-sm text-blue-100">{selectedService ? selectedService.description : 'Pilih layanan untuk mulai membeli pulsa atau membayar tagihan dengan mudah.'}</p>
          </div>
          <div className="flex items-center gap-3">
            {guest ? <Link href="/login?next=/ppob" className="rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">Masuk</Link> : <span className="text-sm font-medium text-blue-100">Login aktif</span>}
          </div>
          </div>
        </div>

        {error && <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

        {!selectedService ? <>
          <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-gray-900">Pilih jenis layanan</h2><p className="mt-1 text-sm text-gray-500">Layanan tersedia untuk prabayar maupun pascabayar.</p></div><span className="hidden rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-loak-blue sm:inline-flex">{services.length} layanan</span></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {services.map(({ id, label, description, icon: Icon, tone }) => (
              <button key={id} type="button" onClick={() => chooseService(id)} className="group rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-loak-blue/30 hover:shadow-md sm:p-5">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></span>
                <span className="mt-4 flex items-center justify-between gap-2"><span className="text-sm font-bold text-gray-900 sm:text-base">{label}</span><ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-loak-blue" /></span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-500">{description}</span>
              </button>
            ))}
          </div>
          <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Clock3 className="h-5 w-5" /></span><div><h2 className="text-sm font-bold text-gray-900">Transaksi terbaru</h2><p className="mt-0.5 text-xs text-gray-500">Pantau status pesanan PPOB Anda.</p></div></div>
            <div className="mt-3 divide-y divide-gray-100">
              {!guest && orders.length ? orders.slice(0, 5).map((order) => <Link key={order.id} href={`/ppob/order?id=${encodeURIComponent(order.id)}`} className="flex items-center justify-between gap-3 py-3 hover:bg-gray-50"><span className="min-w-0"><span className="block truncate text-sm font-medium text-gray-800">{order.productName}</span><span className="text-xs text-gray-400">{order.customerNo}</span></span><span className={`shrink-0 text-xs font-semibold ${order.status === 'success' ? 'text-green-600' : order.status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>{statusLabels[order.status] || order.status}</span></Link>) : <p className="py-3 text-sm text-gray-500">{guest ? 'Masuk untuk melihat riwayat transaksi Anda.' : 'Belum ada transaksi PPOB.'}</p>}
            </div>
          </section>
        </> : <>
        <button type="button" onClick={returnToServices} className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900"><ArrowLeft className="h-4 w-4" />Semua layanan</button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3"><div><p className="text-sm font-bold text-gray-900">{selectedService.label}</p><p className="mt-0.5 text-xs text-gray-500">{type === 'prepaid' ? 'Layanan prabayar' : 'Layanan pascabayar'}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-loak-blue">{products.length} produk</span></div>

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
                {visibleCategories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            {loadingCatalog ? <p className="py-10 text-center text-sm text-gray-500">Memuat katalog Digiflazz...</p> : catalogRefreshing && products.length === 0 ? <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-8 text-center"><p className="text-sm font-semibold text-blue-800">Katalog sedang diperbarui</p><p className="mt-1 text-xs text-blue-600">Produk akan muncul otomatis setelah katalog selesai dimuat.</p></div> : products.length ? (
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
        </>}
      </div>
    </>
  );
}
