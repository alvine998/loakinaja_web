// Data access layer for the LoakinAja API. Payment and OTP features remain
// local demo flows until matching backend endpoints are implemented.
import { apiRequest, ApiError, clearAuthToken, getAuthToken, saveAuthToken } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  tokens: number;
  createdAt: string;
  referralCode?: string;
  referredBy?: string;
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
  seller?: { id: string; name: string; createdAt: string };
}

export interface ListingInput {
  title: string;
  category: string;
  price: number;
  condition: string;
  description: string;
  location: string;
  images?: string[];
  imageFiles?: File[];
}

export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  label: string;
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  label: string;
  group: string;
  codeLabel: string;
  instructions: string[];
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface TokenOrder {
  id: string;
  userId: string;
  packageId: string;
  packageLabel: string;
  tokens: number;
  pricePerToken: number;
  amount: number;
  method: string;
  paymentCode: string;
  status: OrderStatus;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
}

const KEY_USERS = 'loakinaja_users';
const KEY_LISTINGS = 'loakinaja_listings';
const KEY_SESSION = 'loakinaja_session';
const KEY_OTPS = 'loakinaja_otps';
const KEY_RESET_PENDING = 'loakinaja_reset_pending';
const KEY_ORDERS = 'loakinaja_token_orders';

const OTP_TTL_MS = 5 * 60 * 1000;
const ORDER_TTL_MS = 15 * 60 * 1000;

export const FREE_TOKENS_ON_REGISTER = 3;

export const PRICE_PER_TOKEN = 1000;

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'starter', tokens: 5, price: 5 * PRICE_PER_TOKEN, label: 'Starter' },
  { id: 'popular', tokens: 10, price: 10 * PRICE_PER_TOKEN, label: 'Populer', popular: true },
  { id: 'pro', tokens: 20, price: 20 * PRICE_PER_TOKEN, label: 'Pro' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bca-va',
    label: 'BCA Virtual Account',
    group: 'Virtual Account',
    codeLabel: 'Nomor Virtual Account',
    instructions: [
      'Buka aplikasi BCA mobile, myBCA, atau ATM BCA.',
      'Pilih m-Transfer, lalu Transfer ke BCA Virtual Account.',
      'Masukkan nomor Virtual Account di atas dan periksa nominalnya.',
      'Selesaikan pembayaran sebelum waktu habis.',
    ],
  },
  {
    id: 'mandiri-va',
    label: 'Mandiri Virtual Account',
    group: 'Virtual Account',
    codeLabel: 'Nomor Virtual Account',
    instructions: [
      "Buka aplikasi Livin' by Mandiri atau ATM Mandiri.",
      'Pilih Bayar, lalu Multipayment.',
      'Masukkan nomor Virtual Account di atas dan periksa nominalnya.',
      'Selesaikan pembayaran sebelum waktu habis.',
    ],
  },
  {
    id: 'bni-va',
    label: 'BNI Virtual Account',
    group: 'Virtual Account',
    codeLabel: 'Nomor Virtual Account',
    instructions: [
      'Buka aplikasi BNI Mobile Banking atau ATM BNI.',
      'Pilih Transfer, lalu Virtual Account Billing.',
      'Masukkan nomor Virtual Account di atas dan periksa nominalnya.',
      'Selesaikan pembayaran sebelum waktu habis.',
    ],
  },
  {
    id: 'gopay',
    label: 'GoPay',
    group: 'E-Wallet',
    codeLabel: 'Kode Pembayaran',
    instructions: [
      'Buka aplikasi Gojek, lalu pilih GoPay.',
      'Pilih Bayar dan masukkan kode pembayaran di atas.',
      'Periksa nominal, lalu konfirmasi pembayaran.',
    ],
  },
  {
    id: 'alfamart',
    label: 'Alfamart',
    group: 'Minimarket',
    codeLabel: 'Kode Pembayaran',
    instructions: [
      'Datang ke gerai Alfamart terdekat.',
      'Sebutkan pembayaran LoakinAja dan tunjukkan kode di atas.',
      'Bayar sesuai nominal sebelum waktu habis.',
      'Simpan struk sebagai bukti pembayaran.',
    ],
  },
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

function createReferralCode(users: User[]) {
  let code = '';
  do {
    code = `LOAK${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  } while (users.some((user) => user.referralCode === code));
  return code;
}

function ensureReferralCodes(users: User[]) {
  let changed = false;
  users.forEach((user) => {
    if (!user.referralCode) {
      user.referralCode = createReferralCode(users);
      changed = true;
    }
  });
  if (changed) write(KEY_USERS, users);
  return changed;
}

// ---------- Auth ----------

export async function registerUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}): Promise<Omit<User, 'password'>> {
  const result = await apiRequest<{ user: Omit<User, 'password'>; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  saveAuthToken(result.token);
  return result.user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<Omit<User, 'password'>> {
  const result = await apiRequest<{ user: Omit<User, 'password'>; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveAuthToken(result.token);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  clearAuthToken();
}

export async function verifyPasswordCredentials(
  emailOrPhone: string,
  password: string
): Promise<string> {
  await loginUser(emailOrPhone, password);
  return emailOrPhone.trim().toLowerCase();
}

export async function getCurrentUser(): Promise<Omit<User, 'password'> | null> {
  if (!getAuthToken()) return null;
  try {
    const result = await apiRequest<{ user: Omit<User, 'password'> }>('/auth/me');
    return result.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) clearAuthToken();
    return null;
  }
}

export async function getMyReferralCount(): Promise<number> {
  const result = await apiRequest<{ count: number }>('/auth/referral-count');
  return result.count;
}

export async function updateProfile(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<Omit<User, 'password'>> {
  const result = await apiRequest<{ user: Omit<User, 'password'> }>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return result.user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiRequest<void>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
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

// ---------- Token orders (mock payment) ----------
// There is no payment gateway wired up: an order is created here, the waiting
// page polls it, and payTokenOrder() stands in for the gateway callback that
// would normally credit the tokens.

function requireSession(): string {
  const id = read<string | null>(KEY_SESSION, null);
  if (!id) throw new Error('Anda harus masuk terlebih dahulu.');
  return id;
}

function randomDigits(length: number): string {
  let digits = '';
  for (let i = 0; i < length; i += 1) {
    digits += Math.floor(Math.random() * 10);
  }
  return digits;
}

function generatePaymentCode(method: PaymentMethod): string {
  return method.group === 'Virtual Account'
    ? `8808${randomDigits(8)}`
    : randomDigits(10);
}

function expireIfNeeded(order: TokenOrder): TokenOrder {
  if (order.status === 'pending' && Date.parse(order.expiresAt) <= Date.now()) {
    return { ...order, status: 'expired' };
  }
  return order;
}

export function getPaymentMethod(methodId: string): PaymentMethod | null {
  return PAYMENT_METHODS.find((m) => m.id === methodId) ?? null;
}

export async function createTokenOrder(
  packageId: string,
  methodId: string
): Promise<TokenOrder> {
  const userId = requireSession();
  const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) throw new Error('Paket token tidak ditemukan.');
  const method = getPaymentMethod(methodId);
  if (!method) throw new Error('Metode pembayaran tidak valid.');

  const now = Date.now();
  const order: TokenOrder = {
    id: uid(),
    userId,
    packageId: pkg.id,
    packageLabel: pkg.label,
    tokens: pkg.tokens,
    pricePerToken: PRICE_PER_TOKEN,
    amount: pkg.tokens * PRICE_PER_TOKEN,
    method: method.id,
    paymentCode: generatePaymentCode(method),
    status: 'pending',
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ORDER_TTL_MS).toISOString(),
  };

  const orders = read<TokenOrder[]>(KEY_ORDERS, []);
  orders.push(order);
  write(KEY_ORDERS, orders);
  return delay(order);
}

export async function getTokenOrder(orderId: string): Promise<TokenOrder | null> {
  const userId = read<string | null>(KEY_SESSION, null);
  if (!userId) return delay(null);

  const orders = read<TokenOrder[]>(KEY_ORDERS, []);
  const idx = orders.findIndex((o) => o.id === orderId && o.userId === userId);
  if (idx === -1) return delay(null);

  const order = expireIfNeeded(orders[idx]);
  if (order !== orders[idx]) {
    orders[idx] = order;
    write(KEY_ORDERS, orders);
  }
  return delay(order);
}

export async function payTokenOrder(orderId: string): Promise<TokenOrder> {
  const userId = requireSession();
  const orders = read<TokenOrder[]>(KEY_ORDERS, []);
  const idx = orders.findIndex((o) => o.id === orderId && o.userId === userId);
  if (idx === -1) throw new Error('Pesanan tidak ditemukan.');

  const order = expireIfNeeded(orders[idx]);
  // Already settled: return as-is so a repeated confirmation cannot double-credit.
  if (order.status === 'paid') return delay(order);
  if (order.status === 'expired') {
    throw new Error('Waktu pembayaran sudah habis. Buat pesanan baru.');
  }
  if (order.status === 'failed') {
    throw new Error('Pesanan sudah dibatalkan. Buat pesanan baru.');
  }

  const users = read<User[]>(KEY_USERS, []);
  const userIdx = users.findIndex((u) => u.id === userId);
  if (userIdx === -1) throw new Error('Akun tidak ditemukan.');
  users[userIdx].tokens += order.tokens;
  write(KEY_USERS, users);

  const paid: TokenOrder = {
    ...order,
    status: 'paid',
    paidAt: new Date().toISOString(),
  };
  orders[idx] = paid;
  write(KEY_ORDERS, orders);
  return delay(paid);
}

export async function failTokenOrder(orderId: string): Promise<TokenOrder> {
  const userId = requireSession();
  const orders = read<TokenOrder[]>(KEY_ORDERS, []);
  const idx = orders.findIndex((o) => o.id === orderId && o.userId === userId);
  if (idx === -1) throw new Error('Pesanan tidak ditemukan.');

  const order = expireIfNeeded(orders[idx]);
  if (order.status !== 'pending') return delay(order);

  const failed: TokenOrder = { ...order, status: 'failed' };
  orders[idx] = failed;
  write(KEY_ORDERS, orders);
  return delay(failed);
}

// ---------- Listings ----------

export async function getMyListings(): Promise<Listing[]> {
  const result = await apiRequest<{ data: Listing[] }>('/listings/mine');
  return result.data;
}

export async function createListing(input: ListingInput): Promise<Listing> {
  const body = new FormData();
  body.set('title', input.title);
  body.set('category', input.category);
  body.set('price', String(input.price));
  body.set('condition', input.condition);
  body.set('description', input.description);
  body.set('location', input.location);
  (input.imageFiles || []).forEach((file) => body.append('images', file));
  const result = await apiRequest<{ data: Listing }>('/listings', { method: 'POST', body });
  return result.data;
}

export async function updateListing(
  listingId: string,
  input: ListingInput
): Promise<Listing> {
  const result = await apiRequest<{ data: Listing }>(`/listings/${encodeURIComponent(listingId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function setListingStatus(
  listingId: string,
  status: ListingStatus
): Promise<Listing> {
  const result = await apiRequest<{ data: Listing }>(`/listings/${encodeURIComponent(listingId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return result.data;
}

export async function deleteListing(listingId: string): Promise<void> {
  await apiRequest<void>(`/listings/${encodeURIComponent(listingId)}`, { method: 'DELETE' });
}

export async function getListings(options: { category?: string; q?: string; limit?: number } = {}): Promise<Listing[]> {
  const params = new URLSearchParams();
  if (options.category) params.set('category', options.category);
  if (options.q) params.set('q', options.q);
  if (options.limit) params.set('limit', String(options.limit));
  const query = params.toString();
  const result = await apiRequest<{ data: Listing[] }>(`/listings${query ? `?${query}` : ''}`);
  return result.data;
}

export async function getListing(listingId: string): Promise<Listing> {
  const result = await apiRequest<{ data: Listing }>(`/listings/${encodeURIComponent(listingId)}`);
  return result.data;
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
