import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCardCatalog } from '@/lib/cards/catalog';
import { compareCards } from '@/lib/cards/compare';
import { BrowseHeader } from '@/components/wiki/BrowseHeader';
import { CompareTool } from '@/components/wiki/CompareTool';

export const revalidate = false;

export const metadata: Metadata = {
  title: 'Compare cards',
  description: 'Compare up to four Star Wars: Armada ships, squadrons or upgrades side by side: points, hull, dice, defense tokens and more.',
  alternates: { canonical: '/compare' },
};

export default async function ComparePage() {
  const cards = compareCards(await getCardCatalog());
  return (
    <div className="wiki-sheet">
      <BrowseHeader title="Compare" description="Pick up to four cards of the same kind to see their stats side by side. The address bar keeps your picks, so you can share them." />
      <Suspense>
        <CompareTool cards={cards} />
      </Suspense>
    </div>
  );
}
