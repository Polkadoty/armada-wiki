"use client";

import { use, useMemo } from 'react';
import { useUpgrades } from '@/hooks/useCardData';
import { Header } from '@/components/Header';
import { Comments } from '@/components/Comments';
import { OptimizedImage } from '@/components/OptimizedImage';
import { sanitizeImageUrl } from '@/utils/dataFetcher';
import { getSourceBadgeClasses, formatFactionName } from '@/utils/diceDisplay';
const normalizeType = (value: unknown): string => (typeof value === 'string' && value.trim() ? value : 'unknown');

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
    <div className="min-h-screen relative overflow-hidden">
      <Header showBackButton={true} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-12 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 -right-20 h-72 w-72 rounded-full bg-[hsl(var(--faction-republic)/0.16)] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Card image */}
          <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-4 lg:sticky lg:top-24 h-fit">
            {upgrade.cardimage && (
              <OptimizedImage
                src={sanitizeImageUrl(upgrade.cardimage)}
                alt={upgrade.name}
                width={500}
                height={700}
                className="w-full rounded-xl shadow-2xl shadow-black/25"
              />
            )}
          </div>

          {/* Right column - Details */}
          <div>
            <div className="mb-6 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-5">
              <h1 className="text-4xl font-bold mb-2">{upgrade.name}</h1>
            </div>

            {/* Basic stats */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold">
                  {upgrade.points} Points
                </span>
                {upgrade.source && (
                  <span className={`px-3 py-1 rounded font-bold ${getSourceBadgeClasses(upgrade.source)}`}>
                    {upgrade.source}
                  </span>
                )}
                <span className="px-3 py-1 bg-secondary rounded capitalize">
                  {normalizeType(upgrade.type).replace(/-/g, ' ')}
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
                <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
                  <h3 className="font-semibold mb-2">Faction</h3>
                  <div className="flex gap-2 flex-wrap">
                    {upgrade.faction.map((faction, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-secondary rounded text-sm"
                      >
                        {formatFactionName(faction)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ability */}
              {upgrade.ability && (
                <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
                  <h3 className="font-semibold mb-2">Ability</h3>
                  <p className="text-sm whitespace-pre-wrap">{upgrade.ability}</p>
                </div>
              )}

              {/* Bound ship type */}
              {upgrade.bound_shiptype && (
                <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
                  <h3 className="font-semibold mb-2">Bound Ship Type</h3>
                  <p className="text-sm capitalize">{upgrade.bound_shiptype}</p>
                </div>
              )}

              {/* Restrictions */}
              {upgrade.restrictions && Object.keys(upgrade.restrictions).length > 0 && (
                <div className="p-4 border border-border/70 bg-muted/40 rounded-xl">
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
                <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
                  <h3 className="font-semibold mb-2">Start of Round</h3>
                  <div className="text-sm space-y-1">
                    <p className="capitalize">{normalizeType(upgrade.start_command.type).replace(/-/g, ' ')}</p>
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
                <div className="p-4 border border-border/70 bg-card/70 rounded-xl">
                  <h3 className="font-semibold mb-2">Exhaust</h3>
                  <div className="text-sm space-y-1">
                    <p className="capitalize">{normalizeType(upgrade.exhaust.type).replace(/-/g, ' ')}</p>
                    {upgrade.exhaust.ready_token && (
                      <p>Ready Tokens: {upgrade.exhaust.ready_token.join(', ')}</p>
                    )}
                    {upgrade.exhaust.ready_amount && (
                      <p>Ready Amount: {upgrade.exhaust.ready_amount}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Rulings - Structured rules with source and date */}
              {upgrade.rules && upgrade.rules.length > 0 && (
                <div className="p-4 border border-border/70 bg-muted/40 rounded-xl">
                  <h3 className="font-semibold mb-3">Rulings</h3>
                  <div className="space-y-3">
                    {upgrade.rules.map((rule, index) => (
                      <div key={index} className={`text-sm ${rule.defunct ? 'opacity-60' : ''}`}>
                        <div className="flex gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                            {rule.source}
                          </span>
                          <span className="px-2 py-0.5 bg-secondary rounded text-xs">
                            {rule.date}
                          </span>
                          {rule.version && (
                            <span className="px-2 py-0.5 bg-secondary rounded text-xs">
                              {rule.version}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-accent/50 rounded text-xs capitalize">
                            {normalizeType(rule.type).replace(/_/g, ' ')}
                          </span>
                          {rule.defunct && (
                            <span className="px-2 py-0.5 bg-destructive/15 text-destructive rounded text-xs font-medium">
                              Defunct
                            </span>
                          )}
                        </div>
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${rule.defunct ? 'line-through decoration-muted-foreground/50' : ''}`}>
                          {rule.text}
                        </p>
                        {rule.defunct && rule.explanation && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {rule.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Rulings - Plain text fallback */}
              {!upgrade.rules && upgrade.rulings && (
                <div className="p-4 border border-border/70 bg-muted/40 rounded-xl">
                  <h3 className="font-semibold mb-2">Rulings</h3>
                  <p className="text-sm whitespace-pre-wrap">{upgrade.rulings}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 border-t border-border/70 pt-8">
          <Comments cardType="upgrade" cardId={id} />
        </div>
      </div>
    </div>
  );
}
