import { createHmac, timingSafeEqual } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export const ADMIN_COOKIE = 'loakinaja_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET
  );
}

export function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';
  const expectedPassword = process.env.ADMIN_PASSWORD || '';
  if (!isAdminConfigured()) return false;
  return (
    safeEqual(email.trim().toLowerCase(), expectedEmail) &&
    safeEqual(password, expectedPassword)
  );
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', expiresAt })).toString(
    'base64url'
  );
  return `${payload}.${sign(payload)}`;
}

export function hasAdminSession(req: NextApiRequest) {
  const token = req.cookies[ADMIN_COOKIE];
  if (!token || !secret()) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  if (!safeEqual(signature, sign(payload))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return session.role === 'admin' && session.expiresAt > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function setAdminCookie(res: NextApiResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  );
}

export function clearAdminCookie(res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  );
}
