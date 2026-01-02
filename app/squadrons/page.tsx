"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSquadrons } from '@/hooks/useCardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { SkeletonCardGrid } from '@/components/SkeletonCard';
import {
  getSquadronDisplayName,
  getSourceBadgeClasses,
  STANDARD_FACTIONS,
  formatFactionName,
  getFactionColorClasses,
} from '@/utils/diceDisplay';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Filter } from 'lucide-react';

type SortOption = 'name' | 'points-asc' | 'points-desc' | 'faction' | 'hull';

const SOURCES = ['Core', 'Legacy', 'LegacyBeta', 'Nexus', 'ARC', 'Naboo'] as const;

export default function SquadronsPage() {
  const { squadrons, loading } = useSquadrons();
  const [searchQuery, setSearchQuery] = useState('');
  const [factionFilter, setFactionFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [uniqueFilter, setUniqueFilter] = useState<'all' | 'unique' | 'generic'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();

  const squadronList = useMemo(() => {
    return Object.entries(squadrons).map(([id, squadron]) => ({
      id,
      ...squadron,
    }));
  }, [squadrons]);

  const filteredSquadrons = useMemo(() => {
    let result = squadronList.filter((squadron) => {
      const displayName = getSquadronDisplayName(squadron.name, squadron['ace-name']);
      const matchesSearch = displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        squadron.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFaction =
        factionFilter === 'all' || squadron.faction === factionFilter;

      const matchesSource =
        sourceFilter === 'all' || squadron.source === sourceFilter;

      const matchesUnique =
        uniqueFilter === 'all' ||
        (uniqueFilter === 'unique' && squadron.unique) ||
        (uniqueFilter === 'generic' && !squadron.unique);

      return matchesSearch && matchesFaction && matchesSource && matchesUnique;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return getSquadronDisplayName(a.name, a['ace-name']).localeCompare(
            getSquadronDisplayName(b.name, b['ace-name'])
          );
        case 'points-asc':
          return a.points - b.points;
        case 'points-desc':
          return b.points - a.points;
        case 'faction':
          return a.faction.localeCompare(b.faction);
        case 'hull':
          return b.hull - a.hull;
        default:
          return 0;
      }
    });

    return result;
  }, [squadronList, searchQuery, factionFilter, sourceFilter, uniqueFilter, sortBy]);

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Squadrons</h1>
          <span className="text-sm text-muted-foreground">
            {loading ? '...' : `${filteredSquadrons.length} squadrons`}
          </span>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="Search squadrons..."
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
                <option value="hull">Hull</option>
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

          {/* Unique/Generic filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={uniqueFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUniqueFilter('all')}
            >
              All
            </Button>
            <Button
              variant={uniqueFilter === 'unique' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUniqueFilter('unique')}
            >
              Aces Only
            </Button>
            <Button
              variant={uniqueFilter === 'generic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUniqueFilter('generic')}
            >
              Generic Only
            </Button>
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

        {/* Squadron grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSquadrons.map((squadron) => {
              const factionColors = getFactionColorClasses(squadron.faction);
              return (
                <Link
                  key={squadron.id}
                  href={`/squadrons/${squadron.id}`}
                  className={cn(
                    "p-4 border-2 rounded-lg bg-card block card-hover",
                    factionColors.border
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">
                      {getSquadronDisplayName(squadron.name, squadron['ace-name'])}
                    </h3>
                    <span className={cn(
                      "text-sm font-bold px-2 py-0.5 rounded text-white",
                      factionColors.bg
                    )}>
                      {squadron.points}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs flex-wrap">
                    {squadron.source && (
                      <Badge className={getSourceBadgeClasses(squadron.source)}>
                        {squadron.source}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {formatFactionName(squadron.faction)}
                    </Badge>
                    <Badge variant="outline">
                      Hull {squadron.hull}
                    </Badge>
                    <Badge variant="outline">
                      Speed {squadron.speed}
                    </Badge>
                    {squadron.unique && (
                      <Badge variant="default">
                        Ace
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredSquadrons.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No squadrons found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
