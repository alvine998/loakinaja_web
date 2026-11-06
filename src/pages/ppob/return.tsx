import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function PpobReturnPage() {
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const orderId = typeof router.query.order === 'string' ? router.query.order : '';
    router.replace(orderId ? `/ppob/order?id=${encodeURIComponent(orderId)}` : '/ppob');
  }, [router, router.isReady, router.query.order]);
  return <><Head><title>Memeriksa PPOB - LoakinAja</title></Head><p className="py-20 text-center text-gray-500">Memeriksa status transaksi...</p></>;
}
