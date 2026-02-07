"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useObjectives } from '@/hooks/useCardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { SkeletonCardGrid } from '@/components/SkeletonCard';
import { getSourceBadgeClasses } from '@/utils/diceDisplay';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Filter } from 'lucide-react';

type SortOption = 'name' | 'type';

const OBJECTIVE_TYPES = ['assault', 'defense', 'navigation', 'special'] as const;
const SOURCES = ['Core', 'Legacy', 'LegacyBeta', 'Nexus', 'ARC', 'Naboo'] as const;

const typeColors: Record<string, string> = {
  assault: 'border-red-500',
  defense: 'border-blue-500',
  navigation: 'border-yellow-500',
  special: 'border-purple-500',
};

const typeBgColors: Record<string, string> = {
  assault: 'bg-red-500',
  defense: 'bg-blue-500',
  navigation: 'bg-yellow-500',
  special: 'bg-purple-500',
};

export default function ObjectivesPage() {
  const { objectives, loading } = useObjectives();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();

  const objectiveList = useMemo(() => {
    return Object.entries(objectives).map(([id, objective]) => ({
      id,
      ...objective,
    }));
  }, [objectives]);

  const filteredObjectives = useMemo(() => {
    const result = objectiveList.filter((objective) => {
      const matchesSearch = objective.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        objective.special_rule?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === 'all' || objective.type === typeFilter;

      const matchesSource =
        sourceFilter === 'all' || objective.source === sourceFilter;

      return matchesSearch && matchesType && matchesSource;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return result;
  }, [objectiveList, searchQuery, typeFilter, sourceFilter, sortBy]);

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Objectives</h1>
          <span className="text-sm text-muted-foreground">
            {loading ? '...' : `${filteredObjectives.length} objectives`}
          </span>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="Search objectives..."
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
                <option value="type">Type</option>
              </select>
            </div>
          </div>

          {/* Type filter */}
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
              {OBJECTIVE_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "capitalize",
                    typeFilter === type && typeBgColors[type],
                    typeFilter === type && 'text-white border-transparent'
                  )}
                >
                  {type}
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

        {/* Objective grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredObjectives.map((objective) => (
              <Link
                key={objective.id}
                href={`/objectives/${objective.id}`}
                className={cn(
                  "p-4 border-2 rounded-lg bg-card block card-hover",
                  typeColors[objective.type] || 'border-border'
                )}
              >
                <h3 className="font-semibold text-lg mb-2">{objective.name}</h3>
                <div className="flex gap-2 text-xs flex-wrap mb-2">
                  {objective.source && (
                    <Badge className={getSourceBadgeClasses(objective.source)}>
                      {objective.source}
                    </Badge>
                  )}
                  <Badge
                    className={cn(
                      "capitalize text-white",
                      typeBgColors[objective.type]
                    )}
                  >
                    {objective.type}
                  </Badge>
                </div>
                {objective.special_rule && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {objective.special_rule}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredObjectives.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No objectives found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
