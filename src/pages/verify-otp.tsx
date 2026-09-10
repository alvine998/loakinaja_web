import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, ShieldCheck, Info } from 'lucide-react';
import {
  getDemoOtpCode,
  requestLoginOtp,
  requestPasswordReset,
  verifyLoginOtp,
  verifyResetOtp,
  type OtpPurpose,
} from '@/lib/db';
import { useAuth } from '@/context/AuthContext';

const RESEND_COOLDOWN = 60;

function isPurpose(value: unknown): value is OtpPurpose {
  return value === 'reset' || value === 'login';
}

export default function VerifyOtp() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [purpose, setPurpose] = useState<OtpPurpose>('reset');
  const [next, setNext] = useState('/');
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const qIdentifier =
      typeof router.query.identifier === 'string' ? router.query.identifier : '';
    const qPurpose = router.query.purpose;
    const qNext = typeof router.query.next === 'string' ? router.query.next : '/';
    if (!qIdentifier) {
      router.replace('/login');
      return;
    }
    setIdentifier(qIdentifier);
    setPurpose(isPurpose(qPurpose) ? qPurpose : 'reset');
    setNext(qNext);
    setDemoCode(getDemoOtpCode(qIdentifier, isPurpose(qPurpose) ? qPurpose : 'reset'));
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown > 0]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setInfo('');
    try {
      const res =
        purpose === 'login'
          ? await requestLoginOtp(identifier)
          : await requestPasswordReset(identifier);
      setDemoCode(getDemoOtpCode(res.identifier, purpose));
      setInfo('Kode OTP baru telah dikirim.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (code.trim().length !== 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
    setSubmitting(true);
    try {
      if (purpose === 'login') {
        await verifyLoginOtp(identifier, code);
        await refresh();
        router.push(next || '/');
      } else {
        await verifyResetOtp(identifier, code);
        router.push(`/reset-password?identifier=${encodeURIComponent(identifier)}`);
      }
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>Verifikasi OTP - LoakinAja</title>
      </Head>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-loak-light">
              <ShieldCheck className="h-6 w-6 text-loak-blue" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Verifikasi OTP
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {purpose === 'login' ? (
                <>
                  Untuk keamanan, masukkan 6 digit kode OTP yang dikirim ke{' '}
                  <span className="font-medium text-gray-700">{identifier}</span> untuk
                  menyelesaikan proses masuk.
                </>
              ) : (
                <>
                  Masukkan 6 digit kode OTP yang dikirim ke{' '}
                  <span className="font-medium text-gray-700">{identifier}</span>.
                </>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" /> {error}
            </div>
          )}

          {info && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-loak-light border border-loak-blue/20 px-4 py-3 text-sm text-loak-blue-dark">
              <Info className="h-5 w-5 shrink-0" /> {info}
            </div>
          )}

          {demoCode && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <span className="font-medium">Mode demo:</span> kode OTP Anda adalah{' '}
              <span className="font-bold tracking-widest">{demoCode}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Kode OTP
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="••••••"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Kode berlaku selama 5 menit.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-loak-blue hover:bg-loak-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-loak-blue transition-colors disabled:opacity-50"
              >
                {submitting ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            {cooldown > 0 ? (
              <p className="text-sm text-gray-400">Kirim ulang dalam {cooldown} detik</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-medium text-loak-blue hover:text-loak-blue-dark"
              >
                Tidak menerima kode? Kirim Ulang
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            <Link href="/login" className="font-medium text-loak-blue hover:text-loak-blue-dark">
              Kembali Masuk
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
