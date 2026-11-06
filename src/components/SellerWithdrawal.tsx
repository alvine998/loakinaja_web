import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, Clock3, Wallet } from 'lucide-react';
import { EscrowSale, getMyEscrowSales, getSellerBalance, requestSellerWithdrawal, Withdrawal } from '@/lib/db';
import { formatRupiah } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

export default function SellerWithdrawal() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [minimumAmount, setMinimumAmount] = useState(10000);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [sales, setSales] = useState<EscrowSale[]>([]);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    try {
      const [result, escrowSales] = await Promise.all([getSellerBalance(), getMyEscrowSales()]);
      setBalance(result.availableAmount);
      setMinimumAmount(result.minimumAmount);
      setWithdrawals(result.data);
      setSales(escrowSales.filter((sale) => sale.sellerId === user?.id));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { void reload(); }, [reload]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await requestSellerWithdrawal({ amount: Number(amount.replace(/\D/g, '')), bankName, accountNumber, accountHolder });
      setAmount('');
      setNotice('Permintaan penarikan dikirim. Admin akan memproses transfer ke rekening tujuan.');
      await reload();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel: Record<Withdrawal['status'], string> = { pending: 'Menunggu diproses', paid: 'Sudah dibayar', rejected: 'Ditolak' };

  return (
    <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div><h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Wallet className="h-5 w-5 text-loak-blue" />Saldo &amp; penarikan</h2><p className="mt-1 text-xs text-gray-500">Hanya dana dari transaksi Rekening Bersama yang selesai yang masuk saldo.</p></div>
        <div className="rounded-xl bg-loak-light px-4 py-3 sm:text-right"><p className="text-xs text-gray-500">Saldo tersedia</p><p className="mt-0.5 text-xl font-extrabold text-loak-blue">{formatRupiah(balance)}</p></div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">{notice}</p>}
      <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-gray-600">Nominal penarikan<input required inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))} placeholder={`Min. ${minimumAmount.toLocaleString('id-ID')}`} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-loak-blue" /></label>
        <label className="text-xs font-semibold text-gray-600">Nama bank<input required maxLength={80} value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Contoh: BCA" className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-loak-blue" /></label>
        <label className="text-xs font-semibold text-gray-600">Nomor rekening<input required maxLength={64} value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-loak-blue" /></label>
        <label className="text-xs font-semibold text-gray-600">Nama pemilik rekening<input required maxLength={120} value={accountHolder} onChange={(event) => setAccountHolder(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-loak-blue" /></label>
        <p className="text-xs text-gray-400 sm:col-span-2">Minimum {formatRupiah(minimumAmount)}. Penarikan akan mengurangi saldo tersedia sampai diproses atau ditolak.</p>
        <button type="submit" disabled={submitting || loading || Number(amount.replace(/\D/g, '')) < minimumAmount || Number(amount.replace(/\D/g, '')) > balance} className="inline-flex items-center justify-center gap-2 rounded-lg bg-loak-blue px-4 py-3 text-sm font-bold text-white hover:bg-loak-blue-dark disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"><ArrowDownToLine className="h-4 w-4" />{submitting ? 'Mengirim...' : 'Tarik Dana'}</button>
      </form>
      <div className="mt-6 border-t border-gray-100 pt-5"><h3 className="flex items-center gap-2 text-sm font-bold text-gray-800"><Clock3 className="h-4 w-4 text-gray-400" />Riwayat penarikan</h3>{loading ? <p className="mt-3 text-xs text-gray-400">Memuat...</p> : withdrawals.length ? <ul className="mt-2 divide-y divide-gray-100">{withdrawals.map((withdrawal) => <li key={withdrawal.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"><span><span className="font-semibold text-gray-700">{formatRupiah(withdrawal.amount)}</span><span className="ml-2 text-gray-400">{withdrawal.bankName} · {withdrawal.accountNumber}</span></span><span className={`rounded-full px-2.5 py-1 font-semibold ${withdrawal.status === 'paid' ? 'bg-green-50 text-green-700' : withdrawal.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{statusLabel[withdrawal.status]}</span></li>)}</ul> : <p className="mt-3 text-xs text-gray-400">Belum ada permintaan penarikan.</p>}</div>
      <div className="mt-6 border-t border-gray-100 pt-5"><h3 className="text-sm font-bold text-gray-800">Transaksi Rekening Bersama</h3>{loading ? <p className="mt-3 text-xs text-gray-400">Memuat...</p> : sales.length ? <ul className="mt-2 divide-y divide-gray-100">{sales.map((sale) => <li key={sale.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"><span><span className="font-semibold text-gray-700">{sale.listingTitle}</span><span className="ml-2 text-gray-400">{formatRupiah(sale.amount)}</span></span><span className={`rounded-full px-2.5 py-1 font-semibold ${sale.status === 'released' ? 'bg-green-50 text-green-700' : sale.status === 'in_escrow' || sale.status === 'release_requested' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{sale.status.replaceAll('_', ' ')}</span></li>)}</ul> : <p className="mt-3 text-xs text-gray-400">Belum ada penjualan melalui Rekening Bersama.</p>}</div>
    </section>
  );
}
