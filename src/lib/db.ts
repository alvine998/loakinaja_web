// Mock backend layer for LoakinAja.
// All data is persisted in localStorage so the app works without a server.
// Every function returns a Promise so the implementation can later be swapped
// for a real HTTP/API client without touching the calling code.

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  tokens: number;
  createdAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  title: string;
  category: string;
  price: number;
  condition: string;
  description: string;
  location: string;
  image: string;
  createdAt: string;
  status: 'active';
}

export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  label: string;
  popular?: boolean;
}

const KEY_USERS = 'loakinaja_users';
const KEY_LISTINGS = 'loakinaja_listings';
const KEY_SESSION = 'loakinaja_session';

export const FREE_TOKENS_ON_REGISTER = 3;

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'starter', tokens: 5, price: 50000, label: 'Starter' },
  { id: 'popular', tokens: 10, price: 90000, label: 'Populer', popular: true },
  { id: 'pro', tokens: 20, price: 160000, label: 'Pro' },
];

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 250));

const isBrowser = typeof window !== 'undefined';

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function publicUser(user: User): Omit<User, 'password'> {
  const { password, ...rest } = user;
  return rest;
}

// ---------- Auth ----------

export async function registerUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<Omit<User, 'password'>> {
  const users = read<User[]>(KEY_USERS, []);
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error('Email sudah terdaftar.');
  }
  const user: User = {
    id: uid(),
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    password: input.password,
    tokens: FREE_TOKENS_ON_REGISTER,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  write(KEY_USERS, users);
  write(KEY_SESSION, user.id);
  return publicUser(user);
}

export async function loginUser(
  email: string,
  password: string
): Promise<Omit<User, 'password'>> {
  const users = read<User[]>(KEY_USERS, []);
  const user = users.find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password
  );
  if (!user) {
    throw new Error('Email atau password salah.');
  }
  write(KEY_SESSION, user.id);
  return publicUser(user);
}

export async function logoutUser(): Promise<void> {
  if (isBrowser) window.localStorage.removeItem(KEY_SESSION);
}

export async function getCurrentUser(): Promise<Omit<User, 'password'> | null> {
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) return delay(null);
  const users = read<User[]>(KEY_USERS, []);
  const user = users.find((u) => u.id === id);
  return delay(user ? publicUser(user) : null);
}

// ---------- Tokens ----------

export async function buyTokens(packageId: string): Promise<Omit<User, 'password'>> {
  const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) throw new Error('Paket token tidak ditemukan.');
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) throw new Error('Anda harus masuk terlebih dahulu.');
  const users = read<User[]>(KEY_USERS, []);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Akun tidak ditemukan.');
  users[idx].tokens += pkg.tokens;
  write(KEY_USERS, users);
  return delay(publicUser(users[idx]));
}

// ---------- Listings ----------

export async function getMyListings(): Promise<Listing[]> {
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) return delay([]);
  const listings = read<Listing[]>(KEY_LISTINGS, []);
  return delay(
    listings
      .filter((l) => l.userId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export async function createListing(input: {
  title: string;
  category: string;
  price: number;
  condition: string;
  description: string;
  location: string;
  image?: string;
}): Promise<Listing> {
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) throw new Error('Anda harus masuk untuk memasang iklan.');
  const users = read<User[]>(KEY_USERS, []);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Akun tidak ditemukan.');
  if (users[idx].tokens < 1) {
    throw new Error('Token tidak cukup. Beli token untuk memasang iklan.');
  }

  // Deduct 1 token for 1 ad.
  users[idx].tokens -= 1;
  write(KEY_USERS, users);

  const listing: Listing = {
    id: uid(),
    userId: id,
    title: input.title.trim(),
    category: input.category,
    price: input.price,
    condition: input.condition,
    description: input.description.trim(),
    location: input.location.trim(),
    image:
      input.image ||
      `https://placehold.co/400x300/E2E8F0/1E293B?text=${encodeURIComponent(
        input.category
      )}`,
    createdAt: new Date().toISOString(),
    status: 'active',
  };
  const listings = read<Listing[]>(KEY_LISTINGS, []);
  listings.push(listing);
  write(KEY_LISTINGS, listings);
  return delay(listing);
}

export const CATEGORIES = [
  'Handphone',
  'Komputer',
  'Elektronik',
  'Kamera',
  'Otomotif',
  'Properti',
];

export const CONDITIONS = ['Like New', 'Sangat Baik', 'Baik', 'Cukup Baik'];
