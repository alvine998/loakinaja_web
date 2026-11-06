// Data access layer for the LoakinAja API. OTP remains a local demo flow.
import { apiRequest, ApiError, clearAuthToken, getAuthToken, saveAuthToken } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto?: string | null;
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

export type ListingStatus = 'pending' | 'active' | 'rejected' | 'sold';

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
  reviewReason?: string | null;
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

export interface EscrowSale {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'awaiting_payment' | 'payment_submitted' | 'in_escrow' | 'release_requested' | 'released' | 'cancelled';
  escrowBankName: string;
  escrowAccountNumber: string;
  escrowAccountHolder: string;
  createdAt: string;
  paidAt?: string | null;
  releasedAt?: string | null;
  listing?: Pick<Listing, 'id' | 'title' | 'images' | 'price'>;
  buyer?: { id: string; name: string };
  seller?: { id: string; name: string };
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: 'pending' | 'paid' | 'rejected';
  processedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
}

export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  label: string;
  popular?: boolean;
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface TokenOrder {
  id: string;
  packageId: string;
  packageLabel: string;
  tokens: number;
  pricePerToken: number;
  amount: number;
  paymentUrl: string | null;
  status: OrderStatus;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
}

export type PpobType = 'prepaid' | 'postpaid';
export type PpobOrderStatus = 'quoted' | 'creating_payment' | 'awaiting_payment' | 'processing' | 'pending' | 'success' | 'failed' | 'expired';

export interface PpobProduct {
  code: string;
  name: string;
  category: string;
  brand: string;
  type: PpobType;
  description: string;
  price: number;
  providerPrice: number;
  admin: number;
  available: boolean;
  unlimitedStock: boolean;
  stock: number;
}

export interface PpobOrder {
  id: string;
  type: PpobType;
  productCode: string;
  productName: string;
  category: string | null;
  brand: string | null;
  customerNo: string;
  refId: string;
  status: PpobOrderStatus;
  providerStatus: string | null;
  responseCode: string | null;
  message: string | null;
  serialNumber: string | null;
  providerPrice: number;
  amount: number;
  quoteData: Record<string, unknown> | null;
  quoteExpiresAt: string;
  paymentUrl: string | null;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  guestToken?: string;
}

const KEY_USERS = 'loakinaja_users';
const KEY_LISTINGS = 'loakinaja_listings';
const KEY_SESSION = 'loakinaja_session';
const KEY_OTPS = 'loakinaja_otps';
const KEY_RESET_PENDING = 'loakinaja_reset_pending';

const OTP_TTL_MS = 5 * 60 * 1000;

export const FREE_TOKENS_ON_REGISTER = 3;

export const PRICE_PER_TOKEN = 1000;

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'starter', tokens: 5, price: 5 * PRICE_PER_TOKEN, label: 'Starter' },
  { id: 'popular', tokens: 10, price: 10 * PRICE_PER_TOKEN, label: 'Populer', popular: true },
  { id: 'pro', tokens: 20, price: 20 * PRICE_PER_TOKEN, label: 'Pro' },
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

export async function updateProfilePhoto(file: File): Promise<Omit<User, 'password'>> {
  const body = new FormData();
  body.set('photo', file);
  const result = await apiRequest<{ user: Omit<User, 'password'> }>('/auth/me/photo', {
    method: 'PATCH',
    body,
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

// ---------- Token orders (Mayar) ----------

export async function createTokenOrder(packageId: string): Promise<TokenOrder> {
  const result = await apiRequest<{ order: TokenOrder }>('/token-orders', {
    method: 'POST',
    body: JSON.stringify({ packageId }),
  });
  return result.order;
}

export async function getTokenOrder(orderId: string): Promise<TokenOrder | null> {
  try {
    const result = await apiRequest<{ order: TokenOrder }>(`/token-orders/${encodeURIComponent(orderId)}`);
    return result.order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function verifyTokenOrder(orderId: string): Promise<TokenOrder> {
  const result = await apiRequest<{ order: TokenOrder }>(`/token-orders/${encodeURIComponent(orderId)}/verify`, {
    method: 'POST',
  });
  return result.order;
}

// ---------- PPOB (Digiflazz) ----------

export async function getPpobProducts(type: PpobType, search = '', category = ''): Promise<{ data: PpobProduct[]; categories: string[]; refreshing?: boolean; retryAfterSeconds?: number }> {
  const params = new URLSearchParams({ type });
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  return apiRequest(`/ppob/products?${params.toString()}`);
}

export async function createPpobQuote(input: { type: PpobType; productCode: string; customerNo: string; buyerName?: string; buyerEmail?: string; buyerPhone?: string }): Promise<PpobOrder> {
  const result = await apiRequest<{ order: PpobOrder; guestToken?: string }>('/ppob/quotes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return { ...result.order, guestToken: result.guestToken };
}

export async function startPpobPayment(orderId: string, guestToken?: string | null): Promise<PpobOrder> {
  const isGuestOrder = Boolean(guestToken);
  const route = isGuestOrder ? 'guest-orders' : 'orders';
  const result = await apiRequest<{ order: PpobOrder }>(`/ppob/${route}/${encodeURIComponent(orderId)}/payment`, { method: 'POST' }, guestToken);
  return result.order;
}

export async function getPpobOrder(orderId: string, guestToken?: string | null): Promise<PpobOrder | null> {
  try {
    const route = guestToken ? 'guest-orders' : 'orders';
    const result = await apiRequest<{ order: PpobOrder }>(`/ppob/${route}/${encodeURIComponent(orderId)}`, {}, guestToken);
    return result.order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function verifyPpobPayment(orderId: string, guestToken?: string | null): Promise<PpobOrder> {
  const route = guestToken ? 'guest-orders' : 'orders';
  const result = await apiRequest<{ order: PpobOrder }>(`/ppob/${route}/${encodeURIComponent(orderId)}/verify-payment`, { method: 'POST' }, guestToken);
  return result.order;
}

export async function getMyPpobOrders(): Promise<PpobOrder[]> {
  const result = await apiRequest<{ data: PpobOrder[] }>('/ppob/orders');
  return result.data;
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

export async function getMyFavorites(): Promise<Listing[]> {
  const result = await apiRequest<{ data: Listing[] }>('/favorites');
  return result.data;
}

export async function getFavoriteStatus(listingId: string): Promise<boolean> {
  const result = await apiRequest<{ favorited: boolean }>(`/favorites/${encodeURIComponent(listingId)}`);
  return result.favorited;
}

export async function addFavorite(listingId: string): Promise<void> {
  await apiRequest(`/favorites/${encodeURIComponent(listingId)}`, { method: 'POST' });
}

export async function removeFavorite(listingId: string): Promise<void> {
  await apiRequest<void>(`/favorites/${encodeURIComponent(listingId)}`, { method: 'DELETE' });
}

export async function createEscrowSale(listingId: string): Promise<EscrowSale> {
  const result = await apiRequest<{ data: EscrowSale }>('/escrow-sales', { method: 'POST', body: JSON.stringify({ listingId }) });
  return result.data;
}

export async function getEscrowSale(saleId: string): Promise<EscrowSale> {
  const result = await apiRequest<{ data: EscrowSale }>(`/escrow-sales/${encodeURIComponent(saleId)}`);
  return result.data;
}

export async function getMyEscrowSales(): Promise<EscrowSale[]> {
  const result = await apiRequest<{ data: EscrowSale[] }>('/escrow-sales');
  return result.data;
}

export async function confirmEscrowDelivery(saleId: string): Promise<EscrowSale> {
  const result = await apiRequest<{ data: EscrowSale }>(`/escrow-sales/${encodeURIComponent(saleId)}/confirm-delivery`, { method: 'POST' });
  return result.data;
}

export async function submitEscrowPayment(saleId: string): Promise<EscrowSale> {
  const result = await apiRequest<{ data: EscrowSale }>(`/escrow-sales/${encodeURIComponent(saleId)}/submit-payment`, { method: 'POST' });
  return result.data;
}

export async function requestEscrowRelease(saleId: string): Promise<EscrowSale> {
  const result = await apiRequest<{ data: EscrowSale }>(`/escrow-sales/${encodeURIComponent(saleId)}/confirm-delivery`, { method: 'POST', body: JSON.stringify({ decision: 'confirm' }) });
  return result.data;
}

export async function getSellerBalance(): Promise<{ availableAmount: number; minimumAmount: number; data: Withdrawal[] }> {
  return apiRequest('/withdrawals');
}

export async function requestSellerWithdrawal(input: Pick<Withdrawal, 'amount' | 'bankName' | 'accountNumber' | 'accountHolder'>): Promise<Withdrawal> {
  const result = await apiRequest<{ data: Withdrawal }>('/withdrawals', { method: 'POST', body: JSON.stringify(input) });
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

export async function getProductCategories(): Promise<{ id: string; name: string; slug: string; icon: string }[]> {
  const { getCategories } = await import('./categories');
  return getCategories();
}

export const CONDITIONS = ['Like New', 'Sangat Baik', 'Baik', 'Cukup Baik'];
