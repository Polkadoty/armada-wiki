'use client';

/* eslint-disable @next/next/no-img-element -- card faces come from the card API's image hosts */
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Heart, X } from 'lucide-react';
import { useFavorites, type Favorite } from '@/hooks/useFavorites';
import type { SearchRow } from '@/lib/cards/search';
import { loadSearchIndex } from '@/components/site/SiteSearch';

const GROUPS: Array<{ type: Favorite['type']; label: string }> = [
  { type: 'ship', label: 'Ships' },
  { type: 'squadron', label: 'Squadrons' },
  { type: 'upgrade', label: 'Upgrades' },
  { type: 'objective', label: 'Objectives' },
];

export function FavoritesList() {
  const { favorites, isLoaded, removeFavorite, clearFavorites } = useFavorites();
  const [rows, setRows] = useState<Map<string, SearchRow>>(new Map());

  // The saved entry holds a name and link; the search index adds the current card face.
  useEffect(() => {
    if (favorites.length === 0) return;
    loadSearchIndex().then((index) => setRows(new Map(index.map((row) => [row.h, row]))), () => {});
  }, [favorites.length]);

  const groups = useMemo(
    () => GROUPS.map((group) => ({ ...group, items: favorites.filter((favorite) => favorite.type === group.type).sort((a, b) => a.name.localeCompare(b.name)) })).filter((group) => group.items.length > 0),
    [favorites],
  );

  if (!isLoaded) return null;
  if (favorites.length === 0) {
    return (
      <div className="py-16 text-center text-rulebook-muted">
        <Heart className="mx-auto size-8 text-rulebook-accent/50" aria-hidden />
        <p className="mt-3">No favorites yet. Open any card and use the heart to save it here.</p>
        <Link href="/ships" className="mt-4 inline-block text-rulebook-accent hover:underline">Browse ships</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Remove all favorites from this browser?')) clearFavorites();
          }}
          className="text-sm text-rulebook-muted hover:text-rulebook-accent hover:underline"
        >
          Clear all
        </button>
      </div>
      {groups.map((group) => (
        <section key={group.type} className="mt-6">
          <h2 className="wiki-group-title">{group.label}<span className="ml-1 font-body text-sm font-normal normal-case tracking-normal text-rulebook-muted">{group.items.length}</span></h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {group.items.map((favorite) => {
              const row = rows.get(favorite.href);
              return (
                <li key={`${favorite.type}:${favorite.id}`} className="relative">
                  <Link href={favorite.href} className="group block">
                    {row?.i ? (
                      <img src={row.i} alt={favorite.name} loading="lazy" className="wiki-card-face h-auto w-full transition-transform group-hover:-translate-y-1" />
                    ) : (
                      <div className="wiki-card-face aspect-[5/7]" />
                    )}
                    <div className="mt-2 flex items-baseline gap-2 px-0.5">
                      <span className="min-w-0 flex-1 truncate text-[15px] font-bold group-hover:text-rulebook-accent">{favorite.name}</span>
                      {favorite.points !== undefined && <span className="text-sm tabular-nums text-rulebook-muted">{row?.p ?? favorite.points}</span>}
                    </div>
                    {row?.s && <div className="truncate px-0.5 text-[13px] text-rulebook-muted">{row.s}</div>}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFavorite(favorite.id, favorite.type)}
                    aria-label={`Remove ${favorite.name} from favorites`}
                    className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-rulebook-sheet/90 text-rulebook-muted shadow hover:text-rulebook-accent"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
