"use client";

import { use, useMemo } from 'react';
import { useObjectives } from '@/hooks/useCardData';
import { Header } from '@/components/Header';
import { Comments } from '@/components/Comments';
import { OptimizedImage } from '@/components/OptimizedImage';
import { sanitizeImageUrl } from '@/utils/dataFetcher';
import { getSourceBadgeClasses } from '@/utils/diceDisplay';

export default function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { objectives, loading } = useObjectives();

  const objective = useMemo(() => {
    return objectives[id] || null;
  }, [objectives, id]);

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

  if (!objective) {
    return (
      <div className="min-h-screen">
        <Header showBackButton={true} />
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Objective Not Found</h1>
            <p className="text-muted-foreground">
              The requested objective could not be found.
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
            {objective.cardimage && (
              <OptimizedImage
                src={sanitizeImageUrl(objective.cardimage)}
                alt={objective.name}
                width={500}
                height={700}
                className="w-full rounded-lg shadow-lg"
              />
            )}
          </div>

          {/* Right column - Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{objective.name}</h1>
            </div>

            {/* Basic stats */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold capitalize">
                  {objective.type}
                </span>
                {objective.source && (
                  <span className={`px-3 py-1 rounded font-bold ${getSourceBadgeClasses(objective.source)}`}>
                    {objective.source}
                  </span>
                )}
              </div>

              {/* Obstacles */}
              {objective.obstacles && objective.obstacles.length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Obstacles</h3>
                  <div className="flex gap-2 flex-wrap">
                    {objective.obstacles.map((obstacle, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-secondary rounded text-sm capitalize"
                      >
                        {obstacle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Setup */}
              {objective.setup && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Setup</h3>
                  <p className="text-sm whitespace-pre-wrap">{objective.setup}</p>
                </div>
              )}

              {/* Special Rule */}
              {objective.special_rule && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">Special Rule</h3>
                  <p className="text-sm whitespace-pre-wrap">{objective.special_rule}</p>
                </div>
              )}

              {/* End of Round */}
              {objective.end_of_round && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">End of Round</h3>
                  <p className="text-sm whitespace-pre-wrap">{objective.end_of_round}</p>
                </div>
              )}

              {/* End of Game */}
              {objective.end_of_game && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">End of Game</h3>
                  <p className="text-sm whitespace-pre-wrap">{objective.end_of_game}</p>
                </div>
              )}

              {/* Token Information */}
              {(objective.victory_tokens || objective.objective_tokens || objective.command_tokens) && (
                <div className="p-4 border rounded bg-muted/50">
                  <h3 className="font-semibold mb-2">Token Information</h3>
                  <div className="space-y-2 text-sm">
                    {objective.victory_tokens && (
                      <div>
                        <span className="font-semibold">Victory Tokens: </span>
                        {objective.victory_tokens_points && (
                          <span>{objective.victory_tokens_points} points each</span>
                        )}
                      </div>
                    )}
                    {objective.objective_tokens && (
                      <div>
                        <span className="font-semibold">Objective Tokens: </span>
                        {objective.objective_tokens_type && (
                          <span className="capitalize">{objective.objective_tokens_type}</span>
                        )}
                        {objective.objective_tokens_count && (
                          <span> ({objective.objective_tokens_count.join(', ')})</span>
                        )}
                      </div>
                    )}
                    {objective.command_tokens && (
                      <div>
                        <span className="font-semibold">Command Tokens: </span>
                        {objective.command_tokens_type && (
                          <span className="capitalize">{objective.command_tokens_type}</span>
                        )}
                        {objective.command_tokens_value && (
                          <span> ({objective.command_tokens_value})</span>
                        )}
                        {objective.command_tokens_count && (
                          <span> x{objective.command_tokens_count}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Errata */}
              {objective.errata && (
                <div className="p-4 border rounded bg-muted/50">
                  <h3 className="font-semibold mb-2">Errata</h3>
                  <p className="text-sm whitespace-pre-wrap">{objective.errata}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 border-t pt-8">
          <Comments cardType="objective" cardId={id} />
        </div>
      </div>
    </div>
  );
}
