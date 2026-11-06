import { useEffect } from 'react';
import { getCategories } from '@/lib/categories';
import { getListings } from '@/lib/db';

type WebMCPTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

type ModelContext = { registerTool: (tool: WebMCPTool) => void | (() => void) };

export default function WebMCPTools() {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!modelContext?.registerTool) return;

    const unregister: Array<() => void> = [];
    for (const tool of [
      {
        name: 'search_products',
        description: 'Search public active LoakinAja listings by product title. Returns title, price, category, location and product URL.',
        inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Product title or keywords to search for.' } }, required: ['query'], additionalProperties: false },
        execute: async ({ query }: Record<string, unknown>) => {
          const listings = await getListings({ q: String(query || ''), limit: 10 });
          return listings.map((listing) => ({ title: listing.title, price: listing.price, currency: 'IDR', category: listing.category, location: listing.location, url: `https://loakinaja.com/product/${listing.id}` }));
        },
      },
      {
        name: 'list_product_categories',
        description: 'List product categories available on the LoakinAja marketplace.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: async () => (await getCategories()).map(({ name, slug }) => ({ name, url: `https://loakinaja.com/category/${slug}` })),
      },
    ]) {
      const result = modelContext.registerTool(tool);
      if (typeof result === 'function') unregister.push(result);
    }
    return () => unregister.forEach((dispose) => dispose());
  }, []);

  return null;
}
