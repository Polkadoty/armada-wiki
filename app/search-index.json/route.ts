import { getCardCatalog } from '@/lib/cards/catalog';
import { buildSearchIndex } from '@/lib/cards/search';

// Built with the card pages and rebuilt when /api/revalidate expires the catalog tag.
export const revalidate = false;

export async function GET() {
  const index = buildSearchIndex(await getCardCatalog());
  return Response.json(index, { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' } });
}
