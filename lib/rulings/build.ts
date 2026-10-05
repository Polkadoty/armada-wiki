// Turns raw card API payloads into the Rules & Rulings model. Pure and synchronous, so
// it can be exercised directly by `node --test` — keep imports in this file type-only.
//
// Ported from scripts/karm/generate-karm-rulings-book.mjs (which still renders the
// printable book), with two deliberate changes for the web:
//   - Content is Core + Community + Nexus. A Community card replaces the core card it
//     errata's, rather than appearing beside it.
//   - Cards are deduplicated by API key, not by name, so same-named cards of different
//     types (Leia Organa commander vs. officer, Vader's TIE Advanced vs. TIE Defender)
//     are all kept.

export type JsonObject = Record<string, unknown>;

export type RulingSource = 'core' | 'community' | 'nexus';

export type RulingCategory =
  | 'objectives'
  | 'damage-cards'
  | 'upgrades'
  | 'nexus-upgrades'
  | 'ace-squadrons'
  | 'nexus-ace-squadrons';

export const RULE_SECTION_LABELS = {
  card_text: 'Card Text',
  timing: 'Timing',
  clarifications: 'Clarifications',
  upgrade_interactions: 'Upgrade Interactions',
  squadron_interactions: 'Squadron Interactions',
  objective_interactions: 'Objective Interactions',
  counter_and_salvo_interactions: 'Counter and Salvo Interactions',
  damage_card_interactions: 'Damage Card Interactions',
  obstacle_interactions: 'Obstacle Interactions',
  deployment_interactions: 'Deployment Interactions',
  play_area_interactions: 'Play Area Interactions',
  campaign_interactions: 'Campaign Interactions',
} as const;

export type RuleSectionKey = keyof typeof RULE_SECTION_LABELS;

const SECTION_ORDER = Object.keys(RULE_SECTION_LABELS) as RuleSectionKey[];

const RULE_SECTION_ALIASES: Record<string, RuleSectionKey> = {
  clarification: 'clarifications',
  clarifications: 'clarifications',
  rulings: 'clarifications',
  ruling: 'clarifications',
  timing: 'timing',
  upgrade: 'upgrade_interactions',
  upgrades: 'upgrade_interactions',
  upgrade_interaction: 'upgrade_interactions',
  squadron: 'squadron_interactions',
  squadrons: 'squadron_interactions',
  squadron_interaction: 'squadron_interactions',
  objective: 'objective_interactions',
  objectives: 'objective_interactions',
  objective_interaction: 'objective_interactions',
  counter: 'counter_and_salvo_interactions',
  salvo: 'counter_and_salvo_interactions',
  counter_and_salvo: 'counter_and_salvo_interactions',
  counter_salvo: 'counter_and_salvo_interactions',
  damage: 'damage_card_interactions',
  damage_card: 'damage_card_interactions',
  damage_card_interaction: 'damage_card_interactions',
  obstacle: 'obstacle_interactions',
  obstacles: 'obstacle_interactions',
  deployment: 'deployment_interactions',
  play_area: 'play_area_interactions',
  play_area_interaction: 'play_area_interactions',
  campaign: 'campaign_interactions',
  card_text: 'card_text',
};

// `weapons-team-offensive-retro` is presented as "Boarding Teams" and leads the list,
// matching the Armada Reference Manual's ordering.
export const UPGRADE_TYPE_ORDER = [
  'weapons-team-offensive-retro',
  'commander',
  'officer',
  'weapons-team',
  'offensive-retro',
  'defensive-retro',
  'turbolaser',
  'ion-cannon',
  'ordnance',
  'fleet-support',
  'support-team',
  'experimental-retro',
  'fleet-command',
  'title',
  'super-weapon',
  'leader',
];

export const OBJECTIVE_TYPE_ORDER = ['assault', 'defense', 'navigation', 'skirmish', 'campaign'];

export const FACTION_ORDER = ['empire', 'rebel', 'republic', 'separatist', 'scum', 'new-republic', 'neutral'];

const FACTION_TAG_MAP: Record<string, string> = {
  nr: 'new-republic',
  scum: 'scum',
  rebel: 'rebel',
  empire: 'empire',
  republic: 'republic',
  separatist: 'separatist',
};

export interface RuleEntry {
  section: RuleSectionKey;
  text: string;
  source: string;
  date: string;
  version: string;
  defunct: boolean;
  explanation: string;
}

export interface RulingCard {
  /** API key of the card as published; for a Community erratum, the community key. */
  key: string;
  /** Key of the core card this one stands for (the card's own key if it has none). */
  baseKey: string;
  anchorId: string;
  category: RulingCategory;
  source: RulingSource;
  name: string;
  image: string;
  factions: string[];
  primaryFaction: string;
  /** Faction icons are shown beside the name; Hondo Ohnaka is deliberately unaligned. */
  showFactionIcons: boolean;
  cardText: string;
  points?: number;
  keywords: string[];
  upgradeType?: string;
  objectiveType?: string;
  rules: RuleEntry[];
}

export interface RulingsDataInput {
  core: { upgrades: JsonObject; squadrons: JsonObject; objectives: JsonObject; damageCards: JsonObject };
  community: { upgrades: JsonObject; squadrons: JsonObject; objectives: JsonObject };
  nexus: { upgrades: JsonObject; squadrons: JsonObject };
  displayNameOverrides?: Record<string, string>;
}

// ── Small value helpers ──

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : {};
}

function decodeEscapedSequences(value: string): string {
  return value.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

function stringValue(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return decodeEscapedSequences(value).trim() || fallback;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'entry';
}

export function normalizeUpgradeType(type: unknown): string {
  return String(type || '').toLowerCase().replace(/\s+/g, '-').trim() || 'unknown';
}

export function normalizeFaction(faction: unknown): string {
  return String(faction || 'neutral').toLowerCase();
}

function stripFactionTags(name: string): { cleanName: string; derivedFactions: string[] } {
  const derivedFactions: string[] = [];
  const cleanName = name
    .replace(/\s*\{([^}]+)\}/g, (_match, tag: string) => {
      for (const part of tag.toLowerCase().split('/')) {
        const mapped = FACTION_TAG_MAP[part.trim()];
        if (mapped) derivedFactions.push(mapped);
      }
      return '';
    })
    .trim();
  return { cleanName, derivedFactions };
}

/** `admiral-screed-commander-errata-community` → `admiral-screed-commander`. */
export function baselineKey(key: string): string {
  return key.replace(/-(community|nexus)$/, '').replace(/-errata$/, '');
}

// ── Rules ──

function resolveSectionKey(raw: unknown): RuleSectionKey {
  const normalized = String(raw || '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return 'clarifications';
  const canonical = normalized.replace(/\s+/g, '_');
  if (canonical in RULE_SECTION_LABELS) return canonical as RuleSectionKey;
  return RULE_SECTION_ALIASES[canonical] || RULE_SECTION_ALIASES[normalized] || 'clarifications';
}

const RULE_META_KEYS = new Set([
  'text', 'body', 'value', 'clarification', 'ruling', 'type', 'section', 'heading',
  'source', 'date', 'version', 'defunct', 'explanation', 'uid', 'id', '_id',
]);

function collectRuleEntries(input: unknown, headingHint = 'clarifications'): RuleEntry[] {
  if (!input) return [];
  if (typeof input === 'string') {
    const text = stringValue(input);
    return text
      ? [{ section: resolveSectionKey(headingHint), text, source: '', date: '', version: '', defunct: false, explanation: '' }]
      : [];
  }
  if (Array.isArray(input)) return input.flatMap((entry) => collectRuleEntries(entry, headingHint));
  if (typeof input !== 'object') return [];

  const obj = input as JsonObject;
  const collected: RuleEntry[] = [];
  const text = stringValue(obj.text || obj.body || obj.value || obj.clarification || obj.ruling);
  if (text) {
    collected.push({
      section: resolveSectionKey(obj.type || obj.section || obj.heading || headingHint),
      text,
      source: stringValue(obj.source),
      date: stringValue(obj.date),
      version: stringValue(obj.version),
      defunct: Boolean(obj.defunct),
      explanation: stringValue(obj.explanation),
    });
  }
  for (const [key, value] of Object.entries(obj)) {
    if (RULE_META_KEYS.has(key)) continue;
    collected.push(...collectRuleEntries(value, resolveSectionKey(key || headingHint)));
  }
  return collected;
}

export function normalizeRules(structured: unknown, fallback?: unknown): RuleEntry[] {
  const entries = collectRuleEntries(structured);
  if (entries.length === 0) {
    const text = stringValue(fallback);
    return text
      ? [{ section: 'clarifications', text, source: '', date: '', version: '', defunct: false, explanation: '' }]
      : [];
  }

  // Group by section in first-seen order, dropping exact repeats within a section.
  const grouped = new Map<RuleSectionKey, RuleEntry[]>();
  for (const entry of entries) {
    const rows = grouped.get(entry.section) ?? [];
    if (!rows.some((row) => row.text === entry.text && row.source === entry.source
      && row.date === entry.date && row.version === entry.version)) {
      rows.push(entry);
    }
    grouped.set(entry.section, rows);
  }
  return [...grouped.values()].flat();
}

// ── Cards ──

function itemsOf(payload: JsonObject, key: string): Array<[string, JsonObject]> {
  const collection = asObject(payload[key] ?? payload);
  return Object.entries(collection)
    .filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value))
    .map(([apiKey, value]) => [apiKey, value as JsonObject]);
}

function displayName(apiKey: string, raw: string, overrides: Record<string, string>): string {
  return overrides[apiKey] || raw;
}

function buildUpgrade(apiKey: string, item: JsonObject, source: RulingSource, overrides: Record<string, string>): RulingCard {
  const { cleanName, derivedFactions } = stripFactionTags(stringValue(item.name, 'Unknown Upgrade'));
  const name = displayName(apiKey, cleanName, overrides);
  const listed = Array.isArray(item.faction) ? item.faction.filter((f): f is string => typeof f === 'string') : [];
  const factions = derivedFactions.length > 0 ? derivedFactions : listed.length > 0 ? listed : ['neutral'];
  const upgradeType = normalizeUpgradeType(item.type);
  return {
    key: apiKey,
    baseKey: baselineKey(apiKey),
    anchorId: '',
    category: source === 'nexus' ? 'nexus-upgrades' : 'upgrades',
    source,
    name,
    image: stringValue(item.cardimage),
    factions,
    primaryFaction: normalizeFaction(factions[0]),
    showFactionIcons: !name.toLowerCase().includes('hondo ohnaka'),
    cardText: stringValue(item.ability),
    points: numberValue(item.points),
    keywords: [],
    upgradeType,
    rules: normalizeRules(item.rules, item.rulings),
  };
}

function buildSquadron(apiKey: string, item: JsonObject, source: RulingSource, overrides: Record<string, string>): RulingCard | null {
  if (item.ace !== true) return null;
  const { cleanName, derivedFactions } = stripFactionTags(stringValue(item['ace-name'] || item.name, 'Unknown Ace'));
  const name = displayName(apiKey, cleanName, overrides);
  const factions = derivedFactions.length > 0 ? derivedFactions : [stringValue(item.faction, 'neutral')];
  const abilities = asObject(item.abilities);
  const keywords = Object.entries(abilities)
    .filter(([, value]) => value === true || (typeof value === 'number' && value > 0))
    .map(([keyword, value]) => (typeof value === 'number' ? `${keyword.replace(/-/g, ' ')} ${value}` : keyword.replace(/-/g, ' ')));
  return {
    key: apiKey,
    baseKey: baselineKey(apiKey),
    anchorId: '',
    category: source === 'nexus' ? 'nexus-ace-squadrons' : 'ace-squadrons',
    source,
    name,
    image: stringValue(item.cardimage),
    factions,
    primaryFaction: normalizeFaction(factions[0]),
    showFactionIcons: !name.toLowerCase().includes('hondo ohnaka'),
    cardText: stringValue(item.ability),
    points: numberValue(item.points),
    keywords,
    rules: normalizeRules(item.rules, item.rulings),
  };
}

function buildObjective(apiKey: string, item: JsonObject, source: RulingSource, overrides: Record<string, string>): RulingCard {
  const parts: string[] = [];
  if (item.setup) parts.push(`**Setup:** ${stringValue(item.setup)}`);
  if (item.special_rule) parts.push(`**Special Rule:** ${stringValue(item.special_rule)}`);
  if (item.end_of_round) parts.push(`**End of Round:** ${stringValue(item.end_of_round)}`);
  if (item.end_of_game) parts.push(`**End of Game:** ${stringValue(item.end_of_game)}`);
  if (item.errata) parts.push(`**Errata:** ${stringValue(item.errata)}`);
  return {
    key: apiKey,
    baseKey: baselineKey(apiKey),
    anchorId: '',
    category: 'objectives',
    source,
    name: displayName(apiKey, stringValue(item.name, 'Unknown Objective'), overrides),
    image: stringValue(item.cardimage),
    factions: ['neutral'],
    primaryFaction: 'neutral',
    showFactionIcons: false,
    cardText: parts.join('\n\n'),
    keywords: [],
    objectiveType: stringValue(item.type, 'objective').toLowerCase(),
    rules: normalizeRules(item.rules, item.rulings),
  };
}

function buildDamageCard(apiKey: string, item: JsonObject, overrides: Record<string, string>): RulingCard {
  return {
    key: apiKey,
    baseKey: apiKey,
    anchorId: '',
    category: 'damage-cards',
    source: 'core',
    name: displayName(apiKey, stringValue(item.name || item.title, 'Unknown Damage Card'), overrides),
    image: stringValue(item.cardimage || item.image),
    factions: ['neutral'],
    primaryFaction: 'neutral',
    showFactionIcons: false,
    cardText: stringValue(item.card_text || item.text || item.ability),
    keywords: [],
    rules: normalizeRules(item.rules, item.rulings || item.clarification || item.clarifications),
  };
}

/**
 * Lays Community cards over core ones. A Community erratum takes its core card's place
 * (and inherits that card's rulings if it publishes none of its own); a Community card
 * with no core counterpart is added.
 */
export function applyCommunityLayer(core: RulingCard[], community: RulingCard[]): RulingCard[] {
  const byBase = new Map(core.map((card) => [`${card.category}:${card.baseKey}`, card]));
  const merged = new Map(core.map((card) => [`${card.category}:${card.key}`, card]));

  for (const card of community) {
    const baseline = byBase.get(`${card.category}:${card.baseKey}`);
    if (baseline) {
      merged.delete(`${baseline.category}:${baseline.key}`);
      merged.set(`${card.category}:${card.key}`, card.rules.length > 0 ? card : { ...card, rules: baseline.rules });
    } else {
      merged.set(`${card.category}:${card.key}`, card);
    }
  }
  return [...merged.values()];
}

function typeRank(order: string[], value: string | undefined): number {
  const index = order.indexOf(value || '');
  return index === -1 ? order.length : index;
}

// Core content first, so where a core and a Nexus card share a name, the core card is
// the one a bare "Name (Type)" mention links to.
const CATEGORY_ORDER: RulingCategory[] = [
  'objectives',
  'damage-cards',
  'upgrades',
  'ace-squadrons',
  'nexus-upgrades',
  'nexus-ace-squadrons',
];

export function compareCards(a: RulingCard, b: RulingCard): number {
  const categoryCmp = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  if (categoryCmp !== 0) return categoryCmp;
  if (a.category === 'objectives' && b.category === 'objectives') {
    return typeRank(OBJECTIVE_TYPE_ORDER, a.objectiveType) - typeRank(OBJECTIVE_TYPE_ORDER, b.objectiveType)
      || a.name.localeCompare(b.name);
  }
  if (a.upgradeType || b.upgradeType) {
    const typeCmp = typeRank(UPGRADE_TYPE_ORDER, a.upgradeType) - typeRank(UPGRADE_TYPE_ORDER, b.upgradeType);
    if (typeCmp !== 0) return typeCmp;
    if (a.upgradeType === 'commander' || a.upgradeType === 'officer') {
      const factionCmp = typeRank(FACTION_ORDER, a.primaryFaction) - typeRank(FACTION_ORDER, b.primaryFaction);
      if (factionCmp !== 0) return factionCmp;
    }
  }
  if (a.category.endsWith('ace-squadrons')) {
    const factionCmp = typeRank(FACTION_ORDER, a.primaryFaction) - typeRank(FACTION_ORDER, b.primaryFaction);
    if (factionCmp !== 0) return factionCmp;
  }
  return a.name.localeCompare(b.name);
}

function anchorSuffix(card: RulingCard): string {
  switch (card.category) {
    case 'upgrades':
    case 'nexus-upgrades':
      return slugify(card.upgradeType || 'upgrade');
    case 'ace-squadrons':
    case 'nexus-ace-squadrons':
      return 'squadron';
    case 'objectives':
      return 'objective';
    case 'damage-cards':
      return 'damage';
  }
}

/**
 * Stable anchors, matching the ids the published HTML pages used. They only need to be
 * unique within a category: each category is its own page (or set of pages), so a
 * Nexus card and its core namesake can both keep the plain id.
 */
function assignAnchorIds(cards: RulingCard[]): RulingCard[] {
  const seen = new Map<string, number>();
  return cards.map((card) => {
    const base = `${slugify(card.name)}-${anchorSuffix(card)}`;
    const scoped = `${card.category}:${base}`;
    const count = (seen.get(scoped) ?? 0) + 1;
    seen.set(scoped, count);
    return { ...card, anchorId: count > 1 ? `${base}-${count}` : base };
  });
}

export function buildRulingCards(input: RulingsDataInput): RulingCard[] {
  const overrides = input.displayNameOverrides ?? {};

  const core: RulingCard[] = [
    ...itemsOf(input.core.upgrades, 'upgrades').map(([key, item]) => buildUpgrade(key, item, 'core', overrides)),
    ...itemsOf(input.core.squadrons, 'squadrons').map(([key, item]) => buildSquadron(key, item, 'core', overrides)),
    ...itemsOf(input.core.objectives, 'objectives').map(([key, item]) => buildObjective(key, item, 'core', overrides)),
    ...itemsOf(input.core.damageCards, 'damage-cards').map(([key, item]) => buildDamageCard(key, item, overrides)),
  ].filter((card): card is RulingCard => card !== null);

  const community: RulingCard[] = [
    ...itemsOf(input.community.upgrades, 'upgrades').map(([key, item]) => buildUpgrade(key, item, 'community', overrides)),
    ...itemsOf(input.community.squadrons, 'squadrons').map(([key, item]) => buildSquadron(key, item, 'community', overrides)),
    ...itemsOf(input.community.objectives, 'objectives').map(([key, item]) => buildObjective(key, item, 'community', overrides)),
  ].filter((card): card is RulingCard => card !== null);

  const nexus: RulingCard[] = [
    ...itemsOf(input.nexus.upgrades, 'upgrades').map(([key, item]) => buildUpgrade(key, item, 'nexus', overrides)),
    ...itemsOf(input.nexus.squadrons, 'squadrons').map(([key, item]) => buildSquadron(key, item, 'nexus', overrides)),
  ].filter((card): card is RulingCard => card !== null);

  const cards = [...applyCommunityLayer(core, community), ...nexus].sort(compareCards);
  return assignAnchorIds(cards);
}

// ── Sections, as the ARM lays them out ──

export interface SectionEntry {
  text: string;
  defunct: boolean;
  explanation: string;
  /** 1-based index into `footnotes` (source | date | version). */
  footnote?: number;
  /** 1-based index into `notes` (lettered explanations). */
  note?: number;
}

export interface CardSections {
  cardText?: string;
  timing: SectionEntry[];
  sections: Array<{ key: RuleSectionKey; label: string; entries: SectionEntry[] }>;
  footnotes: string[];
  notes: string[];
}

/**
 * Card Text and Timing lead the entry beside the card image; every other section
 * follows below it. Each distinct source line becomes a numbered footnote and each
 * explanation of a still-current ruling a lettered note, both shared within the card.
 */
export function buildCardSections(card: Pick<RulingCard, 'cardText' | 'rules'>): CardSections {
  const footnotes: string[] = [];
  const notes: string[] = [];
  const bySection = new Map<RuleSectionKey, SectionEntry[]>();

  for (const rule of card.rules) {
    const label = [rule.source, rule.date, rule.version].filter(Boolean).join(' | ');
    let footnote: number | undefined;
    if (label) {
      if (!footnotes.includes(label)) footnotes.push(label);
      footnote = footnotes.indexOf(label) + 1;
    }
    let note: number | undefined;
    if (!rule.defunct && rule.explanation) {
      if (!notes.includes(rule.explanation)) notes.push(rule.explanation);
      note = notes.indexOf(rule.explanation) + 1;
    }
    const entries = bySection.get(rule.section) ?? [];
    entries.push({ text: rule.text, defunct: rule.defunct, explanation: rule.explanation, footnote, note });
    bySection.set(rule.section, entries);
  }

  // A card_text ruling only stands in for the card's own text when it has none.
  const cardText = card.cardText || bySection.get('card_text')?.[0]?.text;

  return {
    cardText,
    timing: bySection.get('timing') ?? [],
    sections: SECTION_ORDER
      .filter((key) => key !== 'card_text' && key !== 'timing' && (bySection.get(key)?.length ?? 0) > 0)
      .map((key) => ({ key, label: RULE_SECTION_LABELS[key], entries: bySection.get(key)! })),
    footnotes,
    notes,
  };
}

// ── Cross-page card links ──

export interface CardLinkTarget {
  href: string;
  /** Key of the card linked to, so an entry never links to itself. */
  key: string;
}

export function upgradeTypeLabel(type: string | undefined): string {
  if (type === 'weapons-team-offensive-retro') return 'Boarding Team';
  if (type === 'super-weapon') return 'Superweapon';
  if (type?.endsWith('-retro')) return upgradeTypeLabel(type.replace(/-retro$/, '-retrofit'));
  return String(type || 'unknown').split('-').filter(Boolean).map((t) => t[0].toUpperCase() + t.slice(1)).join(' ');
}

function cardTypeLabel(card: RulingCard): string {
  if (card.upgradeType) return upgradeTypeLabel(card.upgradeType);
  if (card.category.endsWith('ace-squadrons')) return 'Squadron';
  if (card.category === 'objectives') return 'Objective';
  return 'Damage';
}

/**
 * Card names (and "Name (Type)" forms) that can be linked unambiguously. A name shared
 * by several cards only links in its disambiguated form. Single-word names are left out
 * entirely — "Resolve" or "Ambush" would otherwise link ordinary prose.
 */
export function buildCardLinkIndex(
  cards: RulingCard[],
  pageHref: (card: RulingCard) => string,
  aliases: Record<string, string> = {},
): Map<string, CardLinkTarget> {
  const byName = new Map<string, RulingCard[]>();
  for (const card of cards) {
    const key = card.name.toLowerCase();
    byName.set(key, [...(byName.get(key) ?? []), card]);
  }

  const index = new Map<string, CardLinkTarget>();
  const target = (card: RulingCard) => ({ href: `${pageHref(card)}#${card.anchorId}`, key: card.key });
  for (const [name, group] of byName) {
    if (group.length === 1 && name.includes(' ')) index.set(name, target(group[0]));
    for (const card of group) {
      const suffix = ` (${cardTypeLabel(card)})`;
      const disambiguated = card.name.endsWith(suffix) ? card.name : `${card.name}${suffix}`;
      if (!index.has(disambiguated.toLowerCase())) index.set(disambiguated.toLowerCase(), target(card));
    }
  }
  for (const [alias, canonical] of Object.entries(aliases)) {
    const resolved = index.get(canonical.toLowerCase());
    if (resolved && !index.has(alias.toLowerCase())) index.set(alias.toLowerCase(), resolved);
  }
  return index;
}
