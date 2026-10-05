import { cache } from 'react';
import { fetchCatalogDataset } from '@/lib/cardApi';
import displayNameOverrides from '@/scripts/karm/display-name-overrides.json';
import headerContent from '@/scripts/karm/header-content.json';
import iconMap from '@/scripts/karm/icon-map.json';
import linkAliases from '@/scripts/karm/link-aliases.json';
import { buildCardLinkIndex, buildRulingCards, normalizeRules, type RuleEntry, type RulingCard } from './build';
import { rulingsPageHref } from './pages';

// The JSON files stay under scripts/karm/ because the printable rulings book reads the
// same ones; this keeps the web pages and the book from drifting apart.

// Manifest dataset keys (see the-isb-api catalog.js). /api/revalidate watches these.
export const RULINGS_DATASETS = {
  coreUpgrades: 'upgrades',
  coreSquadrons: 'squadrons',
  coreObjectives: 'objectives',
  communityUpgrades: 'community-upgrades',
  communitySquadrons: 'community-squadrons',
  communityObjectives: 'community-objectives',
  nexusUpgrades: 'nexus-upgrades',
  nexusSquadrons: 'nexus-squadrons',
} as const;

export interface RulingsData {
  cards: RulingCard[];
  linkIndex: ReturnType<typeof buildCardLinkIndex>;
  warnings: string[];
}

/**
 * Every rulings page reads the whole card set (cross-links reach any page), so it is
 * fetched once per render pass and shared via React's request cache.
 */
export const getRulingsData = cache(async (): Promise<RulingsData> => {
  const keys = Object.keys(RULINGS_DATASETS) as Array<keyof typeof RULINGS_DATASETS>;
  const responses = await Promise.all(keys.map((key) => fetchCatalogDataset(RULINGS_DATASETS[key])));
  const payload = Object.fromEntries(keys.map((key, index) => [key, responses[index].data])) as Record<
    keyof typeof RULINGS_DATASETS,
    Record<string, unknown>
  >;
  const warnings = responses.flatMap((response) => (response.warning ? [response.warning] : []));

  const cards = buildRulingCards({
    core: {
      upgrades: payload.coreUpgrades,
      squadrons: payload.coreSquadrons,
      objectives: payload.coreObjectives,
      // The objectives endpoint carries the damage deck alongside the objectives.
      damageCards: payload.coreObjectives,
    },
    community: {
      upgrades: payload.communityUpgrades,
      squadrons: payload.communitySquadrons,
      objectives: payload.communityObjectives,
    },
    nexus: { upgrades: payload.nexusUpgrades, squadrons: payload.nexusSquadrons },
    displayNameOverrides,
  });

  // An empty card set means the API was unreachable. Throwing keeps the previously
  // generated page live rather than publishing an empty one.
  if (cards.length === 0) {
    throw new Error(`Rules & Rulings: the card API returned no cards (${warnings.join('; ') || 'no detail'})`);
  }

  return { cards, linkIndex: buildCardLinkIndex(cards, rulingsPageHref, linkAliases), warnings };
});

export const ICON_MAP: Record<string, string> = iconMap;

export function iconGlyph(token: string): string | undefined {
  const lower = token.toLowerCase();
  return ICON_MAP[lower] ?? ICON_MAP[lower.replace(/-/g, '_')];
}

export interface SectionIntro {
  cardText: string;
  rules: RuleEntry[];
}

export function getSectionIntro(key: string | undefined): SectionIntro | undefined {
  const entry = key ? (headerContent as Record<string, { cardText?: string; rules?: unknown }>)[key] : undefined;
  if (!entry) return undefined;
  return { cardText: entry.cardText ?? '', rules: normalizeRules(entry.rules) };
}
