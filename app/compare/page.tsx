'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useShips, useSquadrons, useUpgrades } from '@/hooks/useCardData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GitCompare, Plus, X, Anchor, Plane, Wrench } from 'lucide-react';
import {
  formatFactionName,
  getFactionColorClasses,
  formatDice,
  getSourceBadgeClasses,
} from '@/utils/diceDisplay';
import type { ShipModel, Squadron, Upgrade } from '@/types/cards';

type CompareType = 'ship' | 'squadron' | 'upgrade';

interface CompareItem {
  id: string;
  name: string;
  data: ShipModel | Squadron | Upgrade;
}

export default function ComparePage() {
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();
  const { ships, loading: loadingShips } = useShips();
  const { squadrons, loading: loadingSquadrons } = useSquadrons();
  const { upgrades, loading: loadingUpgrades } = useUpgrades();

  const [compareType, setCompareType] = useState<CompareType>('ship');
  const [selectedItems, setSelectedItems] = useState<CompareItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loading = loadingShips || loadingSquadrons || loadingUpgrades;

  // Get available items for the selected type
  const availableItems = useMemo(() => {
    const items: CompareItem[] = [];

    if (compareType === 'ship') {
      Object.entries(ships).forEach(([, chassis]) => {
        Object.entries(chassis.models).forEach(([modelId, model]) => {
          items.push({
            id: modelId,
            name: model.name,
            data: model,
          });
        });
      });
    } else if (compareType === 'squadron') {
      Object.entries(squadrons).forEach(([id, squadron]) => {
        items.push({
          id,
          name: squadron['ace-name'] ? `${squadron['ace-name']} - ${squadron.name}` : squadron.name,
          data: squadron,
        });
      });
    } else if (compareType === 'upgrade') {
      Object.entries(upgrades).forEach(([id, upgrade]) => {
        items.push({
          id,
          name: upgrade.name,
          data: upgrade,
        });
      });
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [ships, squadrons, upgrades, compareType]);

  // Filter by search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return availableItems.slice(0, 20);
    return availableItems
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 20);
  }, [availableItems, searchQuery]);

  const addItem = (item: CompareItem) => {
    if (selectedItems.length < 4 && !selectedItems.some((s) => s.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
      setSearchQuery('');
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setSelectedItems([]);
    setSearchQuery('');
  };

  const changeType = (type: CompareType) => {
    setCompareType(type);
    setSelectedItems([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <GitCompare className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Compare Cards</h1>
            <p className="text-muted-foreground">Select up to 4 cards to compare side-by-side</p>
          </div>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={compareType === 'ship' ? 'default' : 'outline'}
            onClick={() => changeType('ship')}
          >
            <Anchor className="w-4 h-4 mr-2" />
            Ships
          </Button>
          <Button
            variant={compareType === 'squadron' ? 'default' : 'outline'}
            onClick={() => changeType('squadron')}
          >
            <Plane className="w-4 h-4 mr-2" />
            Squadrons
          </Button>
          <Button
            variant={compareType === 'upgrade' ? 'default' : 'outline'}
            onClick={() => changeType('upgrade')}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Upgrades
          </Button>
        </div>

        {/* Search and add */}
        {selectedItems.length < 4 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder={`Search ${compareType}s to add...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              />
              {searchQuery && filteredItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg max-h-60 overflow-y-auto z-10">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItems.some((s) => s.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => addItem(item)}
                        disabled={isSelected}
                        className={cn(
                          'w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm',
                          isSelected && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                          {!isSelected && <Plus className="w-4 h-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected items header */}
        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Comparing {selectedItems.length} {compareType}
              {selectedItems.length !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        )}

        {/* Comparison grid */}
        {selectedItems.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <GitCompare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No cards selected</h2>
            <p className="text-muted-foreground">
              Search for {compareType}s above to add them to comparison
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div
              className={cn(
                'grid gap-4 min-w-[600px]',
                selectedItems.length === 1 && 'grid-cols-1 max-w-md',
                selectedItems.length === 2 && 'grid-cols-2',
                selectedItems.length === 3 && 'grid-cols-3',
                selectedItems.length === 4 && 'grid-cols-4'
              )}
            >
              {selectedItems.map((item) => {
                const factionColors =
                  'faction' in item.data
                    ? getFactionColorClasses(
                        Array.isArray((item.data as Upgrade).faction)
                          ? (item.data as Upgrade).faction[0]
                          : (item.data as ShipModel | Squadron).faction
                      )
                    : null;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'border-2 rounded-lg p-4',
                      factionColors?.border || 'border-border'
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        {'faction' in item.data && (
                          <span className="text-sm text-muted-foreground">
                            {Array.isArray((item.data as Upgrade).faction)
                              ? (item.data as Upgrade).faction.map(formatFactionName).join(', ')
                              : formatFactionName((item.data as ShipModel | Squadron).faction)}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Points */}
                    {'points' in item.data && (
                      <div className="mb-3">
                        <Badge
                          className={cn(
                            'text-white',
                            factionColors?.bg || 'bg-primary'
                          )}
                        >
                          {item.data.points} pts
                        </Badge>
                      </div>
                    )}

                    {/* Ship-specific stats */}
                    {compareType === 'ship' && (
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="font-bold">{(item.data as ShipModel).values.command}</div>
                            <div className="text-xs text-muted-foreground">CMD</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="font-bold">{(item.data as ShipModel).values.squadron}</div>
                            <div className="text-xs text-muted-foreground">SQD</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="font-bold">{(item.data as ShipModel).values.engineer}</div>
                            <div className="text-xs text-muted-foreground">ENG</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Squadron-specific stats */}
                    {compareType === 'squadron' && (
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="font-bold">{(item.data as Squadron).hull}</div>
                            <div className="text-xs text-muted-foreground">Hull</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="font-bold">{(item.data as Squadron).speed}</div>
                            <div className="text-xs text-muted-foreground">Speed</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Anti-Squad:</span>
                            <span>{formatDice((item.data as Squadron).armament['anti-squadron'])}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Anti-Ship:</span>
                            <span>{formatDice((item.data as Squadron).armament['anti-ship'])}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upgrade-specific info */}
                    {compareType === 'upgrade' && (
                      <div className="space-y-2 text-sm">
                        <Badge variant="secondary" className="capitalize">
                          {(item.data as Upgrade).type.replace(/-/g, ' ')}
                        </Badge>
                        {(item.data as Upgrade).unique && (
                          <Badge variant="outline" className="ml-1">Unique</Badge>
                        )}
                        {(item.data as Upgrade).modification && (
                          <Badge variant="outline" className="ml-1">Mod</Badge>
                        )}
                        <p className="text-muted-foreground text-xs mt-2 line-clamp-4">
                          {(item.data as Upgrade).ability}
                        </p>
                      </div>
                    )}

                    {/* Source */}
                    {'source' in item.data && item.data.source && (
                      <div className="mt-3">
                        <Badge className={cn('text-xs', getSourceBadgeClasses(item.data.source))}>
                          {item.data.source}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading card data...
          </div>
        )}
      </div>
    </div>
  );
}
