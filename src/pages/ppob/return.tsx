import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function PpobReturnPage() {
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const orderId = typeof router.query.order === 'string' ? router.query.order : '';
    const trxId = typeof router.query.trx_id === 'string' ? router.query.trx_id : '';
    if (!orderId) {
      router.replace('/ppob');
      return;
    }
    const target = trxId
      ? `/ppob/order?id=${encodeURIComponent(orderId)}&trx_id=${encodeURIComponent(trxId)}`
      : `/ppob/order?id=${encodeURIComponent(orderId)}`;
    router.replace(target);
  }, [router, router.isReady, router.query.order, router.query.trx_id]);
  return <><Head><title>Memeriksa PPOB - LoakinAja</title></Head><p className="py-20 text-center text-gray-500">Memeriksa status transaksi...</p></>;
}
