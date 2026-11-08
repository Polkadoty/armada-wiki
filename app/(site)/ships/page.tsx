import type { Metadata } from 'next';
import { getCardCatalog } from '@/lib/cards/catalog';
import { shipEntries, shipFacets } from '@/lib/cards/entries';
import { BrowseGrid } from '@/components/wiki/BrowseGrid';
import { BrowseHeader } from '@/components/wiki/BrowseHeader';

export const revalidate = false;

export const metadata: Metadata = {
  title: 'Ships',
  description: 'Every Star Wars: Armada ship card with points, stats and card art, from the core game, the Armada Community errata and Nexus.',
  alternates: { canonical: '/ships' },
};

export default async function ShipsPage() {
  const entries = shipEntries(await getCardCatalog());
  return (
    <div className="wiki-sheet">
      <BrowseHeader title="Ships" description="Ship cards for every faction, grouped by faction. Pick a ship for its full stats and upgrade slots." />
      <BrowseGrid entries={entries} facets={shipFacets(entries)} groupBy="faction" noun={{ one: 'ship', many: 'ships' }} layout="ship" />
    </div>
  );
}
