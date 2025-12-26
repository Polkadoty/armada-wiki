"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUpgrades } from '@/hooks/useCardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { getSourceBadgeClasses, formatFactionName } from '@/utils/diceDisplay';

export default function UpgradesPage() {
  const { upgrades, loading } = useUpgrades();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [factionFilter, setFactionFilter] = useState<string>('all');

  const upgradeList = useMemo(() => {
    return Object.entries(upgrades).map(([id, upgrade]) => ({
      id,
      ...upgrade,
    }));
  }, [upgrades]);

  const filteredUpgrades = useMemo(() => {
    return upgradeList.filter((upgrade) => {
      const matchesSearch = upgrade.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === 'all' || upgrade.type === typeFilter;

      const matchesFaction =
        factionFilter === 'all' ||
        upgrade.faction.includes(factionFilter);

      return matchesSearch && matchesType && matchesFaction;
    });
  }, [upgradeList, searchQuery, typeFilter, factionFilter]);

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-16">
            <p className="text-xl">Loading upgrades...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Upgrades</h1>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <Input
            type="search"
            placeholder="Search upgrades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          {/* Faction Filter */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Filter by Faction</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={factionFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFactionFilter('all')}
              >
                All Factions
              </Button>
              {factions.map((faction) => (
                <Button
                  key={faction}
                  variant={factionFilter === faction ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFactionFilter(faction)}
                >
                  {formatFactionName(faction)}
                </Button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Filter by Type</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                All Types
              </Button>
              {upgradeTypes.map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className="capitalize"
                >
                  {type.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">
          {filteredUpgrades.length} upgrade{filteredUpgrades.length !== 1 ? 's' : ''} found
        </p>

        {/* Upgrade grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUpgrades.map((upgrade) => (
            <Link
              key={upgrade.id}
              href={`/upgrades/${upgrade.id}`}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-card block"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{upgrade.name}</h3>
                <span className="text-sm font-bold">{upgrade.points} pts</span>
              </div>
              <div className="flex gap-2 text-xs flex-wrap mb-2">
                {upgrade.source && (
                  <span className={`px-2 py-1 rounded font-bold ${getSourceBadgeClasses(upgrade.source)}`}>
                    {upgrade.source}
                  </span>
                )}
                <span className="px-2 py-1 bg-secondary rounded capitalize">
                  {upgrade.type.replace('-', ' ')}
                </span>
                {upgrade.faction.map((faction, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    {formatFactionName(faction)}
                  </span>
                ))}
                {upgrade.unique && (
                  <span className="px-2 py-1 bg-accent text-accent-foreground rounded">
                    Unique
                  </span>
                )}
                {upgrade.modification && (
                  <span className="px-2 py-1 bg-secondary rounded">
                    Modification
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {upgrade.ability}
              </p>
            </Link>
          ))}
        </div>

        {filteredUpgrades.length === 0 && (
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
