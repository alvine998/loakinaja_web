import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import { getListings, Listing } from '@/lib/db';

declare module 'react' {
  interface FormHTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
  }
}

export default function ProductSearch({ isPpob = false }: { isPpob?: boolean }) {
  const router = useRouter();
  const containerRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState(() => typeof router.query.q === 'string' ? router.query.q : '');
  const [suggestions, setSuggestions] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setQuery(typeof router.query.q === 'string' ? router.query.q : '');
  }, [router.query.q]);

  useEffect(() => {
    if (isPpob || query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      getListings({ q: query.trim(), limit: 6 })
        .then((listings) => {
          if (active) {
            setSuggestions(listings);
            setActiveIndex(-1);
          }
        })
        .catch(() => { if (active) setSuggestions([]); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isPpob, query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const value = query.trim();
    setOpen(false);
    if (isPpob) {
      void router.push(`/ppob${value ? `?q=${encodeURIComponent(value)}` : ''}`);
      return;
    }
    void router.push(`/category/semua${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      setOpen(false);
      void router.push(`/product/${suggestions[activeIndex].id}`);
    }
  };

  return (
    <form ref={containerRef} onSubmit={submitSearch} className="relative w-full" toolname="Search LoakinAja products" tooldescription="Search the public LoakinAja marketplace by product keywords and open matching product listings.">
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
        <input
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={!isPpob && open && query.trim().length >= 2}
          aria-controls="product-search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `product-suggestion-${activeIndex}` : undefined}
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm leading-5 placeholder-gray-500 transition-colors focus:border-loak-blue focus:outline-none focus:ring-1 focus:ring-loak-blue"
          placeholder={isPpob ? 'Cari produk PPOB...' : 'Cari barang bekas...'}
          type="search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {!isPpob && open && query.trim().length >= 2 && (
        <div id="product-search-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-[70] mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
          {loading ? (
            <p className="px-4 py-3 text-sm text-gray-500">Mencari produk...</p>
          ) : suggestions.length ? (
            <>
              {suggestions.map((listing, index) => (
                <button
                  id={`product-suggestion-${index}`}
                  key={listing.id}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => { setOpen(false); void router.push(`/product/${listing.id}`); }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${activeIndex === index ? 'bg-loak-light' : 'hover:bg-gray-50'}`}
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={listing.images?.[0] || `https://placehold.co/100x100/E2E8F0/1E293B?text=${encodeURIComponent(listing.category)}`} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-gray-800">{listing.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">{listing.category} · {listing.location}</span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-loak-blue">Rp {listing.price.toLocaleString('id-ID')}</span>
                </button>
              ))}
              <button type="submit" className="mt-1 w-full border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold text-loak-blue hover:bg-gray-50">
                Lihat semua hasil untuk “{query.trim()}”
              </button>
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-gray-500">Tidak ada produk yang cocok dengan “{query.trim()}”.</p>
          )}
        </div>
      )}
    </form>
  );
}
