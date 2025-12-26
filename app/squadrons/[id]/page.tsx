"use client";

import { use, useMemo } from 'react';
import { useSquadrons } from '@/hooks/useCardData';
import { Header } from '@/components/Header';
import { Comments } from '@/components/Comments';
import { sanitizeImageUrl } from '@/utils/dataFetcher';
import { formatDice, getSquadronDisplayName, getSourceBadgeClasses, formatFactionName } from '@/utils/diceDisplay';

export default function SquadronDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { squadrons, loading } = useSquadrons();

  const squadron = useMemo(() => {
    return squadrons[id] || null;
  }, [squadrons, id]);

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

  if (!squadron) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Squadron Not Found</h1>
            <p className="text-muted-foreground">
              The requested squadron could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} />

      <div className="max-w-4xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Card image */}
          <div>
            {squadron.cardimage && (
              <img
                src={sanitizeImageUrl(squadron.cardimage)}
                alt={squadron.name}
                className="w-full rounded-lg shadow-lg"
              />
            )}
          </div>

          {/* Right column - Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">
                {getSquadronDisplayName(squadron.name, squadron['ace-name'])}
              </h1>
            </div>

            {/* Basic stats */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold">
                  {squadron.points} Points
                </span>
                {squadron.source && (
                  <span className={`px-3 py-1 rounded font-bold ${getSourceBadgeClasses(squadron.source)}`}>
                    {squadron.source}
                  </span>
                )}
                <span className="px-3 py-1 bg-secondary rounded">
                  {formatFactionName(squadron.faction)}
                </span>
                {squadron.unique && (
                  <span className="px-3 py-1 bg-accent text-accent-foreground rounded">
                    Unique
                  </span>
                )}
              </div>

              {/* Hull and Speed */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded">
                  <p className="text-sm text-muted-foreground">Hull</p>
                  <p className="text-2xl font-bold">{squadron.hull}</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-sm text-muted-foreground">Speed</p>
                  <p className="text-2xl font-bold">{squadron.speed}</p>
                </div>
              </div>

              {/* Defense tokens - only show for unique squadrons */}
              {squadron.unique && squadron.tokens && Object.keys(squadron.tokens).length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Defense Tokens</h3>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(squadron.tokens).map(([token, count]) => (
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

              {/* Armament */}
              {squadron.armament && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Armament</h3>
                  <div className="space-y-2">
                    {squadron.armament['anti-squadron'] && (
                      <div className="flex justify-between">
                        <span>Anti-Squadron:</span>
                        <span className="font-mono">
                          {formatDice(squadron.armament['anti-squadron'])}
                        </span>
                      </div>
                    )}
                    {squadron.armament['anti-ship'] && (
                      <div className="flex justify-between">
                        <span>Anti-Ship:</span>
                        <span className="font-mono">
                          {formatDice(squadron.armament['anti-ship'])}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Abilities/Keywords - only show non-false and non-zero values */}
              {squadron.abilities && Object.keys(squadron.abilities).length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Keywords</h3>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(squadron.abilities)
                      .filter(([_, value]) => {
                        // Hide false boolean values and 0 numeric values
                        if (typeof value === 'boolean') return value === true;
                        if (typeof value === 'number') return value > 0;
                        return true;
                      })
                      .map(([ability, value]) => (
                        <span
                          key={ability}
                          className="px-2 py-1 bg-secondary rounded text-sm capitalize"
                        >
                          {ability.replace('-', ' ')}
                          {typeof value === 'number' ? ` ${value}` : ''}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Text ability */}
              {squadron.ability && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Ability</h3>
                  <p className="text-sm whitespace-pre-wrap">{squadron.ability}</p>
                </div>
              )}

              {/* Rulings */}
              {squadron.rulings && (
                <div className="p-4 border rounded bg-muted/50">
                  <h3 className="font-semibold mb-2">Rulings</h3>
                  <p className="text-sm whitespace-pre-wrap">{squadron.rulings}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 border-t pt-8">
          <Comments cardType="squadron" cardId={id} />
        </div>
      </div>
    </div>
  );
}
