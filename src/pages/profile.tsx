import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Coins,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { changePassword, updateProfile } from '@/lib/db';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function PengaturanProfil() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileError, setProfileError] = useState('');
  const [profileNotice, setProfileNotice] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/profile');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({ name: user.name, email: user.email, phone: user.phone });
  }, [user]);

  const profileDirty = useMemo(() => {
    if (!user) return false;
    return (
      profileForm.name !== user.name ||
      profileForm.email !== user.email ||
      profileForm.phone !== user.phone
    );
  }, [profileForm, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileNotice('');
    setSavingProfile(true);
    try {
      // Sync from the saved record so trimmed values don't leave the form "dirty".
      const saved = await updateProfile(profileForm);
      setProfileForm({ name: saved.name, email: saved.email, phone: saved.phone });
      await refresh();
      setProfileNotice('Profil berhasil diperbarui.');
    } catch (err) {
      setProfileError((err as Error).message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordNotice('');

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Konfirmasi password baru tidak sama.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordNotice('Password berhasil diubah.');
    } catch (err) {
      setPasswordError((err as Error).message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-20">Memuat...</p>;
  }

  if (!user) {
    return null;
  }

  const initial = user.name.charAt(0).toUpperCase();
  const passwordInputType = showPasswords ? 'text' : 'password';

  return (
    <>
      <Head>
        <title>Pengaturan Profil - LoakinAja</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        <div className="mb-6 min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            <UserCog className="h-6 w-6 shrink-0 text-loak-blue sm:h-7 sm:w-7" />
            Pengaturan Profil
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola informasi akun dan keamanan akun kamu.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-loak-light text-loak-blue">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Informasi Akun</h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Nama, email, dan nomor telepon yang terhubung dengan akun kamu.
                  </p>
                </div>
              </div>

              {profileError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" /> {profileError}
                </div>
              )}
              {profileNotice && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" /> {profileNotice}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleProfileSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <div className="relative mt-1">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                      placeholder="Nama Lengkap Anda"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                      placeholder="email@loakinaja.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Nomor Telepon
                  </label>
                  <div className="relative mt-1">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                      placeholder="08123456789"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-400">
                    {profileDirty
                      ? 'Ada perubahan yang belum disimpan.'
                      : 'Informasi akun kamu sudah tersimpan.'}
                  </p>
                  <button
                    type="submit"
                    disabled={savingProfile || !profileDirty}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-loak-blue px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {savingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-loak-light text-loak-blue">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900">Ubah Password</h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Gunakan password yang kuat dan tidak dipakai di akun lain.
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" /> {passwordError}
                </div>
              )}
              {passwordNotice && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" /> {passwordNotice}
                </div>
              )}

              <form className="space-y-5" onSubmit={handlePasswordSubmit}>
                <div>
                  <label htmlFor="current" className="block text-sm font-medium text-gray-700">
                    Password Saat Ini
                  </label>
                  <input
                    id="current"
                    name="current"
                    type={passwordInputType}
                    autoComplete="current-password"
                    required
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, current: e.target.value }))
                    }
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                    placeholder="Masukkan password saat ini"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="next" className="block text-sm font-medium text-gray-700">
                      Password Baru
                    </label>
                    <input
                      id="next"
                      name="next"
                      type={passwordInputType}
                      autoComplete="new-password"
                      required
                      value={passwordForm.next}
                      onChange={(e) =>
                        setPasswordForm((f) => ({ ...f, next: e.target.value }))
                      }
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      id="confirm"
                      name="confirm"
                      type={passwordInputType}
                      autoComplete="new-password"
                      required
                      value={passwordForm.confirm}
                      onChange={(e) =>
                        setPasswordForm((f) => ({ ...f, confirm: e.target.value }))
                      }
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-loak-blue focus:border-loak-blue sm:text-sm"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-loak-blue focus:ring-loak-blue"
                  />
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Tampilkan password
                </label>

                <div className="border-t border-gray-100 pt-5">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-loak-blue px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {savingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {savingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>
                </div>
              </form>

              <p className="mt-4 text-xs text-gray-400">
                Lupa password saat ini?{' '}
                <Link
                  href="/forgot-password"
                  className="font-medium text-loak-blue hover:underline"
                >
                  Reset lewat OTP
                </Link>
              </p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24" aria-label="Ringkasan akun">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-loak-light text-2xl font-bold text-loak-blue">
                  {initial}
                </div>
                <p className="mt-3 truncate text-base font-bold text-gray-900">
                  {user.name}
                </p>
                <p className="w-full truncate text-xs text-gray-500">{user.email}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-loak-light px-3 py-1 text-xs font-semibold text-loak-blue-dark">
                  <Coins className="h-3.5 w-3.5" />
                  {user.tokens} token
                </span>
              </div>

              <dl className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-xs">
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <dt className="text-gray-400">Bergabung sejak</dt>
                    <dd className="font-medium text-gray-700">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <dt className="text-gray-400">Nomor telepon</dt>
                    <dd className="break-words font-medium text-gray-700">
                      {user.phone}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-5 space-y-2 border-t border-gray-100 pt-5">
                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-loak-blue px-4 py-2.5 text-sm font-semibold text-loak-blue transition-colors hover:bg-loak-light"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard Penjual
                </Link>
                <Link
                  href="/token"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Coins className="h-4 w-4" /> Beli Token
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
