"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useShips } from '@/hooks/useCardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { SkeletonCardGrid } from '@/components/SkeletonCard';
import {
  getSourceBadgeClasses,
  STANDARD_FACTIONS,
  formatFactionName,
  getFactionColorClasses,
} from '@/utils/diceDisplay';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Filter } from 'lucide-react';
import type { Ship, ShipModel } from '@/types/cards';

type SortOption = 'name' | 'points-asc' | 'points-desc' | 'faction';

const SOURCES = ['Core', 'Legacy', 'LegacyBeta', 'Nexus', 'ARC', 'Naboo'] as const;

export default function ShipsPage() {
  const { ships, loading } = useShips();
  const [searchQuery, setSearchQuery] = useState('');
  const [factionFilter, setFactionFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();

  // Flatten ships into models with chassis info
  const allShipModels = useMemo(() => {
    const models: Array<{
      chassis: Ship;
      chassisId: string;
      model: ShipModel;
      modelId: string;
    }> = [];

    Object.entries(ships).forEach(([chassisId, chassis]) => {
      Object.entries(chassis.models).forEach(([modelId, model]) => {
        models.push({ chassis, chassisId, model, modelId });
      });
    });

    return models;
  }, [ships]);

  // Filter and search
  const filteredShips = useMemo(() => {
    const result = allShipModels.filter((item) => {
      const matchesSearch = item.model.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        item.chassis.chassis_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFaction =
        factionFilter === 'all' ||
        item.model.faction === factionFilter;

      const matchesSource =
        sourceFilter === 'all' ||
        item.chassis.source === sourceFilter;

      return matchesSearch && matchesFaction && matchesSource;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.model.name.localeCompare(b.model.name);
        case 'points-asc':
          return a.model.points - b.model.points;
        case 'points-desc':
          return b.model.points - a.model.points;
        case 'faction':
          return a.model.faction.localeCompare(b.model.faction);
        default:
          return 0;
      }
    });

    return result;
  }, [allShipModels, searchQuery, factionFilter, sourceFilter, sortBy]);

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Ships</h1>
          <span className="text-sm text-muted-foreground">
            {loading ? '...' : `${filteredShips.length} ships`}
          </span>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="Search ships..."
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
                <option value="faction">Faction</option>
              </select>
            </div>
          </div>

          {/* Faction filter */}
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
              {STANDARD_FACTIONS.map((faction) => {
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

        {/* Ship grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShips.map(({ chassis, chassisId, model, modelId }) => {
              const factionColors = getFactionColorClasses(model.faction);
              return (
                <Link
                  key={`${chassisId}-${modelId}`}
                  href={`/ships/${chassisId}/${modelId}`}
                  className={cn(
                    "p-4 border-2 rounded-lg bg-card block card-hover",
                    factionColors.border
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{model.name}</h3>
                    <span className={cn(
                      "text-sm font-bold px-2 py-0.5 rounded",
                      factionColors.bg,
                      factionColors.onBg
                    )}>
                      {model.points}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {chassis.chassis_name}
                  </p>
                  <div className="flex gap-2 text-xs flex-wrap">
                    {chassis.source && (
                      <Badge className={getSourceBadgeClasses(chassis.source)}>
                        {chassis.source}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {formatFactionName(model.faction)}
                    </Badge>
                    <Badge variant="outline">
                      {chassis.size}
                    </Badge>
                    <Badge variant="outline">
                      Hull {chassis.hull}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredShips.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No ships found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
