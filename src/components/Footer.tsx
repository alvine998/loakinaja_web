import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-loak-blue mb-4">LoakinAja</h3>
            <p className="text-gray-500 text-sm">
              Marketplace barang bekas terpercaya dengan fitur Rekening Bersama.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Beli</h4>
            <ul className="space-y-2">
              <li><Link href="/cara-belanja" className="text-sm text-gray-500 hover:text-loak-blue">Cara Belanja</Link></li>
              <li><Link href="/pembayaran" className="text-sm text-gray-500 hover:text-loak-blue">Pembayaran</Link></li>
              <li><Link href="/jaminan-aman" className="text-sm text-gray-500 hover:text-loak-blue">Jaminan Aman</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Jual</h4>
            <ul className="space-y-2">
              <li><Link href="/cara-jualan" className="text-sm text-gray-500 hover:text-loak-blue">Cara Jualan</Link></li>
              <li><Link href="/tarik-dana" className="text-sm text-gray-500 hover:text-loak-blue">Tarik Dana</Link></li>
              <li><Link href="/panduan-seller" className="text-sm text-gray-500 hover:text-loak-blue">Panduan Seller</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Bantuan</h4>
            <ul className="space-y-2">
              <li><Link href="/syarat-ketentuan" className="text-sm text-gray-500 hover:text-loak-blue">Syarat dan Ketentuan</Link></li>
              <li><Link href="/kebijakan-privasi" className="text-sm text-gray-500 hover:text-loak-blue">Kebijakan Privasi</Link></li>
              <li><Link href="/hubungi-kami" className="text-sm text-gray-500 hover:text-loak-blue">Hubungi Kami</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-500 hover:text-loak-blue">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 flex items-center justify-between">
          <p className="text-sm text-gray-400">&copy; 2026 LoakinAja. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
