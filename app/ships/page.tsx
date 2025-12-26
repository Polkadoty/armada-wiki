"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useShips } from '@/hooks/useCardData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { getSourceBadgeClasses } from '@/utils/diceDisplay';
import type { Ship, ShipModel } from '@/types/cards';

export default function ShipsPage() {
  const { ships, loading } = useShips();
  const [searchQuery, setSearchQuery] = useState('');
  const [factionFilter, setFactionFilter] = useState<string>('all');

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
    return allShipModels.filter((item) => {
      const matchesSearch = item.model.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        item.chassis.chassis_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFaction =
        factionFilter === 'all' ||
        item.model.faction === factionFilter;

      return matchesSearch && matchesFaction;
    });
  }, [allShipModels, searchQuery, factionFilter]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-16">
            <p className="text-xl">Loading ships...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Ships</h1>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <Input
            type="search"
            placeholder="Search ships..."
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

        {/* Results count */}
        <p className="text-muted-foreground mb-4">
          {filteredShips.length} ship{filteredShips.length !== 1 ? 's' : ''} found
        </p>

        {/* Ship grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShips.map(({ chassis, chassisId, model, modelId }) => (
            <Link
              key={`${chassisId}-${modelId}`}
              href={`/ships/${chassisId}/${modelId}`}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-card block"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{model.name}</h3>
                <span className="text-sm font-bold">{model.points} pts</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {chassis.chassis_name}
              </p>
              <div className="flex gap-2 text-xs flex-wrap">
                {chassis.source && (
                  <span className={`px-2 py-1 rounded font-bold ${getSourceBadgeClasses(chassis.source)}`}>
                    {chassis.source}
                  </span>
                )}
                <span className="px-2 py-1 bg-secondary rounded capitalize">
                  {model.faction}
                </span>
                <span className="px-2 py-1 bg-secondary rounded">
                  {chassis.size}
                </span>
                <span className="px-2 py-1 bg-secondary rounded">
                  Hull: {chassis.hull}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredShips.length === 0 && (
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
