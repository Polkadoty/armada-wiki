import type { Metadata } from 'next';
import { BrowseHeader } from '@/components/wiki/BrowseHeader';
import { FavoritesList } from '@/components/wiki/FavoritesList';

export const metadata: Metadata = {
  title: 'Favorites',
  description: 'Cards you saved on the Armada Wiki.',
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="wiki-sheet">
      <BrowseHeader title="Favorites" description="Cards you saved with the heart on a card page. Only this browser keeps the list." />
      <FavoritesList />
    </div>
  );
}
