"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUpgrades } from '@/hooks/useCardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { SkeletonCardGrid } from '@/components/SkeletonCard';
import {
  getSourceBadgeClasses,
  formatFactionName,
  getFactionColorClasses,
} from '@/utils/diceDisplay';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Filter } from 'lucide-react';

type SortOption = 'name' | 'points-asc' | 'points-desc' | 'type';

const SOURCES = ['Core', 'Legacy', 'LegacyBeta', 'Nexus', 'ARC', 'Naboo', 'Legends'] as const;

export default function UpgradesPage() {
  const { upgrades, loading } = useUpgrades();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [factionFilter, setFactionFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();

  const upgradeList = useMemo(() => {
    return Object.entries(upgrades).map(([id, upgrade]) => ({
      id,
      ...upgrade,
    }));
  }, [upgrades]);

  const filteredUpgrades = useMemo(() => {
    const result = upgradeList.filter((upgrade) => {
      const matchesSearch = upgrade.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        upgrade.ability?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === 'all' || upgrade.type === typeFilter;

      const matchesFaction =
        factionFilter === 'all' ||
        upgrade.faction.includes(factionFilter);

      const matchesSource =
        sourceFilter === 'all' || upgrade.source === sourceFilter;

      return matchesSearch && matchesType && matchesFaction && matchesSource;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'points-asc':
          return a.points - b.points;
        case 'points-desc':
          return b.points - a.points;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return result;
  }, [upgradeList, searchQuery, typeFilter, factionFilter, sourceFilter, sortBy]);

  const upgradeTypes = useMemo(() => {
    const types = new Set<string>();
    Object.values(upgrades).forEach(upgrade => types.add(upgrade.type));
    return Array.from(types).sort();
  }, [upgrades]);

  const factions = useMemo(() => {
    const factionSet = new Set<string>();
    Object.values(upgrades).forEach(upgrade => {
      upgrade.faction.forEach(f => factionSet.add(f));
    });
    return Array.from(factionSet).sort();
  }, [upgrades]);

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Upgrades</h1>
          <span className="text-sm text-muted-foreground">
            {loading ? '...' : `${filteredUpgrades.length} upgrades`}
          </span>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="Search upgrades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-background border rounded-md px-3 py-2 text-sm"
              >
                <option value="name">Name</option>
                <option value="points-asc">Points (Low to High)</option>
                <option value="points-desc">Points (High to Low)</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>

          {/* Faction Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Faction
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={factionFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFactionFilter('all')}
              >
                All
              </Button>
              {factions.map((faction) => {
                const colors = getFactionColorClasses(faction);
                return (
                  <Button
                    key={faction}
                    variant={factionFilter === faction ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFactionFilter(faction)}
                    className={cn(
                      factionFilter === faction && colors.bg,
                      factionFilter === faction && 'text-white border-transparent'
                    )}
                  >
                    {formatFactionName(faction)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Type
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                All
              </Button>
              {upgradeTypes.map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className="capitalize"
                >
                  {type.replace(/-/g, ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Source filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Content Pack
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={sourceFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter('all')}
              >
                All
              </Button>
              {SOURCES.map((source) => (
                <Button
                  key={source}
                  variant={sourceFilter === source ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceFilter(source)}
                >
                  {source}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && <SkeletonCardGrid count={9} showImage={false} lines={3} />}

        {/* Upgrade grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUpgrades.map((upgrade) => {
              const primaryFaction = upgrade.faction[0] || 'neutral';
              const factionColors = getFactionColorClasses(primaryFaction);
              return (
                <Link
                  key={upgrade.id}
                  href={`/upgrades/${upgrade.id}`}
                  className={cn(
                    "p-4 border-2 rounded-lg bg-card block card-hover",
                    upgrade.faction.length > 0 ? factionColors.border : 'border-border'
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{upgrade.name}</h3>
                    <span className={cn(
                      "text-sm font-bold px-2 py-0.5 rounded",
                      upgrade.faction.length > 0 ? `${factionColors.bg} ${factionColors.onBg}` : 'bg-secondary'
                    )}>
                      {upgrade.points}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs flex-wrap mb-2">
                    {upgrade.source && (
                      <Badge className={getSourceBadgeClasses(upgrade.source)}>
                        {upgrade.source}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="capitalize">
                      {upgrade.type.replace(/-/g, ' ')}
                    </Badge>
                    {upgrade.faction.slice(0, 2).map((faction, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                      >
                        {formatFactionName(faction)}
                      </Badge>
                    ))}
                    {upgrade.faction.length > 2 && (
                      <Badge variant="outline">
                        +{upgrade.faction.length - 2}
                      </Badge>
                    )}
                    {upgrade.unique && (
                      <Badge variant="default">
                        Unique
                      </Badge>
                    )}
                    {upgrade.modification && (
                      <Badge variant="outline">
                        Mod
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {upgrade.ability}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredUpgrades.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No upgrades found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
