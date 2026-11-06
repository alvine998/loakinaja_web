import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { getTokenOrder, verifyTokenOrder } from '@/lib/db';

export default function PaymentReturnPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady || loading) return;
    if (!user) {
      const next = `/payment/return?order=${encodeURIComponent(String(router.query.order || ''))}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const orderId = typeof router.query.order === 'string' ? router.query.order : '';
    if (!orderId) {
      router.replace('/token');
      return;
    }

    let active = true;
    const checkPayment = async () => {
      try {
        const order = await verifyTokenOrder(orderId);
        if (!active) return;
        if (order.status === 'paid') {
          router.replace(`/payment/success?order=${encodeURIComponent(order.id)}`);
        } else if (order.status === 'failed' || order.status === 'expired') {
          router.replace(`/payment/failed?order=${encodeURIComponent(order.id)}`);
        } else {
          router.replace(`/payment?order=${encodeURIComponent(order.id)}`);
        }
      } catch (verificationError) {
        if (!active) return;
        setError((verificationError as Error).message);
        const order = await getTokenOrder(orderId).catch(() => null);
        if (active && order) {
          router.replace(`/payment?order=${encodeURIComponent(order.id)}`);
        }
      }
    };
    checkPayment();
    return () => {
      active = false;
    };
  }, [router, router.isReady, router.query.order, user, loading]);

  return (
    <>
      <Head><title>Memeriksa Pembayaran - LoakinAja</title></Head>
      <div className="py-20 text-center">
        <p className="text-gray-700">Memeriksa status pembayaran dengan Mayar...</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </>
  );
}
