import { getCardCatalog } from '@/lib/cards/catalog';
import { buildSearchIndex } from '@/lib/cards/search';
import { getBooks, getRulebook } from '@/lib/rulebook';

// Built with the card pages and rebuilt when /api/revalidate expires the catalog tag.
export const revalidate = false;

export async function GET() {
  const [catalog, book, guides] = await Promise.all([getCardCatalog(), getRulebook().catch(() => undefined), getBooks().catch(() => [])]);
  const index = buildSearchIndex(catalog, book, guides);
  return Response.json(index, { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' } });
}
