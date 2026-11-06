import type { NextApiRequest, NextApiResponse } from 'next';

const CONTENT = `# LoakinAja — Jual beli barang bekas terpercaya

LoakinAja is an Indonesian marketplace for buying and selling quality pre-owned goods, with Rekening Bersama transaction support.

Browse [active product listings](https://loakinaja.com/category/semua) by category. Sellers use one token to publish one listing; new accounts receive three free tokens. See [public token pricing](https://loakinaja.com/harga).

Rekening Bersama holds buyer payment until delivery is confirmed. Payment receipt and seller withdrawals are manually verified and processed by LoakinAja administrators.

## Pages
- [About](https://loakinaja.com/tentang-kami)
- [How to buy](https://loakinaja.com/cara-belanja)
- [How to sell](https://loakinaja.com/cara-jualan)
- [Pricing](https://loakinaja.com/harga)
- [Secure transactions](https://loakinaja.com/jaminan-aman)
- [Contact](https://loakinaja.com/hubungi-kami)
- [Terms](https://loakinaja.com/syarat-ketentuan)
- [Privacy](https://loakinaja.com/kebijakan-privasi)
- [Sitemap](https://loakinaja.com/sitemap.xml)

Contact: [support@loakinaja.com](mailto:support@loakinaja.com) · [+62 812-3456-7890](tel:+6281234567890)
`;

export default function homeMarkdown(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.status(200).send(CONTENT);
}
