import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createAdminSession,
  isAdminConfigured,
  setAdminCookie,
  verifyAdminCredentials,
} from '@/lib/adminAuth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!isAdminConfigured()) {
    return res.status(503).json({ error: 'Admin login is not configured on this server.' });
  }

  const { email, password } = req.body ?? {};
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !verifyAdminCredentials(email, password)
  ) {
    return res.status(401).json({ error: 'Email atau password admin salah.' });
  }

  setAdminCookie(res, createAdminSession());
  return res.status(200).json({ ok: true });
}
