import { useState, type FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!(response.headers.get('content-type') || '').includes('application/json')) {
        throw new Error(
          'Admin API tidak tersedia. Jalankan aplikasi dengan server Next.js (npm run dev/start); static export tidak mendukung admin login.'
        );
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal masuk.');
      await router.replace('/admin');
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head><title>Admin sign in · LoakinAja</title></Head>
      <main className="mx-auto grid min-h-[72vh] max-w-5xl items-center gap-12 py-8 md:grid-cols-2 md:py-14">
        <section className="hidden md:block">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">LoakinAja</p>
          <h1 className="mt-3 max-w-md text-4xl font-bold leading-tight tracking-tight text-slate-900">Semua operasional, satu tempat.</h1>
          <p className="mt-4 max-w-md leading-7 text-slate-500">Masuk ke ruang admin untuk memantau aktivitas marketplace dan data platform.</p>
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Akses khusus tim LoakinAja</div>
        </section>

        <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Kembali ke website</Link>
          <div className="mb-7">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white md:hidden"><LockKeyhole className="h-5 w-5" /></div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Admin sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Gunakan kredensial admin untuk melanjutkan.</p>
          </div>
          {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email admin</label>
              <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@loakinaja.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
              <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password admin" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </div>
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Memverifikasi...' : 'Masuk ke dashboard'}</button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">Dilindungi sesi admin khusus dengan masa aktif terbatas.</p>
        </section>
      </main>
    </>
  );
}
