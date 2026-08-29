import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Filter, ChevronDown } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 mb-3"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
};

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const categoryName = typeof slug === 'string' ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Kategori';

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('terbaru');

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  const products = [
    { id: 1, title: 'iPhone 13 Pro Max 256GB - Mulus Like New', price: 'Rp 14.500.000', location: 'Jakarta Selatan', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=iPhone' },
    { id: 2, title: 'Macbook Pro M1 2020 8/256GB', price: 'Rp 11.200.000', location: 'Bandung', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Macbook' },
    { id: 3, title: 'iPad Pro 11 inch 2021 M1', price: 'Rp 10.000.000', location: 'Surabaya', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=iPad' },
    { id: 4, title: 'Samsung Galaxy S22 Ultra 256GB', price: 'Rp 12.500.000', location: 'Yogyakarta', image: 'https://placehold.co/400x300/E2E8F0/1E293B?text=Samsung' },
  ];

  const locations = ['Jabodetabek', 'Bandung', 'Surabaya', 'Semarang'];

  const parsePrice = (p: string) => Number(p.replace(/[^0-9]/g, ''));

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'termurah') return parsePrice(a.price) - parsePrice(b.price);
    if (sortBy === 'termahal') return parsePrice(b.price) - parsePrice(a.price);
    return a.id - b.id;
  });

  const sortOptions: { value: string; label: string }[] = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'termurah', label: 'Harga Terendah' },
    { value: 'termahal', label: 'Harga Tertinggi' },
  ];

  const FilterContent: React.FC<{ onApply?: () => void }> = ({ onApply }) => (
    <>
      <div className="flex items-center gap-2 font-bold text-gray-800 mb-4 border-b pb-2">
        <Filter className="w-4 h-4" /> Filter
      </div>

      <FilterSection title="Lokasi">
        {locations.map((loc) => (
          <label key={loc} className="flex items-center text-sm text-gray-600">
            <input type="checkbox" className="rounded text-loak-blue focus:ring-loak-blue mr-2" />
            {loc}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Harga">
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Min" className="w-full text-sm border rounded-md p-2 focus:outline-none focus:border-loak-blue" />
          <span className="text-gray-400">-</span>
          <input type="text" placeholder="Max" className="w-full text-sm border rounded-md p-2 focus:outline-none focus:border-loak-blue" />
        </div>
      </FilterSection>

      <FilterSection title="Kondisi" defaultOpen={false}>
        <label className="flex items-center text-sm text-gray-600">
          <input type="checkbox" className="rounded text-loak-blue focus:ring-loak-blue mr-2" />
          Baru
        </label>
        <label className="flex items-center text-sm text-gray-600">
          <input type="checkbox" className="rounded text-loak-blue focus:ring-loak-blue mr-2" defaultChecked />
          Bekas
        </label>
      </FilterSection>

      <button
        onClick={onApply}
        className="w-full mt-2 bg-loak-blue text-white font-medium py-2 rounded-lg text-sm hover:bg-loak-blue-dark transition-colors"
      >
        Terapkan Filter
      </button>
    </>
  );

  return (
    <>
      <Head>
        <title>{categoryName} - LoakinAja</title>
      </Head>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 flex items-center">
        <Link href="/" className="hover:text-loak-blue">Beranda</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-900 font-medium">{categoryName}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky top-24">
            <FilterContent />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Menampilkan produk untuk "{categoryName}"</h1>
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="md:hidden flex items-center gap-1 text-sm text-gray-600 bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" /> Filter
              </button>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-1 text-sm text-gray-600 bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-50"
                  aria-expanded={sortOpen}
                >
                  Urutkan: <span className="font-medium text-gray-800">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <ul className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                    {sortOptions.map((o) => (
                      <li key={o.value}>
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy(o.value);
                            setSortOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2 text-sm text-left hover:bg-loak-light ${
                            sortBy === o.value ? 'font-semibold text-loak-blue' : 'text-gray-600'
                          }`}
                        >
                          {o.label}
                          {sortBy === o.value && <ChevronDown className="w-4 h-4 -rotate-90" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col group">
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 font-medium">{product.title}</h3>
                    <p className="text-loak-blue font-bold text-lg mt-auto mb-1">{product.price}</p>
                    <p className="text-xs text-gray-500">{product.location}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

      {/* Mobile Slide-in Filter Drawer */}
      <div className={`fixed inset-0 z-40 md:hidden ${filtersOpen ? '' : 'pointer-events-none'}`} aria-hidden={!filtersOpen}>
        <div
          onClick={() => setFiltersOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${filtersOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute right-0 top-0 h-full w-3/4 max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            filtersOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4">
            <FilterContent onApply={() => setFiltersOpen(false)} />
          </div>
        </div>
      </div>
    </>
  );
}
