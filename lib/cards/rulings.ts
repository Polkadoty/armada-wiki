import { cache } from 'react';
import { getRulingsData } from '@/lib/rulings/data';
import { normalizeRules, type RuleEntry, type RulingCard } from '@/lib/rulings/build';
import { rulingsPageHref } from '@/lib/rulings/pages';

// Ties a wiki card to its rulings entry. That entry carries the rulings a
// Community erratum inherits from its core card, so it is preferred over the rules
// published on the card itself.

const rulingsIndex = cache(async () => {
  const { cards, linkIndex } = await getRulingsData();
  return { byKey: new Map(cards.map((card) => [`${card.source}:${card.key}`, card])), linkIndex };
});

export interface CardRulings {
  cardText: string;
  rules: RuleEntry[];
  /** Link to the card's entry in the rulings pages, when it has one. */
  rulingsHref?: string;
  /** Key of the rulings entry, so card text never links to its own card. */
  selfKey?: string;
  linkIndex: Awaited<ReturnType<typeof getRulingsData>>['linkIndex'];
}

/** `source` is the wiki's Core / Community / Nexus label; `apiKey` is the key the API publishes. */
export async function cardRulings(
  source: string | undefined,
  apiKey: string,
  fallback: { cardText?: string; rules?: unknown; rulings?: unknown },
): Promise<CardRulings> {
  const { byKey, linkIndex } = await rulingsIndex().catch(() => ({ byKey: new Map<string, RulingCard>(), linkIndex: new Map() }));
  const entry = byKey.get(`${(source ?? 'Core').toLowerCase()}:${apiKey}`);
  if (entry) {
    return {
      cardText: entry.cardText || fallback.cardText || '',
      rules: entry.rules,
      rulingsHref: `${rulingsPageHref(entry)}#${entry.anchorId}`,
      selfKey: entry.key,
      linkIndex,
    };
  }
  return { cardText: fallback.cardText ?? '', rules: normalizeRules(fallback.rules, fallback.rulings), linkIndex };
}

/** The API key behind a wiki key: `core-x` and `community-x` become `x`. Objective keys are unprefixed. */
export function apiKeyOf(wikiKey: string): string {
  return wikiKey.replace(/^(core|community|nexus)-/, '');
}
