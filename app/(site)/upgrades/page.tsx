import type { Metadata } from 'next';
import { getCardCatalog } from '@/lib/cards/catalog';
import { upgradeEntries, upgradeFacets } from '@/lib/cards/entries';
import { BrowseGrid } from '@/components/wiki/BrowseGrid';
import { BrowseHeader } from '@/components/wiki/BrowseHeader';

export const revalidate = false;

export const metadata: Metadata = {
  title: 'Upgrades',
  description: 'Every Star Wars: Armada upgrade card, from commanders and officers to titles and turbolasers, with points and rulings.',
  alternates: { canonical: '/upgrades' },
};

export default async function UpgradesPage() {
  const entries = upgradeEntries(await getCardCatalog());
  return (
    <div className="wiki-sheet">
      <BrowseHeader title="Upgrades" description="Upgrade cards grouped by slot, in the order the Armada Reference Manual uses." />
      <BrowseGrid entries={entries} facets={upgradeFacets(entries)} groupBy="type" noun={{ one: 'upgrade', many: 'upgrades' }} layout="poker" />
    </div>
  );
}
