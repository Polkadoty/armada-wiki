"use client";

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useShips } from '@/hooks/useCardData';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Comments } from '@/components/Comments';
import { sanitizeImageUrl } from '@/utils/dataFetcher';
import { formatDice } from '@/utils/diceDisplay';

export default function ShipDetailPage({
  params,
}: {
  params: Promise<{ chassisId: string; modelId: string }>;
}) {
  const { chassisId, modelId } = use(params);
  const { ships, loading } = useShips();

  const shipData = useMemo(() => {
    if (!ships[chassisId]) return null;
    return {
      chassis: ships[chassisId],
      model: ships[chassisId].models[modelId],
    };
  }, [ships, chassisId, modelId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-4xl mx-auto p-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!shipData) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Ship Not Found</h1>
            <p className="text-muted-foreground">
              The requested ship could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { chassis, model } = shipData;

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} />

      <div className="max-w-4xl mx-auto p-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Card image */}
          <div>
            {model.cardimage && (
              <img
                src={sanitizeImageUrl(model.cardimage)}
                alt={model.name}
                className="w-full rounded-lg shadow-lg"
              />
            )}
          </div>

          {/* Right column - Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{model.name}</h1>
              <p className="text-xl text-muted-foreground">{chassis.chassis_name}</p>
            </div>

            {/* Basic stats */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold">
                  {model.points} Points
                </span>
                <span className="px-3 py-1 bg-secondary rounded capitalize">
                  {model.faction}
                </span>
                <span className="px-3 py-1 bg-secondary rounded capitalize">
                  {chassis.size}
                </span>
              </div>

              {/* Command values */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border rounded">
                  <p className="text-sm text-muted-foreground">Command</p>
                  <p className="text-2xl font-bold">{model.values.command}</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-sm text-muted-foreground">Squadron</p>
                  <p className="text-2xl font-bold">{model.values.squadron}</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-sm text-muted-foreground">Engineering</p>
                  <p className="text-2xl font-bold">{model.values.engineer}</p>
                </div>
              </div>

              {/* Hull and shields */}
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">Defenses</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Hull:</span>
                    <span className="ml-2 font-bold">{chassis.hull}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Front Shields:</span>
                    <span className="ml-2 font-bold">{chassis.shields.front}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Rear Shields:</span>
                    <span className="ml-2 font-bold">{chassis.shields.rear}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Side Shields:</span>
                    <span className="ml-2 font-bold">
                      {chassis.shields.left}/{chassis.shields.right}
                    </span>
                  </div>
                </div>
              </div>

              {/* Defense tokens */}
              {model.tokens && Object.keys(model.tokens).length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Defense Tokens</h3>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(model.tokens).map(([token, count]) => (
                      <span
                        key={token}
                        className="px-2 py-1 bg-secondary rounded text-sm"
                      >
                        {token.replace('def_', '')}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upgrade slots */}
              {model.upgrades && model.upgrades.length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Upgrade Slots</h3>
                  <div className="flex gap-2 flex-wrap">
                    {model.upgrades.map((upgrade, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary rounded text-sm capitalize"
                      >
                        {upgrade.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Armament */}
              {model.armament && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Armament</h3>
                  <div className="space-y-2">
                    {Object.entries(model.armament).map(([arc, dice]) => (
                      <div key={arc} className="flex justify-between">
                        <span className="capitalize">{arc}:</span>
                        <span className="font-mono">
                          {formatDice(dice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 border-t pt-8">
          <Comments cardType="ship" cardId={`${chassisId}-${modelId}`} />
        </div>
      </div>
    </div>
  );
}
