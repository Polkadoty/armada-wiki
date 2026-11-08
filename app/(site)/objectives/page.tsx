import type { Metadata } from 'next';
import { getCardCatalog } from '@/lib/cards/catalog';
import { objectiveEntries, objectiveFacets } from '@/lib/cards/entries';
import { BrowseGrid } from '@/components/wiki/BrowseGrid';
import { BrowseHeader } from '@/components/wiki/BrowseHeader';

export const revalidate = false;

export const metadata: Metadata = {
  title: 'Objectives',
  description: 'Every Star Wars: Armada objective card: assault, defense, navigation, skirmish and campaign, with setup, special rules and rulings.',
  alternates: { canonical: '/objectives' },
};

export default async function ObjectivesPage() {
  const entries = objectiveEntries(await getCardCatalog());
  return (
    <div className="wiki-sheet">
      <BrowseHeader title="Objectives" description="Objective cards grouped by type, with their setup, special rules and scoring." />
      <BrowseGrid entries={entries} facets={objectiveFacets(entries)} groupBy="type" noun={{ one: 'objective', many: 'objectives' }} layout="poker" />
    </div>
  );
}
