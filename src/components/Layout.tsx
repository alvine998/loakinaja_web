import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Illustration from './Illustration';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="w-full bg-loak-light/40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Illustration className="h-16 w-16 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-loak-blue">LoakinAja</p>
            <p className="text-xs text-gray-500">Belanja barang bekas berkualitas, ramah kantong &amp; ramah lingkungan.</p>
          </div>
        </div>
      </div>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
