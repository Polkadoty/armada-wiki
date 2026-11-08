import { cache } from 'react';
import { asObject, CARD_CATALOG_TAG, fetchCatalogDataset } from '@/lib/cardApi';
import { mergeObjectives, mergeShips, mergeSquadrons, mergeUpgrades } from '@/utils/cardSources';
import type { Objective, Ship, Squadron, Upgrade } from '@/types/cards';

// Server-side card catalog for the browse and detail pages. It is the same Core +
// Community + Nexus merge the browser pages read from localStorage (utils/cardSources),
// fetched through the card API's cached manifest so pages rebuild only when
// /api/revalidate sees the data change.

export const CARD_DATASETS = [
  'ships', 'community-ships', 'nexus-ships',
  'squadrons', 'community-squadrons', 'nexus-squadrons',
  'upgrades', 'community-upgrades', 'nexus-upgrades',
  'objectives', 'community-objectives',
] as const;

export interface CardCatalog {
  ships: Record<string, Ship>;
  squadrons: Record<string, Squadron>;
  upgrades: Record<string, Upgrade>;
  objectives: Record<string, Objective>;
  imageStyles: CardImageStyles;
}

export const getCardCatalog = cache(async (): Promise<CardCatalog> => {
  const [responses, imageStyles] = await Promise.all([
    Promise.all(CARD_DATASETS.map((key) => fetchCatalogDataset(key))),
    getCardImageStyles(),
  ]);
  const data = Object.fromEntries(CARD_DATASETS.map((key, index) => [key, responses[index].data]));

  const catalog: CardCatalog = {
    ships: withoutPlaceholders(mergeShips({ core: data.ships, community: data['community-ships'], nexus: data['nexus-ships'] })),
    squadrons: withoutSandbox(mergeSquadrons({ core: data.squadrons, community: data['community-squadrons'], nexus: data['nexus-squadrons'] })),
    upgrades: mergeUpgrades({ core: data.upgrades, community: data['community-upgrades'], nexus: data['nexus-upgrades'] }),
    objectives: mergeObjectives({ core: data.objectives, community: data['community-objectives'] }),
    imageStyles,
  };

  // An empty catalog means the API was unreachable. Throwing keeps the previously
  // generated pages live rather than publishing empty ones.
  if (Object.keys(catalog.ships).length === 0 || Object.keys(catalog.upgrades).length === 0) {
    const warnings = responses.flatMap((response) => (response.warning ? [response.warning] : []));
    throw new Error(`Card wiki: the card API returned no cards (${warnings.join('; ') || 'no detail'})`);
  }
  return catalog;
});

// Star Forge's `sandbox` dummy ships stand in for upgrade slots while building a fleet.
// They are not cards, so the wiki leaves them out.
function withoutPlaceholders(ships: Record<string, Ship>): Record<string, Ship> {
  const kept: Record<string, Ship> = {};
  for (const [key, chassis] of Object.entries(ships)) {
    const models = Object.fromEntries(Object.entries(chassis.models ?? {}).filter(([, model]) => model.faction !== 'sandbox'));
    if (Object.keys(models).length > 0) kept[key] = { ...chassis, models };
  }
  return kept;
}

function withoutSandbox<T extends { faction?: string | string[] }>(cards: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(cards).filter(([, card]) => ![card.faction].flat().includes('sandbox')));
}

/** `280-huge` and `wide-huge` are both huge ships, on different base sizes. */
export const isHuge = (size: string | undefined) => /huge/.test(size ?? '');

// ── New card designs ──

export type NewCardKind = 'ship' | 'huge' | 'squadron' | 'upgrade' | 'objective' | 'damage';

export interface CardImageStyle {
  filename: string;
  kind: NewCardKind;
  version: string;
}

/** Original image file name (`name.webp`) to its redesigned version. */
export type CardImageStyles = Record<string, CardImageStyle>;

const KINDS = new Set<NewCardKind>(['ship', 'huge', 'squadron', 'upgrade', 'objective', 'damage']);

/**
 * The card API's manifest of redesigned card faces (the same one Star Forge reads). It is
 * published separately from the card data, so it refreshes daily rather than with the
 * catalog tag. A missing or malformed manifest just means the original images are used.
 */
async function getCardImageStyles(): Promise<CardImageStyles> {
  const hosts = [process.env.NEXT_PUBLIC_PRIMARY_API_URL || 'https://api.swarmada.wiki', process.env.NEXT_PUBLIC_BACKUP_API_URL || 'https://api-backup.swarmada.wiki'];
  for (const host of hosts) {
    try {
      const response = await fetch(`${host.replace(/\/$/, '')}/card-image-styles.json`, {
        next: { revalidate: 86_400, tags: [CARD_CATALOG_TAG] },
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) continue;
      const manifest = asObject(await response.json());
      if (manifest.schemaVersion !== 1) return {};
      const styles: CardImageStyles = {};
      for (const [name, value] of Object.entries(asObject(manifest.entries))) {
        const row = asObject(value);
        if (
          /^[a-z0-9][a-z0-9._-]*\.webp$/i.test(name) &&
          row.filename === `new-${name}` &&
          KINDS.has(row.kind as NewCardKind) &&
          typeof row.version === 'string' && /^[a-f0-9]{12}$/.test(row.version)
        ) {
          styles[name] = { filename: row.filename, kind: row.kind as NewCardKind, version: row.version };
        }
      }
      return styles;
    } catch {
      // Try the backup host, then fall back to the original images.
    }
  }
  return {};
}
