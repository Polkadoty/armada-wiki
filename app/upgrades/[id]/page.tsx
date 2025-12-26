"use client";

import { use, useMemo } from 'react';
import { useUpgrades } from '@/hooks/useCardData';
import { Header } from '@/components/Header';
import { Comments } from '@/components/Comments';
import { sanitizeImageUrl } from '@/utils/dataFetcher';

export default function UpgradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { upgrades, loading } = useUpgrades();

  const upgrade = useMemo(() => {
    return upgrades[id] || null;
  }, [upgrades, id]);

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

  if (!upgrade) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Upgrade Not Found</h1>
            <p className="text-muted-foreground">
              The requested upgrade could not be found.
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
            {upgrade.cardimage && (
              <img
                src={sanitizeImageUrl(upgrade.cardimage)}
                alt={upgrade.name}
                className="w-full rounded-lg shadow-lg"
              />
            )}
          </div>

          {/* Right column - Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{upgrade.name}</h1>
            </div>

            {/* Basic stats */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold">
                  {upgrade.points} Points
                </span>
                {upgrade.source && (
                  <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-bold">
                    {upgrade.source}
                  </span>
                )}
                <span className="px-3 py-1 bg-secondary rounded capitalize">
                  {upgrade.type.replace('-', ' ')}
                </span>
                {upgrade.unique && (
                  <span className="px-3 py-1 bg-accent text-accent-foreground rounded">
                    Unique
                  </span>
                )}
                {upgrade.modification && (
                  <span className="px-3 py-1 bg-secondary rounded">
                    Modification
                  </span>
                )}
              </div>

              {/* Faction */}
              {upgrade.faction && upgrade.faction.length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Faction</h3>
                  <div className="flex gap-2 flex-wrap">
                    {upgrade.faction.map((faction, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-secondary rounded text-sm capitalize"
                      >
                        {faction}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ability */}
              {upgrade.ability && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Ability</h3>
                  <p className="text-sm whitespace-pre-wrap">{upgrade.ability}</p>
                </div>
              )}

              {/* Bound ship type */}
              {upgrade.bound_shiptype && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Bound Ship Type</h3>
                  <p className="text-sm capitalize">{upgrade.bound_shiptype}</p>
                </div>
              )}

              {/* Restrictions */}
              {upgrade.restrictions && Object.keys(upgrade.restrictions).length > 0 && (
                <div className="p-4 border rounded bg-muted/50">
                  <h3 className="font-semibold mb-2">Restrictions</h3>
                  <div className="space-y-2 text-sm">
                    {upgrade.restrictions.traits && (
                      <div>
                        <span className="font-semibold">Traits: </span>
                        <span>{upgrade.restrictions.traits.join(', ')}</span>
                      </div>
                    )}
                    {upgrade.restrictions.size && (
                      <div>
                        <span className="font-semibold">Size: </span>
                        <span className="capitalize">
                          {upgrade.restrictions.size.join(', ')}
                        </span>
                      </div>
                    )}
                    {upgrade.restrictions.flagship && (
                      <div>
                        <span className="font-semibold">Flagship only</span>
                      </div>
                    )}
                    {upgrade.restrictions.disqual_upgrades && (
                      <div>
                        <span className="font-semibold">Disqualifies: </span>
                        <span className="capitalize">
                          {upgrade.restrictions.disqual_upgrades.join(', ').replace(/-/g, ' ')}
                        </span>
                      </div>
                    )}
                    {upgrade.restrictions.disable_upgrades && (
                      <div>
                        <span className="font-semibold">Disables: </span>
                        <span className="capitalize">
                          {upgrade.restrictions.disable_upgrades.join(', ').replace(/-/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Start command */}
              {upgrade.start_command && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Start of Round</h3>
                  <div className="text-sm space-y-1">
                    <p className="capitalize">{upgrade.start_command.type.replace('-', ' ')}</p>
                    {upgrade.start_command.start_icon && (
                      <p>Icons: {upgrade.start_command.start_icon.join(', ')}</p>
                    )}
                    {upgrade.start_command.start_amount && (
                      <p>Amount: {upgrade.start_command.start_amount}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Exhaust */}
              {upgrade.exhaust && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Exhaust</h3>
                  <div className="text-sm space-y-1">
                    <p className="capitalize">{upgrade.exhaust.type.replace('-', ' ')}</p>
                    {upgrade.exhaust.ready_token && (
                      <p>Ready Tokens: {upgrade.exhaust.ready_token.join(', ')}</p>
                    )}
                    {upgrade.exhaust.ready_amount && (
                      <p>Ready Amount: {upgrade.exhaust.ready_amount}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Rulings */}
              {upgrade.rulings && (
                <div className="p-4 border rounded bg-muted/50">
                  <h3 className="font-semibold mb-2">Rulings</h3>
                  <p className="text-sm whitespace-pre-wrap">{upgrade.rulings}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 border-t pt-8">
          <Comments cardType="upgrade" cardId={id} />
        </div>
      </div>
    </div>
  );
}
