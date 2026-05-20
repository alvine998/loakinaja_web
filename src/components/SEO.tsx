import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export default function SEO({
  title = 'LoakinAja - Jual Beli Barang Bekas Terpercaya',
  description = 'Marketplace barang bekas terpercaya dengan fitur Rekening Bersama. Jual dan beli barang bekas berkualitas dengan aman dan mudah.',
  canonicalUrl = 'https://loakinaja.com',
  ogImage = 'https://loakinaja.com/og-image.jpg', // Placeholder for actual OG image
}: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="desc" />
      <meta name="viewport" content="width=device-width, initial-scale=1" key="viewport" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} key="canonical" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" key="ogtype" />
      <meta property="og:url" content={canonicalUrl} key="ogurl" />
      <meta property="og:title" content={title} key="ogtitle" />
      <meta property="og:description" content={description} key="ogdesc" />
      <meta property="og:image" content={ogImage} key="ogimage" />
      <meta property="og:site_name" content="LoakinAja" key="ogsitename" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" key="twcard" />
      <meta name="twitter:url" content={canonicalUrl} key="twurl" />
      <meta name="twitter:title" content={title} key="twtitle" />
      <meta name="twitter:description" content={description} key="twdesc" />
      <meta name="twitter:image" content={ogImage} key="twimage" />

      {/* Theme Color for mobile browsers */}
      <meta name="theme-color" content="#1e3a8a" key="theme-color" />
    </Head>
  );
}
