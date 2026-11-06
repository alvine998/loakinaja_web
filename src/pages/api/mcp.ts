import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

function jsonRpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id, method, params } = req.body || {};
  if (typeof method !== 'string') return res.status(400).json(jsonRpcError(id, -32600, 'Invalid JSON-RPC request'));

  if (method === 'initialize') {
    return res.status(200).json({ jsonrpc: '2.0', id, result: { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'LoakinAja', version: '1.0.0' } } });
  }
  if (method === 'notifications/initialized' || method === 'notifications/cancelled') return res.status(200).end();
  if (method === 'ping') return res.status(200).json({ jsonrpc: '2.0', id, result: {} });
  if (method === 'tools/list') {
    return res.status(200).json({ jsonrpc: '2.0', id, result: { tools: [
      { name: 'search_products', description: 'Search public active LoakinAja listings by title.', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Product title or keywords.' } }, required: ['query'], additionalProperties: false } },
      { name: 'list_product_categories', description: 'List categories available in the public LoakinAja marketplace.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
    ] } });
  }
  if (method !== 'tools/call') return res.status(200).json(jsonRpcError(id, -32601, `Method not found: ${method}`));

  const toolName = params?.name;
  const args = params?.arguments || {};
  try {
    let content: unknown;
    if (toolName === 'search_products') {
      if (typeof args.query !== 'string' || !args.query.trim()) return res.status(200).json(jsonRpcError(id, -32602, 'query is required'));
      const response = await fetch(`${API_BASE_URL}/listings?q=${encodeURIComponent(args.query.trim())}&limit=10`);
      if (!response.ok) throw new Error(`Listings API returned ${response.status}`);
      const payload = await response.json();
      content = payload.data.map((listing: { id: string; title: string; price: number; category: string; location: string }) => ({ title: listing.title, price: listing.price, currency: 'IDR', category: listing.category, location: listing.location, url: `https://loakinaja.com/product/${listing.id}` }));
    } else if (toolName === 'list_product_categories') {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error(`Categories API returned ${response.status}`);
      const payload = await response.json();
      content = payload.data.map((category: { name: string; slug: string }) => ({ name: category.name, url: `https://loakinaja.com/category/${category.slug}` }));
    } else {
      return res.status(200).json(jsonRpcError(id, -32602, `Unknown tool: ${String(toolName)}`));
    }
    return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(content) }], structuredContent: content, isError: false } });
  } catch (error) {
    return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: (error as Error).message }], isError: true } });
  }
}
