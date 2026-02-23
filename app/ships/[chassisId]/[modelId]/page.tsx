"use client";

import { use, useMemo } from 'react';
import { useShips } from '@/hooks/useCardData';
import { Header } from '@/components/Header';
import { Comments } from '@/components/Comments';
import { OptimizedImage } from '@/components/OptimizedImage';
import { sanitizeImageUrl } from '@/utils/dataFetcher';
import { formatDice, formatFactionName } from '@/utils/diceDisplay';
import { cn } from '@/lib/utils';

export default function ShipDetailPage({
  params,
}: {
  params: Promise<{ chassisId: string; modelId: string }>;
}) {
  const { chassisId, modelId } = use(params);
  const { ships, loading } = useShips();

  const shipData = useMemo(() => {
    if (!ships[chassisId] || !ships[chassisId].models?.[modelId]) return null;
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
    <div className="min-h-screen relative overflow-hidden">
      <Header showBackButton={true} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-12 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-16 -right-16 h-72 w-72 rounded-full bg-[hsl(var(--faction-empire)/0.15)] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto p-4 md:p-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Card image */}
          <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-4 lg:sticky lg:top-24 h-fit">
            {model.cardimage && (
              <OptimizedImage
                src={sanitizeImageUrl(model.cardimage)}
                alt={model.name}
                width={500}
                height={700}
                className="w-full rounded-xl shadow-2xl shadow-black/25"
              />
            )}
          </div>

          {/* Right column - Details */}
          <div>
            <div className="mb-6 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-5">
              <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">{model.name}</h1>
              <p className="text-xl text-muted-foreground">{chassis.chassis_name}</p>
            </div>

            {/* Basic stats */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold">
                  {model.points} Points
                </span>
                <span className="px-3 py-1 bg-secondary rounded">
                  {formatFactionName(model.faction)}
                </span>
                <span className="px-3 py-1 bg-secondary rounded capitalize">
                  {chassis.size}
                </span>
              </div>

              {/* Command values */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border border-border/70 bg-card/70 rounded-xl">
                  <p className="text-sm text-muted-foreground">Command</p>
                  <p className="text-2xl font-bold">{model.values.command}</p>
                </div>
                <div className="p-3 border border-border/70 bg-card/70 rounded-xl">
                  <p className="text-sm text-muted-foreground">Squadron</p>
                  <p className="text-2xl font-bold">{model.values.squadron}</p>
                </div>
                <div className="p-3 border border-border/70 bg-card/70 rounded-xl">
                  <p className="text-sm text-muted-foreground">Engineering</p>
                  <p className="text-2xl font-bold">{model.values.engineer}</p>
                </div>
              </div>

              {/* Hull and shields */}
              <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
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
                <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
                  <h3 className="font-semibold mb-2">Defense Tokens</h3>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(model.tokens).map(([token, count]) => (
                      <span
                        key={token}
                        className={cn("px-2 py-1 bg-secondary rounded text-sm", !count && "opacity-60")}
                      >
                        {token.replace('def_', '')}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upgrade slots */}
              {model.upgrades && model.upgrades.length > 0 && (
                <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
                  <h3 className="font-semibold mb-2">Upgrade Slots</h3>
                  <div className="flex gap-2 flex-wrap">
                    {model.upgrades.map((upgrade, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary rounded text-sm capitalize"
                      >
                        {upgrade.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Armament */}
              {model.armament && (
                <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
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
        <div className="mt-12 border-t border-border/70 pt-8">
          <Comments cardType="ship" cardId={`${chassisId}-${modelId}`} />
        </div>
      </div>
    </div>
  );
}
