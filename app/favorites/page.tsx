'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useFavorites, Favorite } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Heart, Trash2, Anchor, Plane, Wrench, Target } from 'lucide-react';
import { formatFactionName, getFactionColorClasses } from '@/utils/diceDisplay';

const typeIcons = {
  ship: Anchor,
  squadron: Plane,
  upgrade: Wrench,
  objective: Target,
};

const typeLabels = {
  ship: 'Ships',
  squadron: 'Squadrons',
  upgrade: 'Upgrades',
  objective: 'Objectives',
};

export default function FavoritesPage() {
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();
  const { favorites, isLoaded, removeFavorite, clearFavorites } = useFavorites();

  // Group favorites by type
  const groupedFavorites = favorites.reduce((acc, favorite) => {
    if (!acc[favorite.type]) {
      acc[favorite.type] = [];
    }
    acc[favorite.type].push(favorite);
    return acc;
  }, {} as Record<Favorite['type'], Favorite[]>);

  // Sort each group by name
  Object.values(groupedFavorites).forEach((group) => {
    group.sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
              <Heart className="w-8 h-8 text-faction-rebel" />
              Favorites
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLoaded ? `${favorites.length} saved cards` : 'Loading...'}
            </p>
          </div>
          {favorites.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Clear all favorites?')) {
                  clearFavorites();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {!isLoaded && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        )}

        {isLoaded && favorites.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Click the heart icon on any card to add it to your favorites.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/ships">
                <Button variant="outline">Browse Ships</Button>
              </Link>
              <Link href="/squadrons">
                <Button variant="outline">Browse Squadrons</Button>
              </Link>
            </div>
          </div>
        )}

        {isLoaded && favorites.length > 0 && (
          <div className="space-y-8">
            {(['ship', 'squadron', 'upgrade', 'objective'] as const).map((type) => {
              const typeFavorites = groupedFavorites[type];
              if (!typeFavorites || typeFavorites.length === 0) return null;

              const Icon = typeIcons[type];

              return (
                <section key={type}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {typeLabels[type]}
                    <Badge variant="secondary" className="ml-2">
                      {typeFavorites.length}
                    </Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {typeFavorites.map((favorite) => {
                      const factionColors = favorite.faction
                        ? getFactionColorClasses(favorite.faction)
                        : null;

                      return (
                        <Link
                          key={`${favorite.type}-${favorite.id}`}
                          href={favorite.href}
                          className={cn(
                            'flex items-center justify-between p-3 border-2 rounded-lg bg-card hover:shadow-md transition-shadow group',
                            factionColors?.border || 'border-border'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {factionColors && (
                              <div
                                className={cn(
                                  'w-1.5 h-8 rounded-full flex-shrink-0',
                                  factionColors.bg
                                )}
                              />
                            )}
                            <div className="min-w-0">
                              <div className="font-medium truncate">{favorite.name}</div>
                              {favorite.faction && (
                                <div className="text-xs text-muted-foreground">
                                  {formatFactionName(favorite.faction)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {favorite.points !== undefined && (
                              <Badge variant="outline">{favorite.points} pts</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeFavorite(favorite.id, favorite.type);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
