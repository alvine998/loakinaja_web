import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Box,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Coins,
  Database,
  Eye,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';

type AdminUser = { id: string; name: string; email: string; phone: string; tokens?: number; password?: string; referralCode?: string; referredBy?: string; createdAt: string };
type AdminListing = { id: string; userId: string; title: string; category: string; price: number; condition?: string; description?: string; location?: string; images?: string[]; status: 'active' | 'sold'; createdAt: string };
type AdminOrder = { id: string; userId: string; packageId?: string; packageLabel: string; tokens?: number; pricePerToken?: number; amount: number; method?: string; paymentCode?: string; status: string; createdAt: string; expiresAt?: string; paidAt?: string };
type AdminData = { users: AdminUser[]; listings: AdminListing[]; orders: AdminOrder[] };
type Section = 'overview' | 'users' | 'listings' | 'orders' | 'referrals';

const NAV_ITEMS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'referrals', label: 'Referral', icon: GitBranch },
  { id: 'listings', label: 'Listing', icon: ShoppingBag },
  { id: 'orders', label: 'Transaksi', icon: CircleDollarSign },
];

type ReferralNode = { user: AdminUser; children: ReferralNode[] };

function buildReferralForest(users: AdminUser[]): ReferralNode[] {
  const byId = new Map(users.map((u) => [u.id, u]));
  const childrenByParent = new Map<string, AdminUser[]>();
  users.forEach((u) => {
    if (u.referredBy && byId.has(u.referredBy)) {
      const list = childrenByParent.get(u.referredBy) || [];
      list.push(u);
      childrenByParent.set(u.referredBy, list);
    }
  });
  const build = (user: AdminUser, visited: Set<string>): ReferralNode => {
    const nextVisited = new Set(visited);
    nextVisited.add(user.id);
    const rawChildren = (childrenByParent.get(user.id) || []).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
    return {
      user,
      children: rawChildren
        .filter((c) => !nextVisited.has(c.id))
        .map((c) => build(c, nextVisited)),
    };
  };
  return users
    .filter((u) => !u.referredBy || !byId.has(u.referredBy))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((root) => build(root, new Set()));
}

function countDescendants(node: ReferralNode): number {
  return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

function maxDepthOf(nodes: ReferralNode[], depth = 1): number {
  if (!nodes.length) return 0;
  return Math.max(...nodes.map((n) => Math.max(depth, maxDepthOf(n.children, depth + 1))));
}

const readLocal = <T,>(key: string): T[] => {
  try {
    return JSON.parse(window.localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
};

const rupiah = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
const formatDate = (value: string) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

function seedDemoData() {
  const existingUsers = readLocal<AdminUser>('loakinaja_users');
  const existingListings = readLocal<AdminListing>('loakinaja_listings');
  const existingOrders = readLocal<AdminOrder>('loakinaja_token_orders');

  const today = new Date();
  const dateAgo = (days: number) => new Date(today.getTime() - days * 86400000).toISOString();
  const users: AdminUser[] = [
    { id: 'demo-user-01', name: 'Nadia Putri', email: 'nadia@example.com', phone: '081234567801', password: 'demo-password', tokens: 8, referralCode: 'LOAKNADIA1', createdAt: dateAgo(2) },
    { id: 'demo-user-02', name: 'Rizky Pratama', email: 'rizky@example.com', phone: '081234567802', password: 'demo-password', tokens: 3, referralCode: 'LOAKRIZKY2', referredBy: 'demo-user-01', createdAt: dateAgo(5) },
    { id: 'demo-user-03', name: 'Siti Rahma', email: 'siti@example.com', phone: '081234567803', password: 'demo-password', tokens: 5, referralCode: 'LOAKSITI03', referredBy: 'demo-user-01', createdAt: dateAgo(8) },
    { id: 'demo-user-04', name: 'Dimas Saputra', email: 'dimas@example.com', phone: '081234567804', password: 'demo-password', tokens: 1, referralCode: 'LOAKDIMAS4', createdAt: dateAgo(12) },
    { id: 'demo-user-05', name: 'Maya Lestari', email: 'maya@example.com', phone: '081234567805', password: 'demo-password', tokens: 6, referralCode: 'LOAKMAYA05', referredBy: 'demo-user-04', createdAt: dateAgo(18) },
    { id: 'demo-user-06', name: 'Fajar Nugroho', email: 'fajar@example.com', phone: '081234567806', password: 'demo-password', tokens: 2, referralCode: 'LOAKFAJAR6', createdAt: dateAgo(25) },
  ];
  const listings: AdminListing[] = [
    { id: 'demo-listing-01', userId: users[0].id, title: 'iPhone 13 128GB Midnight', category: 'Handphone', price: 7250000, condition: 'Sangat Baik', description: 'Unit terawat, fungsi normal.', location: 'Jakarta Selatan', images: [], status: 'active', createdAt: dateAgo(1) },
    { id: 'demo-listing-02', userId: users[1].id, title: 'Kamera Fujifilm X-T30', category: 'Kamera', price: 8900000, condition: 'Like New', description: 'Shutter count rendah.', location: 'Bandung', images: [], status: 'active', createdAt: dateAgo(3) },
    { id: 'demo-listing-03', userId: users[2].id, title: 'MacBook Air M1 2020', category: 'Komputer', price: 9500000, condition: 'Baik', description: 'Termasuk charger original.', location: 'Yogyakarta', images: [], status: 'sold', createdAt: dateAgo(7) },
    { id: 'demo-listing-04', userId: users[3].id, title: 'Nintendo Switch OLED', category: 'Elektronik', price: 3100000, condition: 'Sangat Baik', description: 'Kelengkapan lengkap.', location: 'Surabaya', images: [], status: 'active', createdAt: dateAgo(10) },
    { id: 'demo-listing-05', userId: users[4].id, title: 'Sepeda lipat 20 inch', category: 'Otomotif', price: 1850000, condition: 'Baik', description: 'Siap pakai.', location: 'Depok', images: [], status: 'sold', createdAt: dateAgo(15) },
    { id: 'demo-listing-06', userId: users[5].id, title: 'Monitor LG 27 inch 4K', category: 'Elektronik', price: 4200000, condition: 'Sangat Baik', description: 'Tidak ada dead pixel.', location: 'Tangerang', images: [], status: 'active', createdAt: dateAgo(20) },
  ];
  const orders: AdminOrder[] = [
    { id: 'demo-order-001', userId: users[0].id, packageId: 'popular', packageLabel: 'Populer', tokens: 10, pricePerToken: 1000, amount: 10000, method: 'bca-va', paymentCode: '880812345678', status: 'paid', createdAt: dateAgo(1), paidAt: dateAgo(1) },
    { id: 'demo-order-002', userId: users[1].id, packageId: 'starter', packageLabel: 'Starter', tokens: 5, pricePerToken: 1000, amount: 5000, method: 'gopay', paymentCode: '1234567890', status: 'pending', createdAt: dateAgo(0), expiresAt: new Date(today.getTime() + 900000).toISOString() },
    { id: 'demo-order-003', userId: users[2].id, packageId: 'pro', packageLabel: 'Pro', tokens: 20, pricePerToken: 1000, amount: 20000, method: 'mandiri-va', paymentCode: '880898765432', status: 'paid', createdAt: dateAgo(6), paidAt: dateAgo(6) },
    { id: 'demo-order-004', userId: users[4].id, packageId: 'starter', packageLabel: 'Starter', tokens: 5, pricePerToken: 1000, amount: 5000, method: 'alfamart', paymentCode: '5432167890', status: 'failed', createdAt: dateAgo(9) },
    { id: 'demo-order-005', userId: users[5].id, packageId: 'popular', packageLabel: 'Populer', tokens: 10, pricePerToken: 1000, amount: 10000, method: 'bni-va', paymentCode: '880811112222', status: 'paid', createdAt: dateAgo(14), paidAt: dateAgo(14) },
  ];

  const newUsers = users.filter((u) => !existingUsers.some((e) => e.id === u.id));
  const newListings = listings.filter((l) => !existingListings.some((e) => e.id === l.id));
  const newOrders = orders.filter((o) => !existingOrders.some((e) => e.id === o.id));
  if (!newUsers.length && !newListings.length && !newOrders.length) {
    throw new Error('Demo data sudah ada di browser ini.');
  }

  const combinedUsers = [...existingUsers, ...newUsers];
  const combinedListings = [...existingListings, ...newListings];
  const combinedOrders = [...existingOrders, ...newOrders];
  try {
    window.localStorage.setItem('loakinaja_users', JSON.stringify(combinedUsers));
    window.localStorage.setItem('loakinaja_listings', JSON.stringify(combinedListings));
    window.localStorage.setItem('loakinaja_token_orders', JSON.stringify(combinedOrders));
    window.localStorage.setItem('loakinaja_admin_demo_seeded', 'true');
  } catch {
    throw new Error('Gagal menyimpan demo data: penyimpanan browser penuh atau diblokir.');
  }
  return { users: combinedUsers, listings: combinedListings, orders: combinedOrders };
}

function clearDemoData(current: AdminData): AdminData {
  const isDemoUser = (id: string) => id.startsWith('demo-user-');
  const isDemoListing = (id: string) => id.startsWith('demo-listing-');
  const isDemoOrder = (id: string) => id.startsWith('demo-order-');
  const next = {
    users: current.users.filter((u) => !isDemoUser(u.id)),
    listings: current.listings.filter((l) => !isDemoListing(l.id)),
    orders: current.orders.filter((o) => !isDemoOrder(o.id)),
  };
  try {
    window.localStorage.setItem('loakinaja_users', JSON.stringify(next.users));
    window.localStorage.setItem('loakinaja_listings', JSON.stringify(next.listings));
    window.localStorage.setItem('loakinaja_token_orders', JSON.stringify(next.orders));
    window.localStorage.removeItem('loakinaja_admin_demo_seeded');
  } catch {
    throw new Error('Gagal menghapus demo data: penyimpanan browser diblokir.');
  }
  return next;
}

function MetricCard({ title, value, note, icon: Icon, tone }: { title: string; value: string; note: string; icon: typeof Users; tone: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p></div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
      </div>
      <p className="mt-4 text-xs text-slate-400">{note}</p>
    </article>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData>({ users: [], listings: [], orders: [] });
  const [section, setSection] = useState<Section>('overview');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [demoSeeded, setDemoSeeded] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const loadDashboard = useCallback(async () => {
    const response = await fetch('/api/admin/session');
    if (!(response.headers.get('content-type') || '').includes('application/json')) {
      throw new Error(
        'Admin API tidak tersedia. Jalankan aplikasi dengan server Next.js (npm run dev/start); static export tidak mendukung admin login.'
      );
    }
    const session = await response.json();
    if (!session.authenticated) {
      await router.replace('/admin/login');
      return;
    }
    setData({
      users: readLocal<AdminUser>('loakinaja_users'),
      listings: readLocal<AdminListing>('loakinaja_listings'),
      orders: readLocal<AdminOrder>('loakinaja_token_orders'),
    });
    setDemoSeeded(window.localStorage.getItem('loakinaja_admin_demo_seeded') === 'true');
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadDashboard().catch(() => {
      setError(
        'Admin API tidak tersedia. Jalankan aplikasi dengan server Next.js (npm run dev/start); static hosting tidak mendukung admin login.'
      );
      setLoading(false);
    });
  }, [loadDashboard]);

  const activeListings = data.listings.filter((listing) => listing.status === 'active').length;
  const paidOrders = data.orders.filter((order) => order.status === 'paid');
  const revenue = paidOrders.reduce((total, order) => total + order.amount, 0);
  const currentItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (section === 'users') return data.users.filter((user) => `${user.name} ${user.email} ${user.phone} ${user.referralCode || ''}`.toLowerCase().includes(query));
    if (section === 'listings') return data.listings.filter((listing) => `${listing.title} ${listing.category}`.toLowerCase().includes(query));
    if (section === 'orders') return data.orders.filter((order) => `${order.id} ${order.packageLabel} ${order.status}`.toLowerCase().includes(query));
    return [];
  }, [data, search, section]);

  const referralForest = useMemo(() => buildReferralForest(data.users), [data.users]);

  const referralStats = useMemo(() => {
    const withReferrer = data.users.filter((u) => u.referredBy).length;
    return {
      roots: referralForest.length,
      referred: withReferrer,
      maxDepth: maxDepthOf(referralForest),
    };
  }, [data.users, referralForest]);

  const referralSearchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (section !== 'referrals' || !query) return [];
    const byId = new Map(data.users.map((u) => [u.id, u]));
    return data.users
      .filter((u) =>
        `${u.name} ${u.email} ${u.phone} ${u.referralCode || ''}`.toLowerCase().includes(query)
      )
      .slice(0, 50)
      .map((u) => {
        const chain: AdminUser[] = [];
        const visited = new Set<string>();
        let current: AdminUser | undefined = u;
        while (current && !visited.has(current.id)) {
          visited.add(current.id);
          chain.unshift(current);
          current = current.referredBy ? byId.get(current.referredBy) : undefined;
        }
        return { user: u, chain };
      });
  }, [data.users, search, section]);

  const toggleNode = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedUser = useMemo(
    () => data.users.find((u) => u.id === selectedUserId) || null,
    [data.users, selectedUserId]
  );

  useEffect(() => {
    if (!selectedUser) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedUserId(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selectedUser]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      await router.replace('/admin/login');
    }
  };

  const hasDemoData = useMemo(
    () =>
      data.users.some((u) => u.id.startsWith('demo-user-')) ||
      data.listings.some((l) => l.id.startsWith('demo-listing-')) ||
      data.orders.some((o) => o.id.startsWith('demo-order-')),
    [data]
  );

  const handleSeedDemoData = () => {
    setError('');
    setNotice('');
    setSeeding(true);
    try {
      const demoData = seedDemoData();
      setData(demoData);
      setDemoSeeded(true);
      setNotice(`Demo data berhasil ditambahkan (${demoData.users.length} pengguna, ${demoData.listings.length} listing, ${demoData.orders.length} transaksi).`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  const handleClearDemoData = () => {
    setError('');
    setNotice('');
    try {
      const next = clearDemoData(data);
      setData(next);
      setDemoSeeded(false);
      setNotice('Demo data berhasil dihapus dari browser ini.');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const selectSection = (id: Section) => {
    setSection(id);
    setSearch('');
    setMobileNavOpen(false);
    setSelectedUserId(null);
  };

  const heading = NAV_ITEMS.find((item) => item.id === section)?.label || 'Overview';

  return (
    <>
      <Head><title>Admin dashboard · LoakinAja</title></Head>
      <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
            <a href="/admin" className="flex items-center gap-3" aria-label="LoakinAja Admin home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white"><ShieldCheck className="h-5 w-5" /></span>
              <span><span className="block text-sm font-bold leading-tight">LoakinAja</span><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Admin studio</span></span>
            </a>
            <button onClick={() => setMobileNavOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Tutup menu"><X className="h-5 w-5" /></button>
          </div>
          <div className="px-4 pt-7"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
            <nav className="mt-3 space-y-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => selectSection(id)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition ${section === id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-[18px] w-[18px]" />{label}{section === id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />}</button>)}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="mb-3 rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Admin session aktif</div><p className="mt-2 text-[11px] leading-5 text-slate-400">Akses dashboard bersifat privat dan tercatat di browser ini.</p></div>
            <button onClick={handleLogout} disabled={loggingOut} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><LogOut className="h-[18px] w-[18px]" />{loggingOut ? 'Keluar...' : 'Keluar'}</button>
          </div>
        </aside>

        {mobileNavOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup navigasi" />}
        <div className="min-h-screen lg:pl-64">
          <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3"><button onClick={() => setMobileNavOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Buka menu"><Menu className="h-5 w-5" /></button><div><p className="text-xs text-slate-400">Admin / <span className="text-slate-600">{heading}</span></p><h1 className="mt-0.5 text-sm font-bold sm:text-base">{section === 'overview' ? 'Selamat datang kembali' : heading}</h1></div></div>
            <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-slate-700">Administrator</p><p className="text-[11px] text-slate-400">Admin account</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">A</div></div>
          </header>

          <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 sm:py-9">
            {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
            {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Memuat dashboard...</div> : <>
              {section === 'overview' ? <>
                <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold tracking-tight">Ringkasan platform</h2><p className="mt-1 text-sm text-slate-500">Pantau pertumbuhan dan aktivitas marketplace.</p></div><div className="flex flex-wrap items-center gap-2"><div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500"><Activity className="h-3.5 w-3.5 text-emerald-600" /> Data browser saat ini</div><button type="button" onClick={handleSeedDemoData} disabled={seeding} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"><Database className="h-3.5 w-3.5" />{seeding ? 'Menambahkan...' : hasDemoData ? 'Perbarui demo data' : 'Tambah demo data'}</button>{hasDemoData && <button type="button" onClick={handleClearDemoData} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-red-600"><X className="h-3.5 w-3.5" />Hapus demo</button>}</div></div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Total pengguna" value={data.users.length.toLocaleString('id-ID')} note="Akun terdaftar di platform" icon={Users} tone="bg-blue-50 text-blue-700" />
                  <MetricCard title="Listing aktif" value={activeListings.toLocaleString('id-ID')} note={`${data.listings.length.toLocaleString('id-ID')} listing secara keseluruhan`} icon={ShoppingBag} tone="bg-violet-50 text-violet-700" />
                  <MetricCard title="Transaksi berhasil" value={paidOrders.length.toLocaleString('id-ID')} note={`${data.orders.length.toLocaleString('id-ID')} total pesanan token`} icon={BadgeCheck} tone="bg-emerald-50 text-emerald-700" />
                  <MetricCard title="Pembayaran masuk" value={rupiah(revenue)} note="Akumulasi pesanan berstatus lunas" icon={CircleDollarSign} tone="bg-amber-50 text-amber-700" />
                </div>

                <div className="mt-7 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold">Pengguna terbaru</h3><p className="mt-0.5 text-xs text-slate-400">Pendaftaran terbaru di platform</p></div><button onClick={() => selectSection('users')} className="text-xs font-semibold text-blue-700 hover:text-blue-800">Lihat semua <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div>
                    {data.users.length ? <div className="divide-y divide-slate-100">{[...data.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((user) => <button key={user.id} type="button" onClick={() => setSelectedUserId(user.id)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{user.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-700">{user.name}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div></div><span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">{formatDate(user.createdAt)}<Eye className="h-4 w-4 text-slate-300" /></span></button>)}</div> : <div className="px-5 py-12 text-center text-sm text-slate-400">Belum ada pengguna terdaftar.</div>}
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><h3 className="text-sm font-bold">Aktivitas marketplace</h3><p className="mt-0.5 text-xs text-slate-400">Snapshot kondisi platform</p></div><span className="rounded-lg bg-slate-50 p-2 text-slate-500"><Activity className="h-4 w-4" /></span></div>
                    <div className="mt-5 space-y-4"><div className="flex items-center justify-between rounded-xl bg-blue-50/70 p-3.5"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-blue-700"><Box className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-700">Listing tayang</p><p className="text-[11px] text-slate-400">Siap dilihat pembeli</p></div></div><span className="text-sm font-bold text-slate-800">{activeListings}</span></div>
                      <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-3.5"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-amber-700"><Clock3 className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-700">Menunggu pembayaran</p><p className="text-[11px] text-slate-400">Pesanan token pending</p></div></div><span className="text-sm font-bold text-slate-800">{data.orders.filter((order) => order.status === 'pending').length}</span></div>
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3.5"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-emerald-700"><Check className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-700">Listing terjual</p><p className="text-[11px] text-slate-400">Ditandai selesai oleh penjual</p></div></div><span className="text-sm font-bold text-slate-800">{data.listings.filter((listing) => listing.status === 'sold').length}</span></div>
                    </div>
                  </section>
                </div>

                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold">Transaksi terbaru</h3><p className="mt-0.5 text-xs text-slate-400">Pesanan pembelian token</p></div><button onClick={() => selectSection('orders')} className="text-xs font-semibold text-blue-700 hover:text-blue-800">Lihat transaksi <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-slate-50 text-slate-400"><tr><th className="px-5 py-3 font-semibold">PESANAN</th><th className="px-5 py-3 font-semibold">PAKET</th><th className="px-5 py-3 font-semibold">TANGGAL</th><th className="px-5 py-3 font-semibold">STATUS</th><th className="px-5 py-3 text-right font-semibold">NOMINAL</th></tr></thead><tbody className="divide-y divide-slate-100">{[...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4).map((order) => <tr key={order.id}><td className="px-5 py-3.5 font-semibold text-slate-700">#{order.id.slice(-8)}</td><td className="px-5 py-3.5 text-slate-500">{order.packageLabel}</td><td className="px-5 py-3.5 text-slate-500">{formatDate(order.createdAt)}</td><td className="px-5 py-3.5"><StatusPill status={order.status} /></td><td className="px-5 py-3.5 text-right font-semibold text-slate-700">{rupiah(order.amount)}</td></tr>)}</tbody></table>{data.orders.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada transaksi.</p>}</div></section>
              </> : section === 'referrals' ? <>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold tracking-tight">Pohon Referral</h2><p className="mt-1 text-sm text-slate-500">Lihat struktur ajakan dari level teratas sampai terbawah.</p></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"><div className="flex gap-2"><button type="button" onClick={() => setCollapsedIds(new Set())} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Buka semua</button><button type="button" onClick={() => setCollapsedIds(new Set(referralForest.map((n) => n.user.id)))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Tutup semua</button></div><label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, kode..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label></div></div>
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-400">Level teratas (akar)</p><p className="mt-1 text-xl font-bold">{referralStats.roots}</p></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-400">Pengguna via referral</p><p className="mt-1 text-xl font-bold">{referralStats.referred}</p></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-400">Kedalaman maksimal</p><p className="mt-1 text-xl font-bold">{referralStats.maxDepth} level</p></div>
                </div>
                {search.trim() ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><p className="text-sm font-semibold text-slate-700">Hasil pencarian ({referralSearchResults.length})</p></div>{referralSearchResults.length ? <ul className="divide-y divide-slate-100">{referralSearchResults.map(({ user, chain }) => <li key={user.id}><button type="button" onClick={() => setSelectedUserId(user.id)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-slate-50"><span className="min-w-0"><span className="block truncate text-xs text-slate-400">{chain.map((c) => c.name).join(' › ')}</span><span className="mt-0.5 block truncate text-sm font-semibold text-slate-700">{user.name} · {user.referralCode || '—'}</span></span><Eye className="h-4 w-4 shrink-0 text-slate-300" /></button></li>)}</ul> : <p className="px-5 py-10 text-center text-sm text-slate-400">Tidak ditemukan.</p>}</div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">{referralForest.length ? <div className="space-y-3">{referralForest.map((node) => <ReferralTreeNode key={node.user.id} node={node} depth={1} collapsedIds={collapsedIds} onToggle={toggleNode} onDetail={(id) => setSelectedUserId(id)} />)}</div> : <div className="px-5 py-14 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400"><GitBranch className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-slate-700">Belum ada data referral</p><p className="mt-1 text-xs text-slate-400">Data akan muncul setelah pengguna mendaftar dengan kode referral.</p></div>}</div>
                )}
              </> : <>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold tracking-tight">{heading}</h2><p className="mt-1 text-sm text-slate-500">Kelola dan tinjau data {heading.toLowerCase()} platform.</p></div><label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Cari ${heading.toLowerCase()}...`} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label></div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><p className="text-sm font-semibold text-slate-700">Semua {heading.toLowerCase()}</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{currentItems.length} data</span></div><div className="overflow-x-auto">
                  {section === 'users' && <table className="w-full min-w-[860px] text-left text-xs"><TableHead cells={['PENGGUNA', 'KONTAK', 'KODE REFERRAL', 'DIAJAK OLEH', 'BERGABUNG', 'AKSI']} /><tbody className="divide-y divide-slate-100">{(currentItems as AdminUser[]).map((user) => { const referrer = data.users.find((candidate) => candidate.id === user.referredBy); return <tr key={user.id} className="transition hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">{user.name.slice(0, 1).toUpperCase()}</span><button type="button" onClick={() => setSelectedUserId(user.id)} className="font-semibold text-slate-700 hover:text-blue-700 hover:underline">{user.name}</button></div></td><td className="px-5 py-4 text-slate-500">{user.email}<span className="mt-1 block text-slate-400">{user.phone}</span></td><td className="px-5 py-4 font-mono font-semibold text-blue-700">{user.referralCode || '—'}</td><td className="px-5 py-4 text-slate-500">{referrer?.name || '—'}</td><td className="px-5 py-4 text-slate-500">{formatDate(user.createdAt)}</td><td className="px-5 py-4"><button type="button" onClick={() => setSelectedUserId(user.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Eye className="h-3.5 w-3.5" />Detail</button></td></tr>; })}</tbody></table>}
                  {section === 'listings' && <table className="w-full min-w-[650px] text-left text-xs"><TableHead cells={['PRODUK', 'KATEGORI', 'TANGGAL', 'STATUS', 'HARGA']} /><tbody className="divide-y divide-slate-100">{(currentItems as AdminListing[]).map((listing) => <tr key={listing.id}><td className="px-5 py-4 font-semibold text-slate-700">{listing.title}</td><td className="px-5 py-4 text-slate-500">{listing.category}</td><td className="px-5 py-4 text-slate-500">{formatDate(listing.createdAt)}</td><td className="px-5 py-4"><StatusPill status={listing.status} /></td><td className="px-5 py-4 text-right font-semibold text-slate-700">{rupiah(listing.price)}</td></tr>)}</tbody></table>}
                  {section === 'orders' && <table className="w-full min-w-[650px] text-left text-xs"><TableHead cells={['PESANAN', 'PAKET', 'TANGGAL', 'STATUS', 'NOMINAL']} /><tbody className="divide-y divide-slate-100">{(currentItems as AdminOrder[]).map((order) => <tr key={order.id}><td className="px-5 py-4 font-semibold text-slate-700">#{order.id.slice(-8)}</td><td className="px-5 py-4 text-slate-500">{order.packageLabel}</td><td className="px-5 py-4 text-slate-500">{formatDate(order.createdAt)}</td><td className="px-5 py-4"><StatusPill status={order.status} /></td><td className="px-5 py-4 text-right font-semibold text-slate-700">{rupiah(order.amount)}</td></tr>)}</tbody></table>}
                  {currentItems.length === 0 && <div className="px-5 py-14 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400"><Search className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-slate-700">Data tidak ditemukan</p><p className="mt-1 text-xs text-slate-400">Belum ada data atau coba kata kunci lain.</p></div>}
                </div></div>
              </>}
            </>}
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row"><span>© {new Date().getFullYear()} LoakinAja · Admin studio</span><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Sistem beroperasi normal</span></footer>
          </main>
        </div>
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            users={data.users}
            listings={data.listings.filter((l) => l.userId === selectedUser.id)}
            orders={data.orders.filter((o) => o.userId === selectedUser.id)}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </div>
    </>
  );
}

function UserDetailModal({
  user,
  users,
  listings,
  orders,
  onClose,
}: {
  user: AdminUser;
  users: AdminUser[];
  listings: AdminListing[];
  orders: AdminOrder[];
  onClose: () => void;
}) {
  const referrer = users.find((u) => u.id === user.referredBy) || null;
  const referrals = users.filter((u) => u.referredBy === user.id);
  const paidTotal = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Detail ${user.name}`}>
      <button aria-label="Tutup detail" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-lg font-bold text-white">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">{user.name}</h2>
              <p className="truncate text-xs text-slate-400">ID: {user.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Listing</p><p className="mt-1 text-xl font-bold">{listings.length}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Transaksi</p><p className="mt-1 text-xl font-bold">{orders.length}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Token</p><p className="mt-1 flex items-center gap-1.5 text-xl font-bold"><Coins className="h-4 w-4 text-amber-600" />{user.tokens ?? 0}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Referral masuk</p><p className="mt-1 text-xl font-bold">{referrals.length}</p></div>
          </div>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold">Informasi akun</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0"><dt className="text-[11px] uppercase tracking-wide text-slate-400">Email</dt><dd className="break-all font-medium text-slate-700">{user.email}</dd></div></div>
              <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><dt className="text-[11px] uppercase tracking-wide text-slate-400">Telepon</dt><dd className="font-medium text-slate-700">{user.phone}</dd></div></div>
              <div className="flex items-start gap-3"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><div><dt className="text-[11px] uppercase tracking-wide text-slate-400">Bergabung</dt><dd className="font-medium text-slate-700">{formatDate(user.createdAt)}</dd></div></div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold">Referral</h3>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-blue-50/70 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-400">Kode milik user</p><p className="mt-1 font-mono font-bold text-blue-700">{user.referralCode || '—'}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-400">Diajak oleh</p><p className="mt-1 font-semibold text-slate-700">{referrer ? `${referrer.name} (${referrer.email})` : '—'}</p></div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500">Mengajak ({referrals.length})</p>
              {referrals.length ? (
                <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
                  {referrals.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"><span className="min-w-0"><span className="block truncate font-semibold text-slate-700">{r.name}</span><span className="block truncate text-xs text-slate-400">{r.email}</span></span><span className="shrink-0 text-xs text-slate-400">{formatDate(r.createdAt)}</span></li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-400">Belum mengajak pengguna lain.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Listing ({listings.length})</h3>{paidTotal > 0 && <span className="text-xs text-slate-400">Lunas: {rupiah(paidTotal)}</span>}</div>
            {listings.length ? (
              <ul className="mt-3 space-y-2">
                {[...listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm"><span className="min-w-0"><span className="block truncate font-semibold text-slate-700">{l.title}</span><span className="block text-xs text-slate-400">{l.category} · {formatDate(l.createdAt)}</span></span><span className="flex shrink-0 items-center gap-2"><StatusPill status={l.status} /><span className="font-semibold">{rupiah(l.price)}</span></span></li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-slate-400">Belum ada listing.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold">Transaksi ({orders.length})</h3>
            {orders.length ? (
              <ul className="mt-3 space-y-2">
                {[...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm"><span className="min-w-0"><span className="block truncate font-semibold text-slate-700">#{o.id.slice(-8)} · {o.packageLabel}</span><span className="block text-xs text-slate-400">{formatDate(o.createdAt)}</span></span><span className="flex shrink-0 items-center gap-2"><StatusPill status={o.status} /><span className="font-semibold">{rupiah(o.amount)}</span></span></li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-slate-400">Belum ada transaksi.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ReferralTreeNode({
  node,
  depth,
  collapsedIds,
  onToggle,
  onDetail,
}: {
  node: ReferralNode;
  depth: number;
  collapsedIds: Set<string>;
  onToggle: (id: string) => void;
  onDetail: (id: string) => void;
}) {
  const collapsed = collapsedIds.has(node.user.id);
  const total = countDescendants(node);
  return (
    <div className={depth > 1 ? 'ml-4 border-l-2 border-slate-100 pl-4 sm:ml-6' : ''}>
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-blue-100 hover:bg-blue-50/40">
        {node.children.length > 0 ? (
          <button
            type="button"
            onClick={() => onToggle(node.user.id)}
            aria-label={collapsed ? `Buka ${node.user.name}` : `Tutup ${node.user.name}`}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-blue-700"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        ) : (
          <span className="ml-1 h-2 w-2 shrink-0 rounded-full bg-slate-200" />
        )}
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700 shadow-sm">
          {node.user.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-bold text-slate-800">{node.user.name}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-700">
              {node.user.referralCode || '—'}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
              Level {depth}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {node.user.email} · {node.children.length} langsung · {total} total bawahan
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDetail(node.user.id)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-700"
        >
          <Eye className="h-3.5 w-3.5" />Detail
        </button>
      </div>
      {!collapsed && node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <ReferralTreeNode
              key={child.user.id}
              node={child}
              depth={depth + 1}
              collapsedIds={collapsedIds}
              onToggle={onToggle}
              onDetail={onDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TableHead({ cells }: { cells: string[] }) {
  return <thead className="bg-slate-50 text-slate-400"><tr>{cells.map((cell) => <th key={cell} className="whitespace-nowrap px-5 py-3 text-left font-semibold">{cell}</th>)}</tr></thead>;
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    sold: 'bg-slate-100 text-slate-600',
    paid: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    failed: 'bg-red-50 text-red-700',
    expired: 'bg-slate-100 text-slate-500',
  };
  const labels: Record<string, string> = { active: 'Aktif', sold: 'Terjual', paid: 'Lunas', pending: 'Menunggu', failed: 'Gagal', expired: 'Kedaluwarsa' };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${styles[status] || 'bg-slate-100 text-slate-600'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{labels[status] || status}</span>;
}
