import type { GetServerSideProps } from 'next';
import fs from 'node:fs';
import path from 'node:path';

const SITE_URLS = [
  ['/', 'daily', '1.0'],
  ['/tentang-kami', 'monthly', '0.8'],
  ['/harga', 'monthly', '0.8'],
  ['/category/semua', 'daily', '0.9'],
  ['/cara-belanja', 'monthly', '0.8'],
  ['/pembayaran', 'monthly', '0.8'],
  ['/jaminan-aman', 'monthly', '0.8'],
  ['/cara-jualan', 'monthly', '0.8'],
  ['/tarik-dana', 'monthly', '0.7'],
  ['/panduan-seller', 'monthly', '0.7'],
  ['/syarat-ketentuan', 'monthly', '0.5'],
  ['/kebijakan-privasi', 'monthly', '0.5'],
  ['/hubungi-kami', 'monthly', '0.6'],
  ['/faq', 'monthly', '0.6'],
] as const;

const PAGE_FILES: Record<string, string> = {
  '/': 'index.tsx',
  '/tentang-kami': 'tentang-kami.tsx',
  '/harga': 'harga.tsx',
  '/category/semua': 'category/[slug].tsx',
};

function getLastModified(urlPath: string) {
  const relativeFile = PAGE_FILES[urlPath] || `${urlPath.slice(1)}.tsx`;
  const sourcePath = path.join(process.cwd(), 'src', 'pages', relativeFile);
  try {
    return fs.statSync(sourcePath).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls = SITE_URLS.map(([urlPath, changefreq, priority]) => `  <url><loc>https://loakinaja.com${urlPath}</loc><lastmod>${getLastModified(urlPath)}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join('\n');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.write(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
  res.end();
  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
