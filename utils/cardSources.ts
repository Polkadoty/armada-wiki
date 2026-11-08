import type { Ship, ShipModel, Squadron, Upgrade, Objective } from '@/types/cards';

// The wiki covers Core, Community and Nexus content. Community cards are either errata of
// a core card (which they replace) or new cards; Nexus cards are always additions.
export const CONTENT_SOURCES = ['Core', 'Community', 'Nexus'] as const;
export type ContentSource = (typeof CONTENT_SOURCES)[number];

// Caches written by earlier versions of the wiki for sources it no longer offers. They are
// never read, but can be large enough to push localStorage over quota, so they get purged.
const RETIRED_SOURCE_PREFIXES = ['legacy', 'legacyBeta', 'legends', 'arc', 'naboo'];
const CARD_TYPES = ['Ships', 'Squadrons', 'Upgrades', 'Objectives'];

export const RETIRED_STORAGE_KEYS = RETIRED_SOURCE_PREFIXES.flatMap((prefix) =>
  CARD_TYPES.flatMap((type) => [`${prefix}${type}`, `${prefix}${type}_timestamp`])
);

// `admiral-screed-commander-errata-community` -> `admiral-screed-commander`. Mirrors
// `baselineId` in lib/changelog.ts, restricted to the community suffix.
export function communityBaselineId(id: string): string {
  return id.replace(/-community$/, '').replace(/-errata$/, '');
}

// Resolves a card key, following community errata back from the core key they replaced so
// links and favorites saved before the errata keep working.
export function resolveCardKey<T extends { supersedes?: string }>(
  cards: Record<string, T>,
  key: string
): string | undefined {
  if (cards[key]) return key;
  return Object.keys(cards).find((candidate) => cards[candidate].supersedes === key);
}

// Adds community cards to `cards`, replacing the core card each erratum supersedes. Must run
// before Nexus cards are added so only core cards can be superseded.
function overlayCommunity<T extends { source?: string; supersedes?: string }>(
  cards: Record<string, T>,
  community: Record<string, T>,
  coreKey: (id: string) => string,
  communityKey: (id: string) => string
): void {
  Object.entries(community).forEach(([id, card]) => {
    const baselineKey = coreKey(communityBaselineId(id));
    const supersedes = cards[baselineKey] ? baselineKey : undefined;
    if (supersedes) delete cards[supersedes];
    cards[communityKey(id)] = { ...card, source: 'Community', supersedes };
  });
}

const withModelSource = (chassis: Ship, source: ContentSource): Ship => ({
  ...chassis,
  source,
  models: Object.fromEntries(
    Object.entries(chassis.models || {}).map(([id, model]) => [id, { ...model, source }])
  ),
});

type Stored = Record<string, unknown>;
const pick = <T>(data: unknown, field: string): Record<string, T> =>
  ((data as Stored | null)?.[field] as Record<string, T>) || {};

/** Raw API payloads, as `{ ships: {...} }` and so on, for one card type. */
export interface SourcePayloads {
  core?: unknown;
  community?: unknown;
  nexus?: unknown;
}

export function mergeShips({ core, community, nexus }: SourcePayloads): Record<string, Ship> {
  const allShips: Record<string, Ship> = {};

  Object.entries(pick<Ship>(core, 'ships')).forEach(([id, chassis]) => {
    allShips[`core-${id}`] = withModelSource(chassis, 'Core');
  });

  // Community models slot into their core chassis (chassis stats are shared); chassis
  // with no core counterpart are added whole.
  Object.entries(pick<Ship>(community, 'ships')).forEach(([id, chassis]) => {
    const coreChassis = allShips[`core-${id}`];
    if (!coreChassis) {
      allShips[`community-${id}`] = withModelSource(chassis, 'Community');
      return;
    }
    const models: Record<string, ShipModel> = { ...coreChassis.models };
    overlayCommunity(models, chassis.models || {}, (modelId) => modelId, (modelId) => modelId);
    allShips[`core-${id}`] = { ...coreChassis, models };
  });

  Object.entries(pick<Ship>(nexus, 'ships')).forEach(([id, chassis]) => {
    allShips[`nexus-${id}`] = withModelSource(chassis, 'Nexus');
  });

  return allShips;
}

export function mergeSquadrons({ core, community, nexus }: SourcePayloads): Record<string, Squadron> {
  const allSquadrons: Record<string, Squadron> = {};

  Object.entries(pick<Squadron>(core, 'squadrons')).forEach(([id, squad]) => {
    allSquadrons[`core-${id}`] = { ...squad, source: 'Core' };
  });

  overlayCommunity(allSquadrons, pick<Squadron>(community, 'squadrons'), (id) => `core-${id}`, (id) => `community-${id}`);

  Object.entries(pick<Squadron>(nexus, 'squadrons')).forEach(([id, squad]) => {
    allSquadrons[`nexus-${id}`] = { ...squad, source: 'Nexus' };
  });

  return allSquadrons;
}

export function mergeUpgrades({ core, community, nexus }: SourcePayloads): Record<string, Upgrade> {
  const allUpgrades: Record<string, Upgrade> = {};

  Object.entries(pick<Upgrade>(core, 'upgrades')).forEach(([id, upgrade]) => {
    allUpgrades[`core-${id}`] = { ...upgrade, source: 'Core' };
  });

  overlayCommunity(allUpgrades, pick<Upgrade>(community, 'upgrades'), (id) => `core-${id}`, (id) => `community-${id}`);

  Object.entries(pick<Upgrade>(nexus, 'upgrades')).forEach(([id, upgrade]) => {
    allUpgrades[`nexus-${id}`] = { ...upgrade, source: 'Nexus' };
  });

  return allUpgrades;
}

// Objective keys are unprefixed (there is no Nexus objective set to collide with).
export function mergeObjectives({ core, community }: SourcePayloads): Record<string, Objective> {
  const allObjectives: Record<string, Objective> = {};

  Object.entries(pick<Objective>(core, 'objectives')).forEach(([id, objective]) => {
    allObjectives[id] = { ...objective, source: 'Core' };
  });

  overlayCommunity(allObjectives, pick<Objective>(community, 'objectives'), (id) => id, (id) => id);

  return allObjectives;
}

// Browser pages (compare, favorites, search) read the same merge from the localStorage cache.
const readStored = (storageKey: string): unknown => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

export const loadShips = () =>
  mergeShips({ core: readStored('ships'), community: readStored('communityShips'), nexus: readStored('nexusShips') });
export const loadSquadrons = () =>
  mergeSquadrons({ core: readStored('squadrons'), community: readStored('communitySquadrons'), nexus: readStored('nexusSquadrons') });
export const loadUpgrades = () =>
  mergeUpgrades({ core: readStored('upgrades'), community: readStored('communityUpgrades'), nexus: readStored('nexusUpgrades') });
export const loadObjectives = () =>
  mergeObjectives({ core: readStored('objectives'), community: readStored('communityObjectives') });
