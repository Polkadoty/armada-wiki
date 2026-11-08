import { upgradeTypeLabel, UPGRADE_TYPE_ORDER, OBJECTIVE_TYPE_ORDER } from '@/lib/rulings/build';
import { upgradeGroupTitle, upgradeTypeIcons } from '@/lib/rulings/pages';
import { iconGlyph } from '@/lib/rulings/data';
import { formatChassisName } from '@/utils/diceDisplay';
import type { Objective, Ship, ShipModel, Squadron, Upgrade } from '@/types/cards';
import { isHuge, type CardCatalog } from './catalog';
import { cardFace, type CardFace } from './images';

// Plain, serializable summaries of every card, for the browse grids and the sitemap.

export type CardKind = 'ship' | 'squadron' | 'upgrade' | 'objective';

export interface GridEntry {
  key: string;
  kind: CardKind;
  href: string;
  name: string;
  subtitle?: string;
  points?: number;
  source: string;
  face?: CardFace;
  /** Facet id to the values this card matches, such as `{ faction: ['rebel'] }`. */
  facets: Record<string, string[]>;
  /** Lowercased text the search box matches against. */
  search: string;
}

export interface FacetOption {
  value: string;
  label: string;
  /** Armada icon font glyph shown before the label. */
  glyph?: string;
}

export interface Facet {
  id: string;
  label: string;
  options: FacetOption[];
}

export const FACTIONS: Array<{ id: string; label: string; short: string }> = [
  { id: 'rebel', label: 'Rebel Alliance', short: 'Rebel' },
  { id: 'empire', label: 'Galactic Empire', short: 'Empire' },
  { id: 'republic', label: 'Galactic Republic', short: 'Republic' },
  { id: 'separatist', label: 'Separatist Alliance', short: 'Separatist' },
  { id: 'scum', label: 'Scum and Villainy', short: 'Scum' },
  { id: 'new-republic', label: 'New Republic', short: 'New Republic' },
  // Nexus factions
  { id: 'first-order', label: 'First Order', short: 'First Order' },
  { id: 'resistance', label: 'Resistance', short: 'Resistance' },
  { id: 'chiss', label: 'Chiss Ascendancy', short: 'Chiss' },
  { id: 'impwar', label: 'Imperial Warlords', short: 'Imperial Warlords' },
];

export function factionLabel(id: string, short = false): string {
  const faction = FACTIONS.find((entry) => entry.id === id);
  if (!faction) return id ? id[0].toUpperCase() + id.slice(1) : 'Neutral';
  return short ? faction.short : faction.label;
}

const SOURCES: FacetOption[] = [
  { value: 'Core', label: 'Core' },
  { value: 'Community', label: 'Community' },
  { value: 'Nexus', label: 'Nexus' },
];

const SIZE_LABELS: Record<string, string> = { small: 'Small', medium: 'Medium', large: 'Large', huge: 'Huge', '280-huge': 'Huge' };

function present(values: Iterable<string>, order: string[]): string[] {
  const set = new Set(values);
  const rank = (value: string) => (order.includes(value) ? order.indexOf(value) : order.length);
  return [...set].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

function factionFacet(entries: GridEntry[]): Facet {
  const order = FACTIONS.map((faction) => faction.id);
  const values = present(entries.flatMap((entry) => entry.facets.faction ?? []), order);
  return {
    id: 'faction',
    label: 'Faction',
    options: values.map((value) => ({ value, label: factionLabel(value, true), glyph: iconGlyph(value.replace(/-/g, '_')) })),
  };
}

const sourceFacet = (): Facet => ({ id: 'source', label: 'Content', options: SOURCES });

// Some cards publish a single string where most publish a list.
const cleanList = (values?: string[] | string) =>
  (Array.isArray(values) ? values : values ? [values] : []).map((value) => String(value ?? '').trim()).filter(Boolean);

// ── Ships ──

export const shipHref = (chassisKey: string, modelKey: string) => `/ships/${chassisKey}/${modelKey}`;

// Chassis slugs carry their content pack (`mc40a-nexus`) and lowercase class codes (`mc80h`).
export const shipChassisName = (chassis: Ship) =>
  formatChassisName(chassis.chassis_name.replace(/-(nexus|community|errata)$/g, ''))
    .split(' ')
    .map((word) => word.replace(/^([A-Za-z]{1,3})(\d+)([a-z]*)$/, (_, letters: string, digits: string, rest: string) => `${letters.toUpperCase()}${digits}${rest}`))
    .join(' ');

export function shipEntries(catalog: CardCatalog): GridEntry[] {
  return Object.entries(catalog.ships).flatMap(([chassisKey, chassis]) =>
    Object.entries(chassis.models || {}).map(([modelKey, model]): GridEntry => {
      const size = isHuge(chassis.size) ? 'huge' : chassis.size;
      return {
        key: `${chassisKey}/${modelKey}`,
        kind: 'ship',
        href: shipHref(chassisKey, modelKey),
        name: model.name,
        subtitle: shipChassisName(chassis),
        points: model.points,
        source: model.source ?? chassis.source ?? 'Core',
        face: cardFace(model.cardimage, catalog.imageStyles, 'ship'),
        facets: { faction: [model.faction], source: [model.source ?? 'Core'], size: [size] },
        search: [model.name, chassis.chassis_name, ...cleanList(model.traits)].join(' ').toLowerCase(),
      };
    }),
  );
}

export function shipFacets(entries: GridEntry[]): Facet[] {
  const sizes = present(entries.flatMap((entry) => entry.facets.size), ['small', 'medium', 'large', 'huge']);
  return [
    factionFacet(entries),
    { id: 'size', label: 'Size', options: sizes.map((value) => ({ value, label: SIZE_LABELS[value] ?? value })) },
    sourceFacet(),
  ];
}

export interface ShipLookup {
  chassisKey: string;
  chassis: Ship;
  modelKey: string;
  model: ShipModel;
}

// ── Squadrons ──

export const squadronName = (squadron: Squadron) => squadron['ace-name'] || squadron.name;

export function squadronEntries(catalog: CardCatalog): GridEntry[] {
  return Object.entries(catalog.squadrons).map(([key, squadron]): GridEntry => {
    const keywords = Object.entries(squadron.abilities ?? {})
      .filter(([, value]) => value === true || (typeof value === 'number' && value > 0))
      .map(([name]) => name);
    return {
      key,
      kind: 'squadron',
      href: `/squadrons/${key}`,
      name: squadronName(squadron),
      subtitle: squadron['ace-name'] ? squadron.name : undefined,
      points: squadron.points,
      source: squadron.source ?? 'Core',
      face: cardFace(squadron.cardimage, catalog.imageStyles, 'poker'),
      facets: {
        faction: [squadron.faction],
        source: [squadron.source ?? 'Core'],
        kind: [squadron.unique ? 'ace' : 'generic'],
        keyword: keywords,
      },
      search: [squadron.name, squadron['ace-name'], ...keywords].filter(Boolean).join(' ').toLowerCase(),
    };
  });
}

const KEYWORD_ORDER = ['adept', 'ai-antisquadron', 'ai-battery', 'assault', 'bomber', 'cloak', 'counter', 'dodge', 'escort', 'grit', 'heavy', 'intel', 'relay', 'rogue', 'scout', 'screen', 'snipe', 'strategic', 'swarm'];
export const keywordLabel = (keyword: string) =>
  keyword === 'ai-antisquadron' ? 'AI: Anti-squadron' : keyword === 'ai-battery' ? 'AI: Battery' : keyword[0].toUpperCase() + keyword.slice(1);

export function squadronFacets(entries: GridEntry[]): Facet[] {
  const keywords = present(entries.flatMap((entry) => entry.facets.keyword), KEYWORD_ORDER);
  return [
    factionFacet(entries),
    { id: 'kind', label: 'Type', options: [{ value: 'ace', label: 'Aces' }, { value: 'generic', label: 'Generic' }] },
    {
      id: 'keyword',
      label: 'Keyword',
      options: keywords.map((value) => ({ value, label: keywordLabel(value), glyph: iconGlyph(value.startsWith('ai-') ? 'ai' : value) })),
    },
    sourceFacet(),
  ];
}

// ── Upgrades ──

export const upgradeFactions = (upgrade: Upgrade) => cleanList(upgrade.faction);

export function upgradeEntries(catalog: CardCatalog): GridEntry[] {
  return Object.entries(catalog.upgrades).map(([key, upgrade]): GridEntry => {
    const factions = upgradeFactions(upgrade);
    return {
      key,
      kind: 'upgrade',
      href: `/upgrades/${key}`,
      name: upgrade.name,
      subtitle: upgradeTypeLabel(upgrade.type),
      points: upgrade.points,
      source: upgrade.source ?? 'Core',
      face: cardFace(upgrade.cardimage, catalog.imageStyles, 'poker'),
      facets: { type: [upgrade.type], faction: factions.length > 0 ? factions : ['neutral'], source: [upgrade.source ?? 'Core'] },
      search: [upgrade.name, upgradeTypeLabel(upgrade.type), upgrade.ability].join(' ').toLowerCase(),
    };
  });
}

export function upgradeTypeGlyphs(type: string): string[] {
  return upgradeTypeIcons(type).flatMap((icon) => iconGlyph(icon) ?? []);
}

export function upgradeFacets(entries: GridEntry[]): Facet[] {
  const types = present(entries.flatMap((entry) => entry.facets.type), UPGRADE_TYPE_ORDER);
  const faction = factionFacet(entries.filter((entry) => !entry.facets.faction.includes('neutral')));
  return [
    {
      id: 'type',
      label: 'Upgrade type',
      options: types.map((value) => ({ value, label: upgradeGroupTitle(value), glyph: upgradeTypeGlyphs(value).join('') })),
    },
    { ...faction, options: [...faction.options, { value: 'neutral', label: 'Any faction' }] },
    sourceFacet(),
  ];
}

// ── Objectives ──

export const OBJECTIVE_TYPE_LABELS: Record<string, string> = {
  assault: 'Assault',
  defense: 'Defense',
  navigation: 'Navigation',
  skirmish: 'Skirmish',
  campaign: 'Campaign',
};

const OBJECTIVE_GLYPHS: Record<string, string> = { assault: 'assault_obj', defense: 'defense_obj', navigation: 'navigation_obj' };
export const objectiveTypeGlyph = (type: string) => (OBJECTIVE_GLYPHS[type] ? iconGlyph(OBJECTIVE_GLYPHS[type]) : undefined);

export function objectiveEntries(catalog: CardCatalog): GridEntry[] {
  return Object.entries(catalog.objectives).map(([key, objective]: [string, Objective]): GridEntry => ({
    key,
    kind: 'objective',
    href: `/objectives/${key}`,
    name: objective.name,
    subtitle: OBJECTIVE_TYPE_LABELS[objective.type] ?? upgradeTypeLabel(objective.type),
    source: objective.source ?? 'Core',
    face: cardFace(objective.cardimage, catalog.imageStyles, 'poker'),
    facets: { type: [objective.type], source: [objective.source ?? 'Core'] },
    search: [objective.name, objective.type, objective.special_rule].join(' ').toLowerCase(),
  }));
}

export function objectiveFacets(entries: GridEntry[]): Facet[] {
  const types = present(entries.flatMap((entry) => entry.facets.type), OBJECTIVE_TYPE_ORDER);
  return [
    {
      id: 'type',
      label: 'Objective type',
      options: types.map((value) => ({ value, label: OBJECTIVE_TYPE_LABELS[value] ?? value, glyph: objectiveTypeGlyph(value) })),
    },
    sourceFacet(),
  ];
}

export const byName = (a: GridEntry, b: GridEntry) => a.name.localeCompare(b.name) || (a.subtitle ?? '').localeCompare(b.subtitle ?? '');
