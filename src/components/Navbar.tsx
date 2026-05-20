import React from 'react';
import Link from 'next/link';
import { Search, Heart, MessageSquare, User, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-loak-blue tracking-tight">
              Loakin<span className="text-gray-800">Aja</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
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
            <Link href="/chat" className="text-gray-500 hover:text-loak-blue transition-colors">
              <MessageSquare className="h-6 w-6" />
            </Link>
            <Link href="/favorites" className="text-gray-500 hover:text-loak-blue transition-colors">
              <Heart className="h-6 w-6" />
            </Link>
            <div className="hidden sm:flex items-center space-x-2 ml-4 border-l pl-4">
              <Link href="/login" className="text-sm font-medium text-loak-blue border border-loak-blue rounded-md px-4 py-2 hover:bg-loak-light transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="text-sm font-medium text-white bg-loak-blue rounded-md px-4 py-2 hover:bg-loak-blue-dark transition-colors">
                Daftar
              </Link>
            </div>
            
            {/* Mobile Menu */}
            <div className="flex items-center sm:hidden ml-2">
              <button className="text-gray-500 hover:text-gray-900">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
