"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useObjectives } from '@/hooks/useCardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';

export default function ObjectivesPage() {
  const { objectives, loading } = useObjectives();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const objectiveList = useMemo(() => {
    return Object.entries(objectives).map(([id, objective]) => ({
      id,
      ...objective,
    }));
  }, [objectives]);

  const filteredObjectives = useMemo(() => {
    return objectiveList.filter((objective) => {
      const matchesSearch = objective.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === 'all' || objective.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [objectiveList, searchQuery, typeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-16">
            <p className="text-xl">Loading objectives...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Objectives</h1>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <Input
            type="search"
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </Button>
            <Button
              variant={typeFilter === 'assault' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('assault')}
            >
              Assault
            </Button>
            <Button
              variant={typeFilter === 'defense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('defense')}
            >
              Defense
            </Button>
            <Button
              variant={typeFilter === 'navigation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('navigation')}
            >
              Navigation
            </Button>
            <Button
              variant={typeFilter === 'special' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('special')}
            >
              Special
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">
          {filteredObjectives.length} objective{filteredObjectives.length !== 1 ? 's' : ''} found
        </p>

        {/* Objective grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObjectives.map((objective) => (
            <Link
              key={objective.id}
              href={`/objectives/${objective.id}`}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-card block"
            >
              <h3 className="font-semibold text-lg mb-2">{objective.name}</h3>
              <div className="flex gap-2 text-xs flex-wrap mb-2">
                {objective.source && (
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded font-bold">
                    {objective.source}
                  </span>
                )}
                <span className="px-2 py-1 bg-secondary rounded capitalize">
                  {objective.type}
                </span>
              </div>
              {objective.special_rule && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {objective.special_rule}
                </p>
              )}
            </Link>
          ))}
        </div>

        {filteredObjectives.length === 0 && (
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
