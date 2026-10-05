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

const readStored = <T>(storageKey: string, field: string): Record<string, T> => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return (data?.[field] as Record<string, T>) || {};
  } catch {
    return {};
  }
};

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

export function loadShips(): Record<string, Ship> {
  const allShips: Record<string, Ship> = {};

  Object.entries(readStored<Ship>('ships', 'ships')).forEach(([id, chassis]) => {
    allShips[`core-${id}`] = withModelSource(chassis, 'Core');
  });

  // Community models slot into their core chassis (chassis stats are shared); chassis
  // with no core counterpart are added whole.
  Object.entries(readStored<Ship>('communityShips', 'ships')).forEach(([id, chassis]) => {
    const coreChassis = allShips[`core-${id}`];
    if (!coreChassis) {
      allShips[`community-${id}`] = withModelSource(chassis, 'Community');
      return;
    }
    const models: Record<string, ShipModel> = { ...coreChassis.models };
    overlayCommunity(models, chassis.models || {}, (modelId) => modelId, (modelId) => modelId);
    allShips[`core-${id}`] = { ...coreChassis, models };
  });

  Object.entries(readStored<Ship>('nexusShips', 'ships')).forEach(([id, chassis]) => {
    allShips[`nexus-${id}`] = withModelSource(chassis, 'Nexus');
  });

  return allShips;
}

export function loadSquadrons(): Record<string, Squadron> {
  const allSquadrons: Record<string, Squadron> = {};

  Object.entries(readStored<Squadron>('squadrons', 'squadrons')).forEach(([id, squad]) => {
    allSquadrons[`core-${id}`] = { ...squad, source: 'Core' };
  });

  overlayCommunity(
    allSquadrons,
    readStored<Squadron>('communitySquadrons', 'squadrons'),
    (id) => `core-${id}`,
    (id) => `community-${id}`
  );

  Object.entries(readStored<Squadron>('nexusSquadrons', 'squadrons')).forEach(([id, squad]) => {
    allSquadrons[`nexus-${id}`] = { ...squad, source: 'Nexus' };
  });

  return allSquadrons;
}

export function loadUpgrades(): Record<string, Upgrade> {
  const allUpgrades: Record<string, Upgrade> = {};

  Object.entries(readStored<Upgrade>('upgrades', 'upgrades')).forEach(([id, upgrade]) => {
    allUpgrades[`core-${id}`] = { ...upgrade, source: 'Core' };
  });

  overlayCommunity(
    allUpgrades,
    readStored<Upgrade>('communityUpgrades', 'upgrades'),
    (id) => `core-${id}`,
    (id) => `community-${id}`
  );

  Object.entries(readStored<Upgrade>('nexusUpgrades', 'upgrades')).forEach(([id, upgrade]) => {
    allUpgrades[`nexus-${id}`] = { ...upgrade, source: 'Nexus' };
  });

  return allUpgrades;
}

// Objective keys are unprefixed (there is no Nexus objective set to collide with).
export function loadObjectives(): Record<string, Objective> {
  const allObjectives: Record<string, Objective> = {};

  Object.entries(readStored<Objective>('objectives', 'objectives')).forEach(([id, objective]) => {
    allObjectives[id] = { ...objective, source: 'Core' };
  });

  overlayCommunity(
    allObjectives,
    readStored<Objective>('communityObjectives', 'objectives'),
    (id) => id,
    (id) => id
  );

  return allObjectives;
}
