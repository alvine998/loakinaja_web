import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Heart, MessageSquare, Menu, X, Coins, PlusCircle, LogOut, LayoutDashboard } from 'lucide-react';
import Illustration from './Illustration';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const categories = [
    { name: 'Handphone', slug: 'handphone' },
    { name: 'Komputer', slug: 'komputer' },
    { name: 'Elektronik', slug: 'elektronik' },
    { name: 'Kamera', slug: 'kamera' },
    { name: 'Otomotif', slug: 'otomotif' },
    { name: 'Properti', slug: 'properti' },
  ];

  const helpLinks = [
    { name: 'Cara Belanja', href: '/cara-belanja' },
    { name: 'Cara Jualan', href: '/cara-jualan' },
    { name: 'Jaminan Aman', href: '/jaminan-aman' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Hubungi Kami', href: '/hubungi-kami' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Illustration className="h-9 w-9 hidden sm:block" />
            <Link href="/" className="text-2xl font-bold text-loak-blue tracking-tight">
              Loakin<span className="text-gray-800">Aja</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-loak-blue focus:ring-1 focus:ring-loak-blue sm:text-sm transition-colors"
                placeholder="Cari barang bekas..."
                type="search"
              />
            </div>
          </div>

          {/* Icons and Auth */}
          <div className="flex items-center ml-4 space-x-4">
            <Link href="/chat" className="text-gray-500 hover:text-loak-blue transition-colors" aria-label="Chat">
              <MessageSquare className="h-6 w-6" />
            </Link>
            <Link href="/favorites" className="text-gray-500 hover:text-loak-blue transition-colors" aria-label="Favorit">
              <Heart className="h-6 w-6" />
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center space-x-2 ml-4 border-l pl-4">
                <Link
                  href="/jual"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-loak-blue rounded-md px-4 py-2 hover:bg-loak-blue-dark transition-colors"
                >
                  <PlusCircle className="h-4 w-4" /> Jual
                </Link>
                <Link
                  href="/token"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-loak-blue border border-loak-blue rounded-md px-3 py-2 hover:bg-loak-light transition-colors"
                  title="Token tersedia"
                >
                  <Coins className="h-4 w-4" />
                  <span className="font-bold">{user.tokens}</span>
                </Link>
                <div className="flex items-center gap-2 pl-1">
                  <Link
                    href="/dashboard"
                    title="Dashboard Penjual"
                    className="flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-loak-blue"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span className="max-w-[110px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-gray-400 hover:text-loak-blue transition-colors"
                    aria-label="Keluar"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 ml-4 border-l pl-4">
                <Link href="/login" className="text-sm font-medium text-loak-blue border border-loak-blue rounded-md px-4 py-2 hover:bg-loak-light transition-colors">
                  Masuk
                </Link>
                <Link href="/register" className="text-sm font-medium text-white bg-loak-blue rounded-md px-4 py-2 hover:bg-loak-blue-dark transition-colors">
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="flex items-center sm:hidden ml-2">
              <button
                onClick={() => setMenuOpen(true)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Buka menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar (Mobile) */}
        <div className="lg:hidden pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-loak-blue focus:ring-1 focus:ring-loak-blue sm:text-sm transition-colors"
              placeholder="Cari barang bekas..."
              type="search"
            />
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      <div className={`fixed inset-0 z-50 ${menuOpen ? '' : 'pointer-events-none'}`} aria-hidden={!menuOpen}>
        {/* Backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-3/4 max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 flex-shrink-0">
            <span className="text-xl font-bold text-loak-blue tracking-tight">
              Loakin<span className="text-gray-800">Aja</span>
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Tutup menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Drawer content */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
            {/* Auth */}
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-loak-light px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-loak-blue-dark">
                    <Coins className="h-4 w-4" />
                    {user.tokens}
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-loak-blue px-4 py-2.5 text-sm font-semibold text-loak-blue transition-colors hover:bg-loak-light"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard Penjual
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/jual" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-white bg-loak-blue rounded-md px-4 py-2.5 hover:bg-loak-blue-dark transition-colors">
                    Jual Barang
                  </Link>
                  <Link href="/token" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-loak-blue border border-loak-blue rounded-md px-4 py-2.5 hover:bg-loak-light transition-colors">
                    Beli Token
                  </Link>
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full text-center text-sm font-medium text-gray-600 border border-gray-200 rounded-md px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-loak-blue border border-loak-blue rounded-md px-4 py-2.5 hover:bg-loak-light transition-colors">
                  Masuk
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-white bg-loak-blue rounded-md px-4 py-2.5 hover:bg-loak-blue-dark transition-colors">
                  Daftar
                </Link>
              </div>
            )}

            {/* Categories */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Kategori</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-loak-light hover:text-loak-blue transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Help links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Bantuan</p>
              <div className="space-y-1">
                {helpLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-loak-blue transition-colors"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
