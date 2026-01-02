'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search,
  Anchor,
  Plane,
  Wrench,
  Target,
  ArrowRight,
} from 'lucide-react';
import { fetchCardData } from '@/utils/dataFetcher';
import { formatFactionName, getSourceBadgeClasses, getFactionColorClasses } from '@/utils/diceDisplay';
import type { Ship, ShipModel, Squadron, Upgrade, Objective } from '@/types/cards';

interface SearchResult {
  id: string;
  type: 'ship' | 'squadron' | 'upgrade' | 'objective';
  name: string;
  subtitle?: string;
  faction?: string;
  points?: number;
  source?: string;
  href: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    await fetchCardData();

    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Helper to load and search data
    const searchInStorage = (
      keys: string[],
      type: 'ship' | 'squadron' | 'upgrade' | 'objective'
    ) => {
      keys.forEach((key) => {
        try {
          const data = localStorage.getItem(key);
          if (!data) return;

          const parsed = JSON.parse(data);

          if (type === 'ship' && parsed.ships) {
            Object.entries(parsed.ships as Record<string, Ship>).forEach(
              ([chassisId, chassis]) => {
                Object.entries(chassis.models as Record<string, ShipModel>).forEach(
                  ([modelId, model]) => {
                    if (
                      model.name.toLowerCase().includes(lowerQuery) ||
                      chassis.chassis_name.toLowerCase().includes(lowerQuery)
                    ) {
                      searchResults.push({
                        id: modelId,
                        type: 'ship',
                        name: model.name,
                        subtitle: chassis.chassis_name,
                        faction: model.faction,
                        points: model.points,
                        source: model.source,
                        href: `/ships/${chassisId}/${modelId}`,
                      });
                    }
                  }
                );
              }
            );
          }

          if (type === 'squadron' && parsed.squadrons) {
            Object.entries(parsed.squadrons as Record<string, Squadron>).forEach(
              ([id, squadron]) => {
                const displayName = squadron['ace-name']
                  ? `${squadron['ace-name']} - ${squadron.name}`
                  : squadron.name;
                if (
                  displayName.toLowerCase().includes(lowerQuery) ||
                  squadron.name.toLowerCase().includes(lowerQuery) ||
                  (squadron['ace-name'] &&
                    squadron['ace-name'].toLowerCase().includes(lowerQuery))
                ) {
                  searchResults.push({
                    id,
                    type: 'squadron',
                    name: displayName,
                    faction: squadron.faction,
                    points: squadron.points,
                    source: squadron.source,
                    href: `/squadrons/${id}`,
                  });
                }
              }
            );
          }

          if (type === 'upgrade' && parsed.upgrades) {
            Object.entries(parsed.upgrades as Record<string, Upgrade>).forEach(
              ([id, upgrade]) => {
                if (
                  upgrade.name.toLowerCase().includes(lowerQuery) ||
                  upgrade.ability?.toLowerCase().includes(lowerQuery)
                ) {
                  searchResults.push({
                    id,
                    type: 'upgrade',
                    name: upgrade.name,
                    subtitle: upgrade.type,
                    faction: upgrade.faction[0],
                    points: upgrade.points,
                    source: upgrade.source,
                    href: `/upgrades/${id}`,
                  });
                }
              }
            );
          }

          if (type === 'objective' && parsed.objectives) {
            Object.entries(parsed.objectives as Record<string, Objective>).forEach(
              ([id, objective]) => {
                if (
                  objective.name.toLowerCase().includes(lowerQuery) ||
                  objective.special_rule?.toLowerCase().includes(lowerQuery)
                ) {
                  searchResults.push({
                    id,
                    type: 'objective',
                    name: objective.name,
                    subtitle: objective.type,
                    source: objective.source,
                    href: `/objectives/${id}`,
                  });
                }
              }
            );
          }
        } catch {
          // Ignore errors
        }
      });
    };

    // Search all data sources
    const shipKeys = ['ships', 'legacyShips', 'legacyBetaShips', 'nexusShips', 'arcShips', 'nabooShips'];
    const squadronKeys = ['squadrons', 'legacySquadrons', 'legacyBetaSquadrons', 'nexusSquadrons', 'arcSquadrons', 'nabooSquadrons'];
    const upgradeKeys = ['upgrades', 'legacyUpgrades', 'legacyBetaUpgrades', 'nexusUpgrades', 'arcUpgrades', 'nabooUpgrades', 'legendsUpgrades'];
    const objectiveKeys = ['objectives', 'legacyObjectives', 'legacyBetaObjectives', 'nexusObjectives', 'arcObjectives', 'nabooObjectives'];

    searchInStorage(shipKeys, 'ship');
    searchInStorage(squadronKeys, 'squadron');
    searchInStorage(upgradeKeys, 'upgrade');
    searchInStorage(objectiveKeys, 'objective');

    // Sort and limit results
    const sortedResults = searchResults
      .sort((a, b) => {
        // Exact matches first
        const aExact = a.name.toLowerCase() === lowerQuery;
        const bExact = b.name.toLowerCase() === lowerQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then starts with
        const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Then alphabetically
        return a.name.localeCompare(b.name);
      })
      .slice(0, 20);

    setResults(sortedResults);
    setSelectedIndex(0);
    setIsLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      onOpenChange(false);
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  let flatIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b px-3">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search cards..."
            className="border-0 focus-visible:ring-0 h-12 text-base"
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Searching...
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-2">
              {Object.entries(groupedResults).map(([type, typeResults]) => {
                const Icon = typeIcons[type as keyof typeof typeIcons];
                return (
                  <div key={type}>
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Icon className="w-3 h-3" />
                      {typeLabels[type as keyof typeof typeLabels]}
                    </div>
                    {typeResults.map((result) => {
                      flatIndex++;
                      const isSelected = flatIndex === selectedIndex;
                      const factionColors = result.faction
                        ? getFactionColorClasses(result.faction)
                        : null;

                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            router.push(result.href);
                            onOpenChange(false);
                          }}
                          className={cn(
                            'w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-muted transition-colors',
                            isSelected && 'bg-muted'
                          )}
                        >
                          {factionColors && (
                            <div
                              className={cn(
                                'w-1 h-8 rounded-full',
                                factionColors.bg
                              )}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {result.name}
                              </span>
                              {result.points !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {result.points} pts
                                </span>
                              )}
                            </div>
                            {result.subtitle && (
                              <div className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                          {result.faction && (
                            <span className="text-xs text-muted-foreground">
                              {formatFactionName(result.faction)}
                            </span>
                          )}
                          {result.source && (
                            <Badge
                              className={cn(
                                'text-xs',
                                getSourceBadgeClasses(result.source)
                              )}
                            >
                              {result.source}
                            </Badge>
                          )}
                          <ArrowRight
                            className={cn(
                              'w-4 h-4 text-muted-foreground transition-opacity',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {!query && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Start typing to search across all cards
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-muted px-1.5 py-0.5 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-muted px-1.5 py-0.5 rounded">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-muted px-1.5 py-0.5 rounded">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
