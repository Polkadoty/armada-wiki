import type { Metadata } from 'next';
import { getCardCatalog } from '@/lib/cards/catalog';
import { squadronEntries, squadronFacets } from '@/lib/cards/entries';
import { BrowseGrid } from '@/components/wiki/BrowseGrid';
import { BrowseHeader } from '@/components/wiki/BrowseHeader';

export const revalidate = false;

export const metadata: Metadata = {
  title: 'Squadrons',
  description: 'Every Star Wars: Armada squadron card, aces and generics, with points, keywords and rulings.',
  alternates: { canonical: '/squadrons' },
};

export default async function SquadronsPage() {
  const entries = squadronEntries(await getCardCatalog());
  return (
    <div className="wiki-sheet">
      <BrowseHeader title="Squadrons" description="Aces and generic squadrons, grouped by faction. Filter by keyword to list every BOMBER or ESCORT." />
      <BrowseGrid entries={entries} facets={squadronFacets(entries)} groupBy="faction" noun={{ one: 'squadron', many: 'squadrons' }} layout="poker" />
    </div>
  );
}
