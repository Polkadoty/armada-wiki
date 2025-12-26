"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSquadrons } from '@/hooks/useCardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { getSquadronDisplayName } from '@/utils/diceDisplay';

export default function SquadronsPage() {
  const { squadrons, loading } = useSquadrons();
  const [searchQuery, setSearchQuery] = useState('');
  const [factionFilter, setFactionFilter] = useState<string>('all');

  const squadronList = useMemo(() => {
    return Object.entries(squadrons).map(([id, squadron]) => ({
      id,
      ...squadron,
    }));
  }, [squadrons]);

  const filteredSquadrons = useMemo(() => {
    return squadronList.filter((squadron) => {
      const matchesSearch = squadron.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesFaction =
        factionFilter === 'all' || squadron.faction === factionFilter;

      return matchesSearch && matchesFaction;
    });
  }, [squadronList, searchQuery, factionFilter]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-16">
            <p className="text-xl">Loading squadrons...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Squadrons</h1>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <Input
            type="search"
            placeholder="Search squadrons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={factionFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFactionFilter('all')}
            >
              All
            </Button>
            <Button
              variant={factionFilter === 'rebel' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFactionFilter('rebel')}
            >
              Rebel
            </Button>
            <Button
              variant={factionFilter === 'empire' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFactionFilter('empire')}
            >
              Empire
            </Button>
            <Button
              variant={factionFilter === 'republic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFactionFilter('republic')}
            >
              Republic
            </Button>
            <Button
              variant={factionFilter === 'separatist' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFactionFilter('separatist')}
            >
              Separatist
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">
          {filteredSquadrons.length} squadron{filteredSquadrons.length !== 1 ? 's' : ''} found
        </p>

        {/* Squadron grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSquadrons.map((squadron) => (
            <Link
              key={squadron.id}
              href={`/squadrons/${squadron.id}`}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-card block"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">
                  {getSquadronDisplayName(squadron.name, squadron['ace-name'])}
                </h3>
                <span className="text-sm font-bold">{squadron.points} pts</span>
              </div>
              <div className="flex gap-2 text-xs flex-wrap">
                {squadron.source && (
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded font-bold">
                    {squadron.source}
                  </span>
                )}
                <span className="px-2 py-1 bg-secondary rounded capitalize">
                  {squadron.faction}
                </span>
                <span className="px-2 py-1 bg-secondary rounded">
                  Hull: {squadron.hull}
                </span>
                <span className="px-2 py-1 bg-secondary rounded">
                  Speed: {squadron.speed}
                </span>
                {squadron.unique && (
                  <span className="px-2 py-1 bg-accent text-accent-foreground rounded">
                    Unique
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredSquadrons.length === 0 && (
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
