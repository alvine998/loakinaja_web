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

export type OtpPurpose = 'reset' | 'login';

export interface OtpRecord {
  identifier: string;
  code: string;
  purpose: OtpPurpose;
  expiresAt: number;
  used: boolean;
}

export type ListingStatus = 'active' | 'sold';

export interface Listing {
  id: string;
  userId: string;
  title: string;
  category: string;
  price: number;
  condition: string;
  description: string;
  location: string;
  images: string[];
  createdAt: string;
  status: ListingStatus;
}

export interface ListingInput {
  title: string;
  category: string;
  price: number;
  condition: string;
  description: string;
  location: string;
  images?: string[];
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
const KEY_OTPS = 'loakinaja_otps';
const KEY_RESET_PENDING = 'loakinaja_reset_pending';

const OTP_TTL_MS = 5 * 60 * 1000;

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

export async function verifyPasswordCredentials(
  emailOrPhone: string,
  password: string
): Promise<string> {
  const key = normalizeIdentifier(emailOrPhone);
  const users = read<User[]>(KEY_USERS, []);
  const user = users.find(
    (u) => (u.email === key || u.phone === key) && u.password === password
  );
  if (!user) {
    throw new Error('Email atau password salah.');
  }
  return delay(user.email);
}

export async function getCurrentUser(): Promise<Omit<User, 'password'> | null> {
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) return delay(null);
  const users = read<User[]>(KEY_USERS, []);
  const user = users.find((u) => u.id === id);
  return delay(user ? publicUser(user) : null);
}

export async function updateProfile(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<Omit<User, 'password'>> {
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) throw new Error('Anda harus masuk terlebih dahulu.');

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (!name) throw new Error('Nama tidak boleh kosong.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Format email tidak valid.');
  }
  if (!phone) throw new Error('Nomor telepon tidak boleh kosong.');

  const users = read<User[]>(KEY_USERS, []);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Akun tidak ditemukan.');

  if (users.some((u) => u.id !== id && u.email === email)) {
    throw new Error('Email sudah digunakan akun lain.');
  }
  if (users.some((u) => u.id !== id && u.phone === phone)) {
    throw new Error('Nomor telepon sudah digunakan akun lain.');
  }

  users[idx] = { ...users[idx], name, email, phone };
  write(KEY_USERS, users);
  return delay(publicUser(users[idx]));
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) throw new Error('Anda harus masuk terlebih dahulu.');

  const users = read<User[]>(KEY_USERS, []);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Akun tidak ditemukan.');

  if (users[idx].password !== currentPassword) {
    throw new Error('Password saat ini salah.');
  }
  if (newPassword.length < 8) {
    throw new Error('Password baru minimal 8 karakter.');
  }
  if (newPassword === currentPassword) {
    throw new Error('Password baru harus berbeda dari password saat ini.');
  }

  users[idx] = { ...users[idx], password: newPassword };
  write(KEY_USERS, users);
  return delay(undefined);
}

// ---------- OTP (mock) ----------

interface ResetPending {
  identifier: string;
  expiresAt: number;
}

function normalizeIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed;
}

function findUserByIdentifier(identifier: string): User | undefined {
  const users = read<User[]>(KEY_USERS, []);
  const key = normalizeIdentifier(identifier);
  return users.find((u) => u.email === key || u.phone === key);
}

function pruneOtps(otps: OtpRecord[]): OtpRecord[] {
  const now = Date.now();
  return otps.filter((o) => !o.used && o.expiresAt > now);
}

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(
  identifier: string,
  purpose: OtpPurpose
): Promise<{ identifier: string; demoCode: string }> {
  const key = normalizeIdentifier(identifier);
  if (!key) throw new Error('Masukkan Email / Nomor Telepon terlebih dahulu.');
  const user = findUserByIdentifier(key);
  if (!user) {
    throw new Error('Akun dengan Email / Nomor Telepon tersebut tidak ditemukan.');
  }
  const code = generateOtpCode();
  const otps = pruneOtps(read<OtpRecord[]>(KEY_OTPS, [])).filter(
    (o) => !(o.identifier === key && o.purpose === purpose)
  );
  otps.push({
    identifier: key,
    code,
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
    used: false,
  });
  write(KEY_OTPS, otps);
  return delay({ identifier: key, demoCode: code });
}

function consumeOtp(identifier: string, code: string, purpose: OtpPurpose): void {
  const key = normalizeIdentifier(identifier);
  const otps = read<OtpRecord[]>(KEY_OTPS, []);
  const record = otps.find((o) => o.identifier === key && o.purpose === purpose);
  if (!record) {
    throw new Error('Kode OTP tidak ditemukan. Minta kode baru.');
  }
  if (record.used) {
    throw new Error('Kode OTP sudah digunakan. Minta kode baru.');
  }
  if (record.expiresAt <= Date.now()) {
    throw new Error('Kode OTP kedaluwarsa. Minta kode baru.');
  }
  if (record.code !== code.trim()) {
    throw new Error('Kode OTP salah. Periksa kembali.');
  }
  record.used = true;
  write(KEY_OTPS, otps);
}

export function getDemoOtpCode(identifier: string, purpose: OtpPurpose): string | null {
  if (!isBrowser) return null;
  const key = normalizeIdentifier(identifier);
  const otps = read<OtpRecord[]>(KEY_OTPS, []);
  const record = otps.find(
    (o) => o.identifier === key && o.purpose === purpose && !o.used && o.expiresAt > Date.now()
  );
  return record ? record.code : null;
}

export async function requestPasswordReset(
  identifier: string
): Promise<{ identifier: string; demoCode: string }> {
  return sendOtp(identifier, 'reset');
}

export async function verifyResetOtp(identifier: string, code: string): Promise<void> {
  consumeOtp(identifier, code, 'reset');
  write<ResetPending>(KEY_RESET_PENDING, {
    identifier: normalizeIdentifier(identifier),
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  return delay(undefined);
}

export function hasResetPending(identifier: string): boolean {
  const pending = read<ResetPending | null>(KEY_RESET_PENDING, null);
  if (!pending) return false;
  if (pending.expiresAt <= Date.now()) {
    if (isBrowser) window.localStorage.removeItem(KEY_RESET_PENDING);
    return false;
  }
  return pending.identifier === normalizeIdentifier(identifier);
}

export async function resetPassword(
  identifier: string,
  newPassword: string
): Promise<Omit<User, 'password'>> {
  const key = normalizeIdentifier(identifier);
  if (!hasResetPending(key)) {
    throw new Error('Sesi reset password tidak valid. Minta kode OTP baru.');
  }
  if (newPassword.length < 8) {
    throw new Error('Password minimal 8 karakter.');
  }
  const users = read<User[]>(KEY_USERS, []);
  const idx = users.findIndex((u) => u.email === key || u.phone === key);
  if (idx === -1) throw new Error('Akun tidak ditemukan.');
  users[idx].password = newPassword;
  write(KEY_USERS, users);
  if (isBrowser) window.localStorage.removeItem(KEY_RESET_PENDING);
  return delay(publicUser(users[idx]));
}

export async function requestLoginOtp(
  identifier: string
): Promise<{ identifier: string; demoCode: string }> {
  return sendOtp(identifier, 'login');
}

export async function verifyLoginOtp(
  identifier: string,
  code: string
): Promise<Omit<User, 'password'>> {
  consumeOtp(identifier, code, 'login');
  const user = findUserByIdentifier(identifier);
  if (!user) throw new Error('Akun tidak ditemukan.');
  write(KEY_SESSION, user.id);
  return delay(publicUser(user));
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

export async function createListing(input: ListingInput): Promise<Listing> {
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) throw new Error('Anda harus masuk untuk memasang iklan.');
  const users = read<User[]>(KEY_USERS, []);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Akun tidak ditemukan.');
  if (users[idx].tokens < 1) {
    throw new Error('Token tidak cukup. Beli token untuk memasang iklan.');
  }

  const images = input.images?.length
    ? input.images
    : [placeholderImage(input.category)];

  const listing: Listing = {
    id: uid(),
    userId: id,
    title: input.title.trim(),
    category: input.category,
    price: input.price,
    condition: input.condition,
    description: input.description.trim(),
    location: input.location.trim(),
    images,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  // Persist the (potentially large) listing first so a storage quota error
  // cannot cost the user a token.
  const listings = read<Listing[]>(KEY_LISTINGS, []);
  listings.push(listing);
  write(KEY_LISTINGS, listings);

  // Deduct 1 token for 1 ad.
  users[idx].tokens -= 1;
  write(KEY_USERS, users);

  return delay(listing);
}

export async function updateListing(
  listingId: string,
  input: ListingInput
): Promise<Listing> {
  const listings = read<Listing[]>(KEY_LISTINGS, []);
  const idx = listings.findIndex((l) => l.id === listingId);
  if (idx === -1) throw new Error('Iklan tidak ditemukan.');

  const images = input.images?.length ? input.images : listings[idx].images;

  listings[idx] = {
    ...listings[idx],
    title: input.title.trim(),
    category: input.category,
    price: input.price,
    condition: input.condition,
    description: input.description.trim(),
    location: input.location.trim(),
    images: images.length ? images : [placeholderImage(input.category)],
  };
  write(KEY_LISTINGS, listings);
  return delay(listings[idx]);
}

export async function setListingStatus(
  listingId: string,
  status: ListingStatus
): Promise<Listing> {
  const listings = read<Listing[]>(KEY_LISTINGS, []);
  const idx = listings.findIndex((l) => l.id === listingId);
  if (idx === -1) throw new Error('Iklan tidak ditemukan.');
  listings[idx] = { ...listings[idx], status };
  write(KEY_LISTINGS, listings);
  return delay(listings[idx]);
}

export async function deleteListing(listingId: string): Promise<void> {
  const listings = read<Listing[]>(KEY_LISTINGS, []);
  const next = listings.filter((l) => l.id !== listingId);
  if (next.length === listings.length) throw new Error('Iklan tidak ditemukan.');
  write(KEY_LISTINGS, next);
  return delay(undefined);
}

function placeholderImage(category: string): string {
  return `https://placehold.co/400x300/E2E8F0/1E293B?text=${encodeURIComponent(
    category
  )}`;
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
