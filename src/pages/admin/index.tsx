import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { adminRequest, clearAdminToken, saveAdminToken } from '@/lib/adminApi';
import { apiUrl } from '@/lib/api';
import { formatThousandsInput, parseThousandsInput } from '@/lib/format';
import { CATEGORY_ICONS, type Category } from '@/lib/categories';
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
  Layers3,
  CreditCard,
  Eye,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Phone,
  Pencil,
  Search,
  ShieldCheck,
  ShoppingBag,
  Settings,
  Trash2,
  UserCog,
  Wallet,
  Users,
  X,
} from 'lucide-react';

type AdminUser = { id: string; name: string; email: string; phone: string; tokens?: number; password?: string; referralCode?: string; referredBy?: string; createdAt: string };
type AdminListing = { id: string; userId: string; title: string; category: string; price: number; condition?: string; description?: string; location?: string; images?: string[]; status: 'pending' | 'active' | 'rejected' | 'sold'; reviewReason?: string | null; createdAt: string; seller?: AdminUser };
type AdminOrder = { id: string; userId: string; packageId?: string; packageLabel: string; tokens?: number; pricePerToken?: number; amount: number; method?: string; paymentCode?: string; status: string; createdAt: string; expiresAt?: string; paidAt?: string };
type AdminRoleKey = string;
type AdminRole = { key: AdminRoleKey; label: string; permissions: string[]; createdAt?: string; updatedAt?: string };
type AdminAccount = { id: string; email: string; role: AdminRoleKey; createdAt: string };
type AdminData = { users: AdminUser[]; listings: AdminListing[]; orders: AdminOrder[] };
type EscrowAccount = { id: string; bankName: string; accountNumber: string; accountHolder: string; isActive: boolean; createdAt: string };
type EscrowAccountForm = Pick<EscrowAccount, 'bankName' | 'accountNumber' | 'accountHolder' | 'isActive'>;
type Section = 'overview' | 'users' | 'listings' | 'orders' | 'referrals' | 'escrow' | 'finance' | 'ppob' | 'admins' | 'profile' | 'categories';

const SECTION_SLUGS: Record<Section, string> = {
  overview: 'overview',
  users: 'users',
  referrals: 'referrals',
  listings: 'listings',
  orders: 'transactions',
  escrow: 'escrow',
  finance: 'finance',
  ppob: 'harga-ppob',
  admins: 'administrators',
  profile: 'profile',
  categories: 'categories',
};
const SECTION_BY_SLUG = Object.fromEntries(
  Object.entries(SECTION_SLUGS).map(([section, slug]) => [slug, section as Section])
) as Record<string, Section>;
const SECTION_PERMISSIONS: Partial<Record<Section, string>> = {
  users: 'users:view',
  referrals: 'referrals:view',
  listings: 'listings:view',
  orders: 'transactions:view',
  finance: 'finance:view',
  ppob: 'ppob:manage',
  escrow: 'escrow:manage',
  admins: 'admins:manage',
  profile: 'profile:manage',
  categories: 'categories:manage',
};

const NAV_ITEMS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'referrals', label: 'Referral', icon: GitBranch },
  { id: 'listings', label: 'Listing', icon: ShoppingBag },
  { id: 'orders', label: 'Transaksi', icon: CircleDollarSign },
  { id: 'finance', label: 'Keuangan', icon: Wallet },
  { id: 'ppob', label: 'Harga PPOB', icon: Coins },
  { id: 'escrow', label: 'Rekening Bersama', icon: CreditCard },
  { id: 'admins', label: 'Admin', icon: UserCog },
  { id: 'categories', label: 'Kategori produk', icon: Layers3 },
  { id: 'profile', label: 'Pengaturan profil', icon: Settings },
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([]);
  const [escrowForm, setEscrowForm] = useState<EscrowAccountForm>({ bankName: '', accountNumber: '', accountHolder: '', isActive: true });
  const [editingEscrowId, setEditingEscrowId] = useState<string | null>(null);
  const [savingEscrow, setSavingEscrow] = useState(false);
  const [ppobMarkup, setPpobMarkup] = useState(1000);
  const [ppobMarkupForm, setPpobMarkupForm] = useState('1.000');
  const [savingPpobMarkup, setSavingPpobMarkup] = useState(false);
  const [selectedListingIds, setSelectedListingIds] = useState<Set<string>>(new Set());
  const [bulkReviewing, setBulkReviewing] = useState(false);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [adminForm, setAdminForm] = useState({ email: '', password: '', role: 'admin' });
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ email: '', currentPassword: '', password: '' });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<AdminRole[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [currentAdminRole, setCurrentAdminRole] = useState('admin');
  const [roleForm, setRoleForm] = useState({ key: '', label: '', permissions: [] as string[] });
  const [editingRoleKey, setEditingRoleKey] = useState<string | null>(null);
  const [adminManagementTab, setAdminManagementTab] = useState<'admins' | 'roles'>('admins');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: 'Smartphone' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const loadDashboard = useCallback(async () => {
    let session: { authenticated: boolean; admin: { id: string; email: string; role: string; permissions: string[] } };
    try {
      session = await adminRequest<{ authenticated: boolean; admin: { id: string; email: string; role: string; permissions: string[] } }>('/admin/session');
    } catch {
      clearAdminToken();
      await router.replace('/admin/login');
      return;
    }
    setPermissions(session.admin.permissions);
    setCurrentAdminId(session.admin.id);
    setCurrentAdminRole(session.admin.role);
    const [response, escrowResponse, adminsResponse, ppobSettingsResponse] = await Promise.all([
      adminRequest<{ data: AdminData }>('/admin/dashboard'),
      session.admin.permissions.includes('escrow:manage')
        ? adminRequest<{ data: EscrowAccount[] }>('/admin/escrow-accounts')
        : Promise.resolve({ data: [] as EscrowAccount[] }),
      session.admin.permissions.includes('admins:manage')
        ? adminRequest<{ data: AdminAccount[]; roles: AdminRole[]; permissions: string[] }>('/admin/admins')
        : Promise.resolve({ data: [] as AdminAccount[], roles: [] as AdminRole[], permissions: [] as string[] }),
      session.admin.permissions.includes('ppob:manage')
        ? adminRequest<{ data: { markupRupiah: number } }>('/admin/ppob-settings')
        : Promise.resolve({ data: { markupRupiah: 1000 } }),
    ]);
    setData(response.data);
    setEscrowAccounts(escrowResponse.data);
    setAdmins(adminsResponse.data);
    setAvailableRoles(adminsResponse.roles);
    setAvailablePermissions(adminsResponse.permissions);
    setPpobMarkup(ppobSettingsResponse.data.markupRupiah);
    setPpobMarkupForm(formatThousandsInput(String(ppobSettingsResponse.data.markupRupiah)));
    setProfileForm((current) => ({ ...current, email: session.admin.email }));
    const categoryResponse = await fetch(apiUrl('/categories')).then((response) => response.json()).catch(() => ({ data: [] }));
    setCategories(categoryResponse.data || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadDashboard().catch(() => {
      setError('Gagal memuat dashboard admin. Periksa koneksi backend lalu coba lagi.');
      setLoading(false);
    });
  }, [loadDashboard]);

  useEffect(() => {
    if (!router.isReady || loading) return;
    if (router.pathname === '/admin') {
      setSection('overview');
      router.replace('/admin/overview');
      return;
    }
    const slug = router.query.section;
    const nextSection = typeof slug === 'string' ? SECTION_BY_SLUG[slug] : undefined;
    if (!nextSection || (SECTION_PERMISSIONS[nextSection] && !permissions.includes(SECTION_PERMISSIONS[nextSection]!))) {
      router.replace('/admin/overview');
      return;
    }
    setSection(nextSection);
  }, [router.isReady, router.pathname, router.query.section, permissions, loading]);

  const activeListings = data.listings.filter((listing) => listing.status === 'active').length;
  const paidOrders = data.orders.filter((order) => order.status === 'paid');
  const revenue = paidOrders.reduce((total, order) => total + order.amount, 0);
  const financeMetrics = useMemo(() => {
    const pendingOrders = data.orders.filter((order) => order.status === 'pending');
    const pendingAmount = pendingOrders.reduce((total, order) => total + order.amount, 0);
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString('id-ID', { month: 'short' }), amount: 0 };
    });
    const byMonth = new Map(months.map((month) => [month.key, month]));
    paidOrders.forEach((order) => {
      const date = new Date(order.paidAt || order.createdAt);
      const month = byMonth.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (month) month.amount += order.amount;
    });
    const methods = data.orders.reduce<Record<string, number>>((counts, order) => {
      const method = order.method || 'Tidak diketahui';
      counts[method] = (counts[method] || 0) + 1;
      return counts;
    }, {});
    return {
      pendingOrders,
      pendingAmount,
      months,
      methods: Object.entries(methods).sort((a, b) => b[1] - a[1]),
      averagePaid: paidOrders.length ? Math.round(revenue / paidOrders.length) : 0,
      statusCounts: {
        paid: paidOrders.length,
        pending: pendingOrders.length,
        failed: data.orders.filter((order) => ['failed', 'expired'].includes(order.status)).length,
      },
    };
  }, [data.orders, paidOrders, revenue]);
  const currentItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (section === 'users') return data.users.filter((user) => `${user.name} ${user.email} ${user.phone} ${user.referralCode || ''}`.toLowerCase().includes(query));
    if (section === 'listings') return data.listings.filter((listing) => `${listing.title} ${listing.category}`.toLowerCase().includes(query));
    if (section === 'orders') return data.orders.filter((order) => `${order.id} ${order.packageLabel} ${order.status}`.toLowerCase().includes(query));
    return [];
  }, [data, search, section]);
  const visiblePendingListings = section === 'listings'
    ? (currentItems as AdminListing[]).filter((listing) => listing.status === 'pending')
    : [];

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
    clearAdminToken();
    await router.replace('/admin/login');
  };

  const reloadDashboardData = async () => {
    const response = await adminRequest<{ data: AdminData }>('/admin/dashboard');
    setData(response.data);
  };

  const handleReviewListing = async (listing: AdminListing, decision: 'approve' | 'reject') => {
    setError('');
    setNotice('');
    try {
      let reason: string | undefined;
      if (decision === 'reject') {
        const input = window.prompt('Alasan penolakan (opsional):');
        if (input === null) return;
        reason = input || undefined;
      }
      const response = await adminRequest<{ data: AdminListing }>(`/admin/listings/${encodeURIComponent(listing.id)}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ decision, reason }),
      });
      setData((current) => ({
        ...current,
        listings: current.listings.map((item) => item.id === listing.id ? response.data : item),
      }));
      setNotice(decision === 'approve' ? 'Listing disetujui dan sudah tayang.' : 'Listing ditolak.');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleBulkReviewListings = async (decision: 'approve' | 'reject') => {
    const ids = visiblePendingListings.filter((listing) => selectedListingIds.has(listing.id)).map((listing) => listing.id);
    if (!ids.length) return;
    let reason: string | undefined;
    if (decision === 'reject') {
      const input = window.prompt(`Alasan penolakan untuk ${ids.length} listing (opsional):`);
      if (input === null) return;
      reason = input || undefined;
    }
    setBulkReviewing(true);
    setError('');
    setNotice('');
    try {
      const response = await adminRequest<{ data: AdminListing[]; skippedIds: string[] }>('/admin/listings/review-bulk', {
        method: 'POST',
        body: JSON.stringify({ ids, decision, reason }),
      });
      const reviewedById = new Map(response.data.map((listing) => [listing.id, listing]));
      setData((current) => ({ ...current, listings: current.listings.map((listing) => reviewedById.get(listing.id) || listing) }));
      setSelectedListingIds(new Set());
      const resultText = `${response.data.length} listing ${decision === 'approve' ? 'disetujui' : 'ditolak'}`;
      setNotice(response.skippedIds.length ? `${resultText}; ${response.skippedIds.length} dilewati karena sudah tidak menunggu review.` : `${resultText}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBulkReviewing(false);
    }
  };

  const toggleListingSelection = (id: string) => {
    setSelectedListingIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVisiblePendingSelection = () => {
    setSelectedListingIds((current) => {
      const next = new Set(current);
      const allSelected = visiblePendingListings.every((listing) => next.has(listing.id));
      visiblePendingListings.forEach((listing) => allSelected ? next.delete(listing.id) : next.add(listing.id));
      return next;
    });
  };

  const selectSection = (id: Section) => {
    setSection(id);
    setSearch('');
    setMobileNavOpen(false);
    setSelectedUserId(null);
    router.push(`/admin/${SECTION_SLUGS[id]}`);
  };

  const resetEscrowForm = () => {
    setEscrowForm({ bankName: '', accountNumber: '', accountHolder: '', isActive: true });
    setEditingEscrowId(null);
  };

  const saveEscrowAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingEscrow(true);
    setError('');
    setNotice('');
    try {
      const result = await adminRequest<{ data: EscrowAccount }>(editingEscrowId ? `/admin/escrow-accounts/${encodeURIComponent(editingEscrowId)}` : '/admin/escrow-accounts', {
        method: editingEscrowId ? 'PATCH' : 'POST',
        body: JSON.stringify(escrowForm),
      });
      setEscrowAccounts((current) => {
        const next = editingEscrowId
          ? current.map((account) => account.id === result.data.id ? result.data : account)
          : [result.data, ...current];
        return result.data.isActive ? next.map((account) => ({ ...account, isActive: account.id === result.data.id })) : next;
      });
      setNotice(editingEscrowId ? 'Rekening berhasil diperbarui.' : 'Rekening berhasil ditambahkan.');
      resetEscrowForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingEscrow(false);
    }
  };

  const editEscrowAccount = (account: EscrowAccount) => {
    setEditingEscrowId(account.id);
    setEscrowForm({ bankName: account.bankName, accountNumber: account.accountNumber, accountHolder: account.accountHolder, isActive: account.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activateEscrowAccount = async (account: EscrowAccount) => {
    try {
      const result = await adminRequest<{ data: EscrowAccount }>(`/admin/escrow-accounts/${encodeURIComponent(account.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ bankName: account.bankName, accountNumber: account.accountNumber, accountHolder: account.accountHolder, isActive: true }),
      });
      setEscrowAccounts((current) => current.map((item) => ({ ...item, isActive: item.id === result.data.id })));
      setNotice('Rekening aktif berhasil diperbarui.');
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteEscrowAccount = async (account: EscrowAccount) => {
    if (!window.confirm(`Hapus rekening ${account.bankName} · ${account.accountNumber}?`)) return;
    try {
      await adminRequest<void>(`/admin/escrow-accounts/${encodeURIComponent(account.id)}`, { method: 'DELETE' });
      setEscrowAccounts((current) => current.filter((item) => item.id !== account.id));
      if (editingEscrowId === account.id) resetEscrowForm();
      setNotice('Rekening berhasil dihapus.');
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const saveAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAdmin(true);
    setError('');
    setNotice('');
    try {
      const payload = editingAdminId
        ? { email: adminForm.email, role: adminForm.role, ...(adminForm.password ? { password: adminForm.password } : {}) }
        : adminForm;
      const response = await adminRequest<{ data: AdminAccount }>(editingAdminId ? `/admin/admins/${encodeURIComponent(editingAdminId)}` : '/admin/admins', {
        method: editingAdminId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      setAdmins((current) => editingAdminId ? current.map((admin) => admin.id === response.data.id ? response.data : admin) : [...current, response.data]);
      setAdminForm({ email: '', password: '', role: 'admin' });
      setEditingAdminId(null);
      setNotice(editingAdminId ? 'Akun admin berhasil diperbarui.' : 'Akun admin berhasil ditambahkan.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingAdmin(false);
    }
  };

  const saveRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAdmin(true);
    setError('');
    setNotice('');
    try {
      const response = await adminRequest<{ data: AdminRole }>(editingRoleKey ? `/admin/roles/${encodeURIComponent(editingRoleKey)}` : '/admin/roles', {
        method: editingRoleKey ? 'PATCH' : 'POST',
        body: JSON.stringify(roleForm),
      });
      setAvailableRoles((current) => editingRoleKey
        ? current.map((role) => role.key === response.data.key ? response.data : role)
        : [...current, response.data].sort((a, b) => a.label.localeCompare(b.label)));
      setRoleForm({ key: '', label: '', permissions: [] });
      setEditingRoleKey(null);
      setNotice(editingRoleKey ? 'Role dan permissions berhasil diperbarui.' : 'Role berhasil dibuat.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingAdmin(false);
    }
  };

  const editRole = (role: AdminRole) => {
    setEditingRoleKey(role.key);
    setRoleForm({ key: role.key, label: role.label, permissions: [...role.permissions] });
  };

  const deleteRole = async (role: AdminRole) => {
    if (!window.confirm(`Hapus role ${role.label}?`)) return;
    try {
      await adminRequest<void>(`/admin/roles/${encodeURIComponent(role.key)}`, { method: 'DELETE' });
      setAvailableRoles((current) => current.filter((item) => item.key !== role.key));
      if (editingRoleKey === role.key) {
        setEditingRoleKey(null);
        setRoleForm({ key: '', label: '', permissions: [] });
      }
      setNotice(`Role ${role.label} berhasil dihapus.`);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const editAdmin = (admin: AdminAccount) => {
    setEditingAdminId(admin.id);
    setAdminForm({ email: admin.email, password: '', role: admin.role });
  };

  const deleteAdmin = async (admin: AdminAccount) => {
    if (!window.confirm(`Hapus akses admin untuk ${admin.email}?`)) return;
    try {
      await adminRequest<void>(`/admin/admins/${encodeURIComponent(admin.id)}`, { method: 'DELETE' });
      setAdmins((current) => current.filter((item) => item.id !== admin.id));
      if (editingAdminId === admin.id) { setEditingAdminId(null); setAdminForm({ email: '', password: '', role: 'admin' }); }
      setNotice('Akun admin berhasil dihapus.');
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAdmin(true);
    setError('');
    setNotice('');
    try {
      const response = await adminRequest<{ data: { id: string; email: string }; token: string }>('/admin/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      });
      saveAdminToken(response.token);
      setAdmins((current) => current.map((admin) => admin.id === response.data.id ? { ...admin, email: response.data.email } : admin));
      setProfileForm({ email: response.data.email, currentPassword: '', password: '' });
      setNotice('Pengaturan profil berhasil disimpan.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingAdmin(false);
    }
  };

  const savePpobMarkup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPpobMarkup(true);
    setError('');
    setNotice('');
    try {
      const response = await adminRequest<{ data: { markupRupiah: number } }>('/admin/ppob-settings', {
        method: 'PATCH',
        body: JSON.stringify({ markupRupiah: parseThousandsInput(ppobMarkupForm) }),
      });
      setPpobMarkup(response.data.markupRupiah);
      setPpobMarkupForm(formatThousandsInput(String(response.data.markupRupiah)));
      setNotice('Markup harga PPOB berhasil disimpan.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingPpobMarkup(false);
    }
  };

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingCategory(true);
    setError('');
    setNotice('');
    try {
      const response = await adminRequest<{ data: Category }>(editingCategoryId ? `/categories/${encodeURIComponent(editingCategoryId)}` : '/categories', {
        method: editingCategoryId ? 'PATCH' : 'POST',
        body: JSON.stringify(categoryForm),
      });
      setCategories((current) => editingCategoryId
        ? current.map((category) => category.id === response.data.id ? response.data : category).sort((a, b) => a.name.localeCompare(b.name))
        : [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryForm({ name: '', icon: 'Smartphone' });
      setEditingCategoryId(null);
      setNotice(editingCategoryId ? 'Kategori berhasil diperbarui.' : 'Kategori berhasil ditambahkan.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;
    setError('');
    setNotice('');
    try {
      await adminRequest<void>(`/categories/${encodeURIComponent(category.id)}`, { method: 'DELETE' });
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setNotice('Kategori berhasil dihapus.');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const heading = NAV_ITEMS.find((item) => item.id === section)?.label || 'Overview';
  const visibleNavItems = NAV_ITEMS.filter((item) => !SECTION_PERMISSIONS[item.id] || permissions.includes(SECTION_PERMISSIONS[item.id]!));

  return (
    <>
      <Head><title>Admin dashboard · LoakinAja</title></Head>
      <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
            <a href="/admin/overview" className="flex items-center gap-3" aria-label="LoakinAja Admin home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white"><ShieldCheck className="h-5 w-5" /></span>
              <span><span className="block text-sm font-bold leading-tight">LoakinAja</span><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Admin studio</span></span>
            </a>
            <button onClick={() => setMobileNavOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Tutup menu"><X className="h-5 w-5" /></button>
          </div>
          <div className="px-4 pt-7"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
            <nav className="mt-3 space-y-1">
              {visibleNavItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => selectSection(id)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition ${section === id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-[18px] w-[18px]" />{label}{section === id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />}</button>)}
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
            <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-slate-700">{profileForm.email || ''}</p><p className="text-[11px] capitalize text-slate-400">{currentAdminRole.replace('_', ' ')}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{profileForm.email.slice(0, 1).toUpperCase() || 'A'}</div></div>
          </header>

          <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 sm:py-9">
            {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
            {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Memuat dashboard...</div> : <>
              {section === 'overview' ? <>
                <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold tracking-tight">Ringkasan platform</h2><p className="mt-1 text-sm text-slate-500">Pantau listing dan aktivitas marketplace.</p></div><div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500"><Activity className="h-3.5 w-3.5 text-emerald-600" /> Data dari backend</div></div>
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
                      <div className="mt-5 space-y-4"><div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-3.5"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-amber-700"><Clock3 className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-700">Menunggu verifikasi</p><p className="text-[11px] text-slate-400">Listing baru</p></div></div><span className="text-sm font-bold text-slate-800">{data.listings.filter((listing) => listing.status === 'pending').length}</span></div>
                        <div className="flex items-center justify-between rounded-xl bg-blue-50/70 p-3.5"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-blue-700"><Box className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-700">Listing tayang</p><p className="text-[11px] text-slate-400">Siap dilihat pembeli</p></div></div><span className="text-sm font-bold text-slate-800">{activeListings}</span></div>
                      <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-3.5"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-amber-700"><Clock3 className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-700">Menunggu pembayaran</p><p className="text-[11px] text-slate-400">Pesanan token pending</p></div></div><span className="text-sm font-bold text-slate-800">{data.orders.filter((order) => order.status === 'pending').length}</span></div>
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3.5"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-emerald-700"><Check className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-slate-700">Listing terjual</p><p className="text-[11px] text-slate-400">Ditandai selesai oleh penjual</p></div></div><span className="text-sm font-bold text-slate-800">{data.listings.filter((listing) => listing.status === 'sold').length}</span></div>
                    </div>
                  </section>
                </div>

                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold">Transaksi terbaru</h3><p className="mt-0.5 text-xs text-slate-400">Pesanan pembelian token</p></div><button onClick={() => selectSection('orders')} className="text-xs font-semibold text-blue-700 hover:text-blue-800">Lihat transaksi <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-slate-50 text-slate-400"><tr><th className="px-5 py-3 font-semibold">PESANAN</th><th className="px-5 py-3 font-semibold">PAKET</th><th className="px-5 py-3 font-semibold">TANGGAL</th><th className="px-5 py-3 font-semibold">STATUS</th><th className="px-5 py-3 text-right font-semibold">NOMINAL</th></tr></thead><tbody className="divide-y divide-slate-100">{[...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4).map((order) => <tr key={order.id}><td className="px-5 py-3.5 font-semibold text-slate-700">#{order.id.slice(-8)}</td><td className="px-5 py-3.5 text-slate-500">{order.packageLabel}</td><td className="px-5 py-3.5 text-slate-500">{formatDate(order.createdAt)}</td><td className="px-5 py-3.5"><StatusPill status={order.status} /></td><td className="px-5 py-3.5 text-right font-semibold text-slate-700">{rupiah(order.amount)}</td></tr>)}</tbody></table>{data.orders.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada transaksi.</p>}</div></section>
              </> : section === 'ppob' ? <>
                <div className="mb-6"><h2 className="text-xl font-bold tracking-tight">Markup harga PPOB</h2><p className="mt-1 text-sm text-slate-500">Atur tambahan harga yang diterapkan pada produk Digiflazz untuk pelanggan.</p></div>
                <form onSubmit={savePpobMarkup} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Coins className="h-5 w-5" /></span><div><h3 className="text-sm font-bold">Markup tetap per transaksi</h3><p className="mt-0.5 text-xs text-slate-400">Nilai ini ditambahkan ke harga Digiflazz dan biaya admin provider, jika ada.</p></div></div>
                  <label className="block text-xs font-semibold text-slate-600">Markup (Rupiah)<input type="text" inputMode="numeric" required value={ppobMarkupForm} onChange={(event) => { const formatted = formatThousandsInput(event.target.value); if (parseThousandsInput(formatted) <= 10000000) setPpobMarkupForm(formatted); }} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label>
                  <p className="mt-2 text-xs text-slate-400">Markup saat ini: <span className="font-semibold text-slate-600">{rupiah(ppobMarkup)}</span>. Perubahan berlaku pada katalog dan quote baru.</p>
                  <button type="submit" disabled={savingPpobMarkup || ppobMarkupForm === ''} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"><Check className="h-4 w-4" />{savingPpobMarkup ? 'Menyimpan...' : 'Simpan markup'}</button>
                </form>
              </> : section === 'finance' ? <>
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold tracking-tight">Ringkasan keuangan</h2><p className="mt-1 text-sm text-slate-500">Pantau penerimaan dari pembelian token dan status pembayaran.</p></div><button type="button" onClick={() => selectSection('orders')} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Lihat semua transaksi<ArrowUpRight className="h-3.5 w-3.5" /></button></div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Pembayaran diterima" value={rupiah(revenue)} note={`${paidOrders.length} transaksi lunas`} icon={CircleDollarSign} tone="bg-emerald-50 text-emerald-700" />
                  <MetricCard title="Menunggu pembayaran" value={rupiah(financeMetrics.pendingAmount)} note={`${financeMetrics.pendingOrders.length} transaksi belum lunas`} icon={Clock3} tone="bg-amber-50 text-amber-700" />
                  <MetricCard title="Rata-rata transaksi lunas" value={rupiah(financeMetrics.averagePaid)} note="Nilai rata-rata per pembayaran berhasil" icon={Wallet} tone="bg-blue-50 text-blue-700" />
                  <MetricCard title="Total pesanan" value={data.orders.length.toLocaleString('id-ID')} note={`${financeMetrics.statusCounts.failed} gagal atau kedaluwarsa`} icon={BadgeCheck} tone="bg-violet-50 text-violet-700" />
                </div>
                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">Penerimaan 6 bulan terakhir</h3><p className="mt-1 text-xs text-slate-400">Dihitung dari transaksi berstatus lunas</p></div><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><CircleDollarSign className="h-4 w-4" /></span></div>
                    {paidOrders.length ? <div className="mt-7 grid h-56 grid-cols-6 items-end gap-3 border-b border-slate-100 pb-2 sm:gap-5">{financeMetrics.months.map((month) => { const maxAmount = Math.max(...financeMetrics.months.map((item) => item.amount), 1); const height = Math.max(8, (month.amount / maxAmount) * 100); return <div key={month.key} className="flex h-full min-w-0 flex-col items-center justify-end gap-2"><span className="max-w-full truncate text-center text-[10px] font-semibold text-slate-500 sm:text-[11px]">{month.amount ? rupiah(month.amount) : '—'}</span><div className="flex h-[68%] w-full items-end"><div title={rupiah(month.amount)} className={`w-full rounded-t-lg transition-all ${month.amount ? 'bg-blue-600' : 'bg-slate-100'}`} style={{ height: `${height}%` }} /></div><span className="text-[10px] font-medium text-slate-400 sm:text-xs">{month.label}</span></div>; })}</div> : <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center"><p className="max-w-sm text-sm text-slate-500">Belum ada pembayaran lunas untuk ditampilkan pada grafik.</p></div>}
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">Status pembayaran</h3><p className="mt-1 text-xs text-slate-400">Ringkasan semua transaksi</p></div><span className="rounded-lg bg-blue-50 p-2 text-blue-700"><Activity className="h-4 w-4" /></span></div>
                    <div className="mt-5 space-y-4">{[{ label: 'Lunas', count: financeMetrics.statusCounts.paid, tone: 'bg-emerald-500', text: 'text-emerald-700' }, { label: 'Menunggu', count: financeMetrics.statusCounts.pending, tone: 'bg-amber-400', text: 'text-amber-700' }, { label: 'Gagal / kedaluwarsa', count: financeMetrics.statusCounts.failed, tone: 'bg-red-400', text: 'text-red-700' }].map((item) => { const percentage = data.orders.length ? (item.count / data.orders.length) * 100 : 0; return <div key={item.label}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-medium text-slate-600">{item.label}</span><span className={`font-bold ${item.text}`}>{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.tone}`} style={{ width: `${percentage}%` }} /></div></div>; })}</div>
                    <div className="mt-6 border-t border-slate-100 pt-4"><p className="text-xs font-semibold text-slate-600">Metode pembayaran</p>{financeMetrics.methods.length ? <ul className="mt-2 space-y-2">{financeMetrics.methods.slice(0, 4).map(([method, count]) => <li key={method} className="flex items-center justify-between gap-3 text-xs"><span className="truncate text-slate-500">{method.replaceAll('-', ' ').toUpperCase()}</span><span className="font-semibold text-slate-700">{count}</span></li>)}</ul> : <p className="mt-2 text-xs text-slate-400">Belum ada data metode pembayaran.</p>}</div>
                  </section>
                </div>
                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold">Aktivitas pembayaran terbaru</h3><p className="mt-0.5 text-xs text-slate-400">Transaksi token terbaru</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{data.orders.length} transaksi</span></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-slate-400"><tr>{['PESANAN', 'PEMBELI', 'PAKET', 'METODE', 'TANGGAL', 'STATUS', 'NOMINAL'].map((cell) => <th key={cell} className="whitespace-nowrap px-5 py-3 font-semibold">{cell}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{[...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8).map((order) => <tr key={order.id}><td className="px-5 py-3.5 font-semibold text-slate-700">#{order.id.slice(-8)}</td><td className="px-5 py-3.5 text-slate-500">{data.users.find((user) => user.id === order.userId)?.name || '—'}</td><td className="px-5 py-3.5 text-slate-500">{order.packageLabel}</td><td className="px-5 py-3.5 text-slate-500">{order.method?.replaceAll('-', ' ').toUpperCase() || '—'}</td><td className="px-5 py-3.5 text-slate-500">{formatDate(order.paidAt || order.createdAt)}</td><td className="px-5 py-3.5"><StatusPill status={order.status} /></td><td className="px-5 py-3.5 text-right font-semibold text-slate-700">{rupiah(order.amount)}</td></tr>)}</tbody></table>{data.orders.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-400">Belum ada data transaksi keuangan.</p>}</div></section>
              </> : section === 'categories' ? <>
                <div className="mb-6"><h2 className="text-xl font-bold tracking-tight">Kategori produk</h2><p className="mt-1 text-sm text-slate-500">Kelola kategori yang tersedia saat pengguna memasang iklan beserta ikon yang tampil di halaman utama.</p></div>
                <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
                  <form onSubmit={saveCategory} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <div className="mb-5"><h3 className="text-sm font-bold">{editingCategoryId ? 'Ubah kategori' : 'Tambah kategori'}</h3><p className="mt-1 text-xs text-slate-400">Pilih nama dan ikon untuk kategori produk.</p></div>
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-slate-600">Nama kategori<input required maxLength={80} value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Contoh: Peralatan olahraga" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label>
                      <fieldset><legend className="text-xs font-semibold text-slate-600">Pilih ikon</legend><div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">{Object.entries(CATEGORY_ICONS).filter(([name]) => name !== 'Home').map(([name, Icon]) => <button type="button" key={name} onClick={() => setCategoryForm((current) => ({ ...current, icon: name }))} aria-label={name} aria-pressed={categoryForm.icon === name} className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-[10px] font-medium transition ${categoryForm.icon === name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-slate-50'}`}><Icon className="h-5 w-5" />{name}</button>)}</div></fieldset>
                    </div>
                    <div className="mt-5 flex gap-2"><button type="submit" disabled={savingCategory} className="min-h-10 flex-1 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{savingCategory ? 'Menyimpan...' : editingCategoryId ? 'Simpan perubahan' : 'Tambah kategori'}</button>{editingCategoryId && <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: '', icon: 'Smartphone' }); }} className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>}</div>
                  </form>
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-bold">Kategori tersimpan</h3><p className="mt-0.5 text-xs text-slate-400">{categories.length} kategori · kategori yang memiliki listing tidak dapat dihapus</p></div>{categories.length ? <ul className="divide-y divide-slate-100">{categories.map((category) => { const Icon = CATEGORY_ICONS[category.icon] || Layers3; return <li key={category.id} className="flex items-center justify-between gap-3 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-700">{category.name}</p><p className="mt-0.5 truncate text-xs text-slate-400">/{category.slug}</p></div></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => { setEditingCategoryId(category.id); setCategoryForm({ name: category.name, icon: category.icon }); setError(''); setNotice(''); }} aria-label={`Ubah ${category.name}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deleteCategory(category)} aria-label={`Hapus ${category.name}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div></li>; })}</ul> : <p className="px-5 py-10 text-center text-sm text-slate-400">Belum ada kategori.</p>}</section>
                </div>
              </> : section === 'admins' ? <>
                <div className="mb-6"><h2 className="text-xl font-bold tracking-tight">Kelola admin</h2><p className="mt-1 text-sm text-slate-500">Atur siapa saja yang memiliki akses ke dashboard admin.</p></div>
                <div role="tablist" aria-label="Kelola admin" className="mb-5 flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1">
                  <button type="button" role="tab" aria-selected={adminManagementTab === 'admins'} onClick={() => setAdminManagementTab('admins')} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${adminManagementTab === 'admins' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>Admin</button>
                  <button type="button" role="tab" aria-selected={adminManagementTab === 'roles'} onClick={() => setAdminManagementTab('roles')} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${adminManagementTab === 'roles' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>Role dan akses</button>
                </div>
                {adminManagementTab === 'admins' && <div role="tabpanel" className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
                  <form onSubmit={saveAdmin} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <div className="mb-5"><h3 className="text-sm font-bold">{editingAdminId ? 'Ubah akun admin' : 'Tambah admin'}</h3><p className="mt-1 text-xs text-slate-400">Password minimal 8 karakter{editingAdminId ? '; kosongkan jika tidak ingin mengubahnya.' : '.'}</p></div>
                    <div className="space-y-4"><label className="block text-xs font-semibold text-slate-600">Email admin<input type="email" required maxLength={254} value={adminForm.email} onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))} placeholder="admin@loakinaja.com" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label><label className="block text-xs font-semibold text-slate-600">Role<select required value={adminForm.role} onChange={(event) => setAdminForm((current) => ({ ...current, role: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50">{availableRoles.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}</select></label><label className="block text-xs font-semibold text-slate-600">{editingAdminId ? 'Password baru (opsional)' : 'Password'}<input type="password" required={!editingAdminId} minLength={8} maxLength={128} autoComplete="new-password" value={adminForm.password} onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))} placeholder="Minimal 8 karakter" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label></div>
                    <div className="mt-5 flex gap-2"><button type="submit" disabled={savingAdmin} className="min-h-10 flex-1 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{savingAdmin ? 'Menyimpan...' : editingAdminId ? 'Simpan perubahan' : 'Tambah admin'}</button>{editingAdminId && <button type="button" onClick={() => { setEditingAdminId(null); setAdminForm({ email: '', password: '', role: 'admin' }); }} className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>}</div>
                  </form>
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold">Akun admin</h3><p className="mt-0.5 text-xs text-slate-400">{admins.length} akun dengan akses admin</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"><UserCog className="mr-1 inline h-3.5 w-3.5" />{admins.length}</span></div><ul className="divide-y divide-slate-100">{admins.map((admin) => <li key={admin.id} className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">{admin.email.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-700">{admin.email}</p><p className="mt-0.5 text-xs text-slate-400">Ditambahkan {formatDate(admin.createdAt)}{admin.id === currentAdminId && <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">Anda</span>}<span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 font-semibold capitalize text-slate-600">{availableRoles.find((role) => role.key === admin.role)?.label || admin.role}</span></p></div></div>{admin.id !== currentAdminId && <div className="flex shrink-0 gap-2"><button type="button" onClick={() => editAdmin(admin)} aria-label={`Ubah admin ${admin.email}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deleteAdmin(admin)} aria-label={`Hapus admin ${admin.email}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div>}</li>)}</ul></section>
                </div>}
                {adminManagementTab === 'roles' && <section role="tabpanel" className="grid gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
                  <form onSubmit={saveRole} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5"><h3 className="text-sm font-bold">{editingRoleKey ? 'Ubah role' : 'Buat role'}</h3><p className="mt-1 text-xs text-slate-400">Atur permission yang berlaku untuk semua admin dengan role ini.</p></div><div className="space-y-4"><label className="block text-xs font-semibold text-slate-600">Role key<input required disabled={!!editingRoleKey} maxLength={64} pattern="[A-Za-z0-9][A-Za-z0-9_-]*" value={roleForm.key} onChange={(event) => setRoleForm((current) => ({ ...current, key: event.target.value.toLowerCase() }))} placeholder="contoh: listing_manager" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50" /></label><label className="block text-xs font-semibold text-slate-600">Nama role<input required maxLength={100} value={roleForm.label} onChange={(event) => setRoleForm((current) => ({ ...current, label: event.target.value }))} placeholder="Listing Manager" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label><fieldset><legend className="text-xs font-semibold text-slate-600">Permissions</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{availablePermissions.map((permission) => <label key={permission} className="flex items-start gap-2 rounded-lg border border-slate-100 p-2.5 text-[11px] text-slate-600"><input type="checkbox" checked={roleForm.permissions.includes(permission)} onChange={(event) => setRoleForm((current) => ({ ...current, permissions: event.target.checked ? [...current.permissions, permission] : current.permissions.filter((item) => item !== permission) }))} className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500" />{permission}</label>)}</div></fieldset></div><div className="mt-5 flex gap-2"><button type="submit" disabled={savingAdmin} className="min-h-10 flex-1 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{savingAdmin ? 'Menyimpan...' : editingRoleKey ? 'Simpan role' : 'Buat role'}</button>{editingRoleKey && <button type="button" onClick={() => { setEditingRoleKey(null); setRoleForm({ key: '', label: '', permissions: [] }); }} className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>}</div></form>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-bold">Role dan akses</h3><p className="mt-0.5 text-xs text-slate-400">Role sistem tidak dapat dihapus; role yang sedang dipakai juga harus dipindahkan dulu.</p></div><ul className="divide-y divide-slate-100">{availableRoles.map((role) => { const assignedCount = admins.filter((admin) => admin.role === role.key).length; return <li key={role.key} className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-slate-700">{role.label}</p><code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{role.key}</code>{role.key === 'super_admin' && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Sistem</span>}</div><p className="mt-1 text-xs text-slate-400">{role.permissions.length} permissions · {assignedCount} admin</p></div>{role.key !== 'super_admin' && <div className="flex shrink-0 gap-2"><button type="button" onClick={() => editRole(role)} aria-label={`Ubah role ${role.label}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deleteRole(role)} disabled={assignedCount > 0} aria-label={`Hapus role ${role.label}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" /></button></div>}</li>; })}</ul></div>
                </section>}
              </> : section === 'profile' ? <>
                <div className="mb-6"><h2 className="text-xl font-bold tracking-tight">Pengaturan profil</h2><p className="mt-1 text-sm text-slate-500">Perbarui email masuk dan password akun admin Anda.</p></div>
                <form onSubmit={saveProfile} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Settings className="h-5 w-5" /></span><div><h3 className="text-sm font-bold">Informasi akun</h3><p className="mt-0.5 text-xs text-slate-400">Email dan password digunakan untuk masuk ke dashboard.</p></div></div><div className="space-y-4"><label className="block text-xs font-semibold text-slate-600">Email admin<input type="email" required maxLength={254} value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label><div className="border-t border-slate-100 pt-4"><p className="mb-3 text-xs font-semibold text-slate-700">Ubah password <span className="font-normal text-slate-400">(opsional)</span></p><div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-semibold text-slate-600">Password saat ini<input type="password" autoComplete="current-password" value={profileForm.currentPassword} onChange={(event) => setProfileForm((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="Diperlukan untuk ubah password" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label><label className="block text-xs font-semibold text-slate-600">Password baru<input type="password" minLength={8} maxLength={128} autoComplete="new-password" value={profileForm.password} onChange={(event) => setProfileForm((current) => ({ ...current, password: event.target.value }))} placeholder="Minimal 8 karakter" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label></div></div></div><button type="submit" disabled={savingAdmin} className="mt-6 min-h-11 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{savingAdmin ? 'Menyimpan...' : 'Simpan pengaturan'}</button></form>
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
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">{referralForest.length ? <div className="flex min-w-max justify-center gap-10 pb-4">{referralForest.map((node) => <ReferralTreeNode key={node.user.id} node={node} depth={1} collapsedIds={collapsedIds} onToggle={toggleNode} onDetail={(id) => setSelectedUserId(id)} />)}</div> : <div className="px-5 py-14 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400"><GitBranch className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-slate-700">Belum ada data referral</p><p className="mt-1 text-xs text-slate-400">Data akan muncul setelah pengguna mendaftar dengan kode referral.</p></div>}</div>
                )}
              </> : section === 'escrow' ? <>
                <div className="mb-6"><h2 className="text-xl font-bold tracking-tight">Rekening Bersama</h2><p className="mt-1 text-sm text-slate-500">Kelola rekening tujuan pembayaran Rekening Bersama. Rekening aktif akan ditampilkan kepada pembeli.</p></div>
                <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <form onSubmit={saveEscrowAccount} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold">{editingEscrowId ? 'Ubah rekening' : 'Tambah rekening'}</h3><p className="mt-1 text-xs text-slate-400">Masukkan detail rekening resmi untuk pembayaran.</p></div><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><CreditCard className="h-5 w-5" /></span></div>
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-slate-600">Nama bank<input required maxLength={80} value={escrowForm.bankName} onChange={(event) => setEscrowForm((current) => ({ ...current, bankName: event.target.value }))} placeholder="Contoh: BCA" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label>
                      <label className="block text-xs font-semibold text-slate-600">Nomor rekening<input required maxLength={64} value={escrowForm.accountNumber} onChange={(event) => setEscrowForm((current) => ({ ...current, accountNumber: event.target.value }))} placeholder="Masukkan nomor rekening" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label>
                      <label className="block text-xs font-semibold text-slate-600">Nama pemilik rekening<input required maxLength={120} value={escrowForm.accountHolder} onChange={(event) => setEscrowForm((current) => ({ ...current, accountHolder: event.target.value }))} placeholder="Sesuai nama pada rekening" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label>
                      <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><input type="checkbox" checked={escrowForm.isActive} onChange={(event) => setEscrowForm((current) => ({ ...current, isActive: event.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500" /><span><span className="block font-semibold text-slate-700">Jadikan rekening aktif</span><span className="mt-0.5 block text-slate-400">Hanya satu rekening dapat aktif pada satu waktu.</span></span></label>
                    </div>
                    <div className="mt-5 flex gap-2"><button disabled={savingEscrow} type="submit" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"><Check className="h-4 w-4" />{savingEscrow ? 'Menyimpan...' : editingEscrowId ? 'Simpan perubahan' : 'Tambah rekening'}</button>{editingEscrowId && <button type="button" onClick={resetEscrowForm} className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>}</div>
                  </form>
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold">Daftar rekening</h3><p className="mt-0.5 text-xs text-slate-400">{escrowAccounts.length} rekening tersimpan</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{escrowAccounts.filter((account) => account.isActive).length} aktif</span></div>
                    {escrowAccounts.length ? <ul className="divide-y divide-slate-100">{escrowAccounts.map((account) => <li key={account.id} className="p-4 sm:p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex min-w-0 items-start gap-3"><span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${account.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><CreditCard className="h-5 w-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-800">{account.bankName}</p>{account.isActive && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Aktif</span>}</div><p className="mt-1 font-mono text-sm font-semibold text-slate-700">{account.accountNumber}</p><p className="mt-0.5 truncate text-xs text-slate-400">a.n. {account.accountHolder}</p></div></div><div className="flex shrink-0 gap-2">{!account.isActive && <button type="button" onClick={() => activateEscrowAccount(account)} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Aktifkan</button>}<button type="button" onClick={() => editEscrowAccount(account)} aria-label={`Ubah rekening ${account.bankName}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deleteEscrowAccount(account)} aria-label={`Hapus rekening ${account.bankName}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div></div></li>)}</ul> : <div className="px-5 py-14 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400"><CreditCard className="h-5 w-5" /></div><p className="mt-3 text-sm font-semibold text-slate-700">Belum ada rekening</p><p className="mt-1 text-xs text-slate-400">Tambahkan rekening untuk menampilkannya pada instruksi pembayaran.</p></div>}
                  </section>
                </div>
              </> : <>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-xl font-bold tracking-tight">{heading}</h2><p className="mt-1 text-sm text-slate-500">Kelola dan tinjau data {heading.toLowerCase()} platform.</p></div><label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Cari ${heading.toLowerCase()}...`} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></label></div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-slate-700">Semua {heading.toLowerCase()}</p><span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{currentItems.length} data</span></div>{section === 'listings' && visiblePendingListings.length > 0 && <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-slate-500">{visiblePendingListings.filter((listing) => selectedListingIds.has(listing.id)).length} dipilih</span><button type="button" disabled={bulkReviewing || !visiblePendingListings.some((listing) => selectedListingIds.has(listing.id))} onClick={() => handleBulkReviewListings('approve')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{bulkReviewing ? 'Memproses...' : 'Setujui terpilih'}</button><button type="button" disabled={bulkReviewing || !visiblePendingListings.some((listing) => selectedListingIds.has(listing.id))} onClick={() => handleBulkReviewListings('reject')} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Tolak terpilih</button></div>}</div><div className="overflow-x-auto">
                  {section === 'users' && <table className="w-full min-w-[860px] text-left text-xs"><TableHead cells={['PENGGUNA', 'KONTAK', 'KODE REFERRAL', 'DIAJAK OLEH', 'BERGABUNG', 'AKSI']} /><tbody className="divide-y divide-slate-100">{(currentItems as AdminUser[]).map((user) => { const referrer = data.users.find((candidate) => candidate.id === user.referredBy); return <tr key={user.id} className="transition hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">{user.name.slice(0, 1).toUpperCase()}</span><button type="button" onClick={() => setSelectedUserId(user.id)} className="font-semibold text-slate-700 hover:text-blue-700 hover:underline">{user.name}</button></div></td><td className="px-5 py-4 text-slate-500">{user.email}<span className="mt-1 block text-slate-400">{user.phone}</span></td><td className="px-5 py-4 font-mono font-semibold text-blue-700">{user.referralCode || '—'}</td><td className="px-5 py-4 text-slate-500">{referrer?.name || '—'}</td><td className="px-5 py-4 text-slate-500">{formatDate(user.createdAt)}</td><td className="px-5 py-4"><button type="button" onClick={() => setSelectedUserId(user.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Eye className="h-3.5 w-3.5" />Detail</button></td></tr>; })}</tbody></table>}
                    {section === 'listings' && <table className="w-full min-w-[940px] text-left text-xs"><thead className="bg-slate-50 text-slate-400"><tr><th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Pilih semua listing menunggu review" checked={visiblePendingListings.length > 0 && visiblePendingListings.every((listing) => selectedListingIds.has(listing.id))} disabled={visiblePendingListings.length === 0} onChange={toggleVisiblePendingSelection} className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500" /></th>{['PRODUK', 'PENJUAL', 'KATEGORI', 'TANGGAL', 'STATUS', 'HARGA', 'TINDAKAN'].map((cell) => <th key={cell} className="whitespace-nowrap px-5 py-3 text-left font-semibold">{cell}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{(currentItems as AdminListing[]).map((listing) => <tr key={listing.id}><td className="px-4 py-4">{listing.status === 'pending' && <input type="checkbox" aria-label={`Pilih ${listing.title}`} checked={selectedListingIds.has(listing.id)} onChange={() => toggleListingSelection(listing.id)} className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500" />}</td><td className="max-w-56 px-5 py-4"><span className="block truncate font-semibold text-slate-700">{listing.title}</span>{listing.reviewReason && <span className="mt-1 block text-red-600">Alasan: {listing.reviewReason}</span>}</td><td className="px-5 py-4 text-slate-500">{listing.seller?.name || data.users.find((user) => user.id === listing.userId)?.name || '—'}</td><td className="px-5 py-4 text-slate-500">{listing.category}</td><td className="px-5 py-4 text-slate-500">{formatDate(listing.createdAt)}</td><td className="px-5 py-4"><StatusPill status={listing.status} /></td><td className="px-5 py-4 text-right font-semibold text-slate-700">{rupiah(listing.price)}</td><td className="px-5 py-4">{listing.status === 'pending' ? <div className="flex items-center gap-2"><button type="button" onClick={() => handleReviewListing(listing, 'approve')} className="rounded-lg bg-emerald-600 px-2.5 py-1.5 font-semibold text-white hover:bg-emerald-700">Setujui</button><button type="button" onClick={() => handleReviewListing(listing, 'reject')} className="rounded-lg border border-red-200 px-2.5 py-1.5 font-semibold text-red-600 hover:bg-red-50">Tolak</button></div> : <span className="text-slate-400">—</span>}</td></tr>)}</tbody></table>}
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
  parentUser,
  collapsedIds,
  onToggle,
  onDetail,
}: {
  node: ReferralNode;
  depth: number;
  parentUser?: AdminUser;
  collapsedIds: Set<string>;
  onToggle: (id: string) => void;
  onDetail: (id: string) => void;
}) {
  const collapsed = collapsedIds.has(node.user.id);
  const total = countDescendants(node);
  return (
    <div className="flex w-[260px] shrink-0 flex-col items-center">
      <article className={`w-full overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${depth === 1 ? 'border-blue-200 ring-1 ring-blue-50' : 'border-slate-200'}`}>
        <div className={`h-1.5 ${depth === 1 ? 'bg-blue-600' : depth === 2 ? 'bg-violet-400' : 'bg-slate-300'}`} />
        <div className="p-3.5">
          <div className="flex items-start gap-2.5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${depth === 1 ? 'bg-blue-50 text-blue-700' : depth === 2 ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
              {node.user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">{node.user.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">{node.user.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">L{depth}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
            <span className="truncate font-mono text-[11px] font-bold text-blue-700">{node.user.referralCode || 'Tanpa kode'}</span>
            <span className="shrink-0 text-[10px] text-slate-500">{node.children.length} langsung · {total} total</span>
          </div>
          <div className="mt-2.5 grid gap-1.5 text-[10px] text-slate-500">
            <span className="flex min-w-0 items-center gap-1.5"><Phone className="h-3 w-3 shrink-0 text-slate-400" /><span className="truncate">{node.user.phone || 'Telepon belum tersedia'}</span></span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 shrink-0 text-slate-400" />Bergabung {formatDate(node.user.createdAt)}</span>
            <span className="flex min-w-0 items-center gap-1.5"><GitBranch className="h-3 w-3 shrink-0 text-slate-400" /><span className="truncate">{parentUser ? `Dari ${parentUser.name}` : 'Pengguna awal'}</span></span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{node.children.length ? `${node.children.length} cabang` : 'Anggota'}</span>
            <div className="flex items-center gap-1.5">
              {node.children.length > 0 && <button type="button" onClick={() => onToggle(node.user.id)} aria-label={collapsed ? `Buka ${node.user.name}` : `Tutup ${node.user.name}`} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-blue-700">{collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button>}
              <button type="button" onClick={() => onDetail(node.user.id)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-700"><Eye className="h-3.5 w-3.5" />Detail</button>
            </div>
          </div>
        </div>
      </article>
      {!collapsed && node.children.length > 0 && (
        <div className="relative mt-5 flex w-max min-w-full justify-center gap-5 border-t border-slate-200 pt-5 before:absolute before:-top-5 before:left-1/2 before:h-5 before:border-l before:border-slate-200">
          {node.children.map((child) => (
            <div key={child.user.id} className="relative flex justify-center before:absolute before:-top-5 before:left-1/2 before:h-5 before:border-l before:border-slate-200">
              <ReferralTreeNode
                node={child}
                depth={depth + 1}
                parentUser={node.user}
                collapsedIds={collapsedIds}
                onToggle={onToggle}
                onDetail={onDetail}
              />
            </div>
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
    rejected: 'bg-red-50 text-red-700',
    sold: 'bg-slate-100 text-slate-600',
    paid: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    failed: 'bg-red-50 text-red-700',
    expired: 'bg-slate-100 text-slate-500',
  };
  const labels: Record<string, string> = { active: 'Aktif', pending: 'Menunggu review', rejected: 'Ditolak', sold: 'Terjual', paid: 'Lunas', failed: 'Gagal', expired: 'Kedaluwarsa' };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${styles[status] || 'bg-slate-100 text-slate-600'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{labels[status] || status}</span>;
}
