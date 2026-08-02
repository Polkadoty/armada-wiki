export type ChangelogEntityType = 'ship' | 'squadron' | 'upgrade' | 'objective';

type JsonObject = Record<string, unknown>;

interface SourcePayloads {
  ships: JsonObject;
  squadrons: JsonObject;
  upgrades: JsonObject;
  objectives: JsonObject;
}

interface RawEntity {
  id: string;
  entityType: ChangelogEntityType;
  item: JsonObject;
  name: string;
  factions: string[];
  source: 'community' | 'core' | 'arc' | 'legacy';
}

export interface ChangelogFieldChange {
  path: string;
  label: string;
  before: string;
  after: string;
  longForm: boolean;
  summary: string;
}

export interface ChangelogEntry {
  id: string;
  entityType: ChangelogEntityType;
  name: string;
  factions: string[];
  status: 'added' | 'changed';
  points?: number;
  pointChange?: {
    before: number;
    after: number;
    direction: 'increase' | 'decrease';
  };
  changes: ChangelogFieldChange[];
  additionDetails: string[];
  rulingCount: number;
  inheritedRulingCount: number;
  baselineFound: boolean;
}

export interface ChangelogCategory {
  id: string;
  title: string;
  entries: ChangelogEntry[];
}

export interface ChangelogSection {
  id: string;
  title: string;
  faction?: string;
  categories: ChangelogCategory[];
}

export interface ChangelogSummary {
  total: number;
  added: number;
  changed: number;
  pointChanges: number;
  rulesChanges: number;
  inheritedRulings: number;
  missingBaselines: number;
}

export interface CommunityChangelog {
  sections: ChangelogSection[];
  summary: ChangelogSummary;
  lastModified?: string;
  warnings: string[];
}

export interface ChangelogPayloads {
  community: SourcePayloads;
  core: SourcePayloads;
  arc: SourcePayloads;
  legacy: SourcePayloads;
  lastModified?: string;
  warnings?: string[];
}

const API_REVALIDATE_SECONDS = 60 * 60;

const EMPTY_SOURCE: SourcePayloads = {
  ships: {},
  squadrons: {},
  upgrades: {},
  objectives: {},
};

const IGNORED_GAMEPLAY_FIELDS = new Set([
  '_id',
  'author',
  'alias',
  'team',
  'release',
  'expansion',
  'artwork',
  'cardimage',
  'silhouette',
  'blueprint',
  'nicknames',
  'rules',
  'rulings',
  'errata',
  'source',
  'chassis',
  'chassis_name',
  'name',
  'ace-name',
  'squadron_type',
  'faction',
  'type',
]);

const FIELD_LABELS: Record<string, string> = {
  ability: 'Card text',
  setup: 'Setup',
  special_rule: 'Special rule',
  end_of_round: 'End of round',
  end_of_game: 'End of game',
  victory_tokens: 'Victory tokens',
  victory_tokens_points: 'Victory token value',
  objective_tokens: 'Objective tokens',
  objective_tokens_type: 'Objective token type',
  objective_tokens_count: 'Objective token count',
  command_tokens: 'Command tokens',
  command_tokens_type: 'Command token type',
  command_tokens_value: 'Command token value',
  command_tokens_count: 'Command token count',
  hull: 'Hull',
  speed: 'Speed',
  size: 'Size',
  unique: 'Unique',
  irregular: 'Irregular',
  modification: 'Modification',
  bound_shiptype: 'Bound ship type',
  traits: 'Traits',
  upgrades: 'Upgrade slots',
  'values.command': 'Command',
  'values.squadron': 'Squadron',
  'values.engineer': 'Engineering',
  'tokens.def_scatter': 'Scatter tokens',
  'tokens.def_evade': 'Evade tokens',
  'tokens.def_brace': 'Brace tokens',
  'tokens.def_redirect': 'Redirect tokens',
  'tokens.def_contain': 'Contain tokens',
  'tokens.def_salvo': 'Salvo tokens',
  'armament.anti-squadron': 'Anti-squadron armament',
  'armament.anti-ship': 'Anti-ship armament',
  'armament.asa': 'Anti-squadron armament',
  'armament.front': 'Front armament',
  'armament.rear': 'Rear armament',
  'armament.left': 'Left armament',
  'armament.right': 'Right armament',
  'armament.left_aux': 'Left auxiliary armament',
  'armament.right_aux': 'Right auxiliary armament',
  'chassis_stats.size': 'Size',
  'chassis_stats.hull': 'Hull',
  'chassis_stats.speed': 'Navigation chart',
  'chassis_stats.shields.front': 'Front shields',
  'chassis_stats.shields.rear': 'Rear shields',
  'chassis_stats.shields.left': 'Left shields',
  'chassis_stats.shields.right': 'Right shields',
  'chassis_stats.shields.left_aux': 'Left auxiliary shields',
  'chassis_stats.shields.right_aux': 'Right auxiliary shields',
};

const UPGRADE_TYPE_LABELS: Record<string, string> = {
  commander: 'Commanders',
  officer: 'Officers',
  title: 'Titles',
  'fleet-command': 'Fleet Commands',
  'fleet-support': 'Fleet Support',
  'boarding-team': 'Boarding Teams',
  'weapons-team': 'Weapons Teams',
  'weapons-team-offensive-retro': 'Weapons Team / Offensive Retrofit',
  'offensive-retro': 'Offensive Retrofits',
  'defensive-retro': 'Defensive Retrofits',
  'experimental-retro': 'Experimental Retrofits',
  'support-team': 'Support Teams',
  'ion-cannon': 'Ion Cannons',
  ordnance: 'Ordnance',
  turbolaser: 'Turbolasers',
  'super-weapon': 'Superweapons',
};

const FACTION_LABELS: Record<string, string> = {
  empire: 'Galactic Empire',
  rebel: 'Rebel Alliance',
  separatist: 'Separatist Alliance',
  republic: 'Galactic Republic',
  scum: 'Scum and Villainy',
  'new-republic': 'New Republic',
  resistance: 'Resistance',
  'first-order': 'First Order',
  chiss: 'Chiss Ascendancy',
  impwar: 'Imperial Warlords',
};

const SECTION_ORDER = [
  'empire',
  'rebel',
  'separatist',
  'republic',
  'scum',
  'new-republic',
  'resistance',
  'first-order',
  'chiss',
  'impwar',
  'upgrade-cards',
  'objectives',
];

const CATEGORY_ORDER = [
  'commander',
  'ships',
  'squadrons',
  'fleet-command',
  'fleet-support',
  'boarding-team',
  'officer',
  'title',
  'weapons-team',
  'weapons-team-offensive-retro',
  'offensive-retro',
  'defensive-retro',
  'experimental-retro',
  'support-team',
  'ion-cannon',
  'ordnance',
  'turbolaser',
  'super-weapon',
  'assault',
  'defense',
  'navigation',
  'campaign',
  'scenario',
];

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizedFactions(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values
    .filter((faction): faction is string => typeof faction === 'string')
    .map((faction) => faction.trim().toLowerCase())
    .filter(Boolean))];
}

function displayName(item: JsonObject, entityType: ChangelogEntityType): string {
  if (entityType === 'squadron') {
    return asString(item['ace-name']).trim() || asString(item.name).trim();
  }
  return asString(item.name).trim();
}

function sourceNeutralId(id: string): string {
  return id.replace(/-(community|arc|legacy)$/, '');
}

function baselineId(id: string): string {
  return sourceNeutralId(id).replace(/-errata$/, '');
}

function normalizedIdentityText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\{[^}]+\}/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function entityIdentity(entity: RawEntity, includeFaction = true): string {
  const itemType = asString(entity.item.type);
  const aceName = asString(entity.item['ace-name']);
  const faction = includeFaction ? entity.factions.slice().sort().join(',') : '';
  return [
    entity.entityType,
    normalizedIdentityText(entity.name),
    normalizedIdentityText(aceName),
    itemType,
    faction,
  ].join('|');
}

function flattenSource(source: RawEntity['source'], payloads: SourcePayloads): RawEntity[] {
  const entities: RawEntity[] = [];

  for (const entityType of ['squadrons', 'upgrades', 'objectives'] as const) {
    const singular = entityType.slice(0, -1) as Exclude<ChangelogEntityType, 'ship'>;
    for (const [id, value] of Object.entries(asObject(payloads[entityType]))) {
      const item = asObject(value);
      entities.push({
        id,
        entityType: singular,
        item,
        name: displayName(item, singular),
        factions: normalizedFactions(item.faction),
        source,
      });
    }
  }

  for (const chassisValue of Object.values(asObject(payloads.ships))) {
    const chassis = asObject(chassisValue);
    const chassisStats = {
      size: chassis.size,
      hull: chassis.hull,
      speed: chassis.speed,
      shields: chassis.shields,
    };
    for (const [id, value] of Object.entries(asObject(chassis.models))) {
      const model = asObject(value);
      const item: JsonObject = { ...model, chassis_stats: chassisStats };
      entities.push({
        id,
        entityType: 'ship',
        item,
        name: displayName(item, 'ship'),
        factions: normalizedFactions(item.faction),
        source,
      });
    }
  }

  return entities;
}

function normalizeRuleText(value: unknown): string {
  return asString(value)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function ruleFingerprint(value: unknown): string {
  const rule = asObject(value);
  return [
    normalizeRuleText(rule.type),
    normalizeRuleText(rule.source),
    normalizeRuleText(rule.date),
    normalizeRuleText(rule.version),
    normalizeRuleText(rule.text || value),
    rule.defunct === true ? 'defunct' : '',
    normalizeRuleText(rule.explanation),
  ].join('|');
}

function findHistoricalMatches(entity: RawEntity, historical: RawEntity[]): RawEntity[] {
  const exactId = sourceNeutralId(entity.id);
  const exact = historical.filter((candidate) =>
    candidate.entityType === entity.entityType && sourceNeutralId(candidate.id) === exactId
  );
  if (exact.length > 0) return exact;

  const strictIdentity = entityIdentity(entity);
  const strict = historical.filter((candidate) => entityIdentity(candidate) === strictIdentity);
  if (strict.length > 0) return strict;

  const looseIdentity = entityIdentity(entity, false);
  const loose = historical.filter((candidate) => entityIdentity(candidate, false) === looseIdentity);
  return loose.length === 1 ? loose : [];
}

function enrichRulings(entity: RawEntity, historical: RawEntity[]): {
  entity: RawEntity;
  inherited: number;
} {
  const communityRules = Array.isArray(entity.item.rules) ? entity.item.rules : [];
  const rules = [...communityRules];
  const fingerprints = new Set(rules.map(ruleFingerprint));
  let inherited = 0;

  for (const match of findHistoricalMatches(entity, historical)) {
    const historicalRules = Array.isArray(match.item.rules) ? match.item.rules : [];
    for (const rule of historicalRules) {
      const fingerprint = ruleFingerprint(rule);
      if (!fingerprints.has(fingerprint)) {
        fingerprints.add(fingerprint);
        rules.push(rule);
        inherited += 1;
      }
    }
  }

  return {
    entity: {
      ...entity,
      item: rules.length > 0 ? { ...entity.item, rules } : entity.item,
    },
    inherited,
  };
}

function findBaseline(entity: RawEntity, core: RawEntity[], historical: RawEntity[]): RawEntity | undefined {
  const expectedId = baselineId(entity.id);
  const exactCore = core.find((candidate) =>
    candidate.entityType === entity.entityType && sourceNeutralId(candidate.id) === expectedId
  );
  if (exactCore) return exactCore;

  const exactHistorical = historical.find((candidate) =>
    candidate.entityType === entity.entityType &&
    !candidate.id.includes('-errata-') &&
    baselineId(candidate.id) === expectedId
  );
  if (exactHistorical) return exactHistorical;

  const nonErrataCandidates = [...core, ...historical].filter((candidate) =>
    candidate.entityType === entity.entityType && !candidate.id.includes('-errata-')
  );
  const strictIdentity = entityIdentity(entity);
  const strict = nonErrataCandidates.filter((candidate) => entityIdentity(candidate) === strictIdentity);
  if (strict.length === 1) return strict[0];

  const looseIdentity = entityIdentity(entity, false);
  const loose = nonErrataCandidates.filter((candidate) => entityIdentity(candidate, false) === looseIdentity);
  return loose.length === 1 ? loose[0] : undefined;
}

function sanitizeGameplayValue(value: unknown, key?: string): unknown {
  if (key && IGNORED_GAMEPLAY_FIELDS.has(key)) return undefined;
  if (typeof value === 'string') return value.trim() || undefined;
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => sanitizeGameplayValue(item))
      .filter((item) => item !== undefined);
    return normalized.length > 0 ? normalized : undefined;
  }
  if (typeof value === 'object') {
    const normalized: JsonObject = {};
    for (const [childKey, childValue] of Object.entries(value as JsonObject)) {
      const cleaned = sanitizeGameplayValue(childValue, childKey);
      if (cleaned !== undefined) normalized[childKey] = cleaned;
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }
  return value;
}

function flattenGameplay(value: unknown, prefix = '', output = new Map<string, unknown>()): Map<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value as JsonObject)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (child && typeof child === 'object' && !Array.isArray(child)) {
        flattenGameplay(child, path, output);
      } else {
        output.set(path, child);
      }
    }
  }
  return output;
}

function humanize(value: string): string {
  return value
    .replace(/^def_/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function fieldLabel(path: string): string {
  if (FIELD_LABELS[path]) return FIELD_LABELS[path];
  if (path.startsWith('abilities.')) return humanize(path.slice('abilities.'.length));
  if (path.startsWith('restrictions.')) return humanize(path.slice('restrictions.'.length));
  if (path.startsWith('start_command.')) return `Starting ${humanize(path.slice('start_command.'.length)).toLowerCase()}`;
  if (path.startsWith('exhaust.')) return `Exhaust ${humanize(path.slice('exhaust.'.length)).toLowerCase()}`;
  return humanize(path.split('.').at(-1) || path);
}

function isDicePath(path: string, value: unknown): value is unknown[] {
  return path.startsWith('armament.') && Array.isArray(value) && value.length === 3;
}

function formatValue(path: string, value: unknown): string {
  if (value === undefined) return 'None';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (isDicePath(path, value)) {
    const [red, blue, black] = value.map((count) => Number(count) || 0);
    const dice = [
      red ? `${red} red` : '',
      blue ? `${blue} blue` : '',
      black ? `${black} black` : '',
    ].filter(Boolean);
    return dice.length > 0 ? dice.join(', ') : 'No dice';
  }
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'string' ? humanize(item) : String(item)).join(', ') || 'None';
  }
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function clippedQuote(value: string, maxLength = 150): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  const clipped = compact.length > maxLength
    ? `${compact.slice(0, maxLength - 1).trimEnd()}…`
    : compact;
  return `“${clipped}”`;
}

function fullQuote(value: string): string {
  const plainText = value
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return `“${plainText}”`;
}

function summarizeTextChange(before: string, after: string): string {
  const beforeWords = before.split(/\s+/).filter(Boolean);
  const afterWords = after.split(/\s+/).filter(Boolean);
  let prefix = 0;
  while (
    prefix < beforeWords.length &&
    prefix < afterWords.length &&
    beforeWords[prefix] === afterWords[prefix]
  ) {
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < beforeWords.length - prefix &&
    suffix < afterWords.length - prefix &&
    beforeWords[beforeWords.length - 1 - suffix] === afterWords[afterWords.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const removed = beforeWords.slice(prefix, beforeWords.length - suffix).join(' ');
  const added = afterWords.slice(prefix, afterWords.length - suffix).join(' ');
  if (!removed && added) return `Added ${clippedQuote(added)}`;
  if (removed && !added) return `Removed ${clippedQuote(removed)}`;
  if (removed.length + added.length <= 230) {
    return `Changed ${clippedQuote(removed)} to ${clippedQuote(added)}`;
  }
  return `Updated card text: ${fullQuote(after)}`;
}

function summarizeFieldChange(path: string, label: string, before: string, after: string): string {
  if (/ability|rule|setup|end_of/.test(path)) return summarizeTextChange(before, after);

  if (path.startsWith('tokens.')) {
    const beforeCount = Number(before);
    const afterCount = Number(after);
    if (Number.isFinite(beforeCount) && Number.isFinite(afterCount)) {
      const delta = afterCount - beforeCount;
      if (delta !== 0) {
        const count = Math.abs(delta);
        const tokenName = label.replace(/ tokens?$/i, '').toLowerCase();
        return `${delta > 0 ? 'Gains' : 'Loses'} ${count} ${tokenName} token${count === 1 ? '' : 's'}.`;
      }
    }
  }

  if (path.startsWith('abilities.')) {
    if (before === 'Yes' && after === 'No') return `Loses ${label} Keyword.`;
    if (before === 'No' && after === 'Yes') return `Gains ${label} Keyword.`;
  }

  if (path === 'modification') {
    if (before === 'Yes' && after === 'No') return 'Loses Modification.';
    if (before === 'No' && after === 'Yes') return 'Gains Modification.';
  }

  if (path === 'victory_tokens') {
    if (before === 'No' && after === 'Yes') return 'Objective gains victory token scoring.';
    if (before === 'Yes' && after === 'No') return 'Objective loses victory token scoring.';
  }

  return `${label} changed from ${before} to ${after}.`;
}

function keywordLabel(keyword: string): string {
  if (keyword === 'ai-battery') return 'AI: Battery';
  if (keyword === 'ai-antisquadron') return 'AI: Anti-Squadron';
  return humanize(keyword);
}

function additionDetails(entity: RawEntity): string[] {
  if (entity.entityType === 'upgrade') {
    const details: string[] = [];
    const textFields: Array<[string, string]> = [
      ['ability', 'Card text'],
      ['setup', 'Setup'],
      ['special_rule', 'Special rule'],
      ['end_of_round', 'End of round'],
      ['end_of_game', 'End of game'],
    ];
    for (const [field, label] of textFields) {
      const value = asString(entity.item[field]).trim();
      if (value) details.push(`${label}: ${fullQuote(value)}`);
    }
    return details;
  }

  if (entity.entityType === 'squadron') {
    const keywords = Object.entries(asObject(entity.item.abilities))
      .flatMap(([keyword, value]) => {
        if (value === true) return [keywordLabel(keyword)];
        if (typeof value === 'number' && value > 0) return [`${keywordLabel(keyword)} ${value}`];
        return [];
      });
    return keywords.length > 0 ? [`Keywords: ${keywords.join(', ')}.`] : [];
  }

  if (entity.entityType === 'ship') {
    const size = asString(asObject(entity.item.chassis_stats).size).trim();
    return size ? [`Ship size: ${humanize(size)}.`] : [];
  }

  return [];
}

function compareGameplay(beforeItem: JsonObject, afterItem: JsonObject): ChangelogFieldChange[] {
  const before = flattenGameplay(sanitizeGameplayValue(beforeItem) || {});
  const after = flattenGameplay(sanitizeGameplayValue(afterItem) || {});
  const paths = [...new Set([...before.keys(), ...after.keys()])].sort();
  const changes: ChangelogFieldChange[] = [];

  for (const path of paths) {
    if (path === 'points') continue;
    const beforeValue = before.get(path);
    const afterValue = after.get(path);
    if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) continue;
    const formattedBefore = formatValue(path, beforeValue);
    const formattedAfter = formatValue(path, afterValue);
    changes.push({
      path,
      label: fieldLabel(path),
      before: formattedBefore,
      after: formattedAfter,
      longForm: formattedBefore.length + formattedAfter.length > 150 || /ability|rule|setup|end_of/.test(path),
      summary: summarizeFieldChange(path, fieldLabel(path), formattedBefore, formattedAfter),
    });
  }

  return changes;
}

function numericPoints(item: JsonObject): number | undefined {
  return typeof item.points === 'number' ? item.points : undefined;
}

function categoryFor(entity: RawEntity): { id: string; title: string } {
  if (entity.entityType === 'ship') return { id: 'ships', title: 'Ships' };
  if (entity.entityType === 'squadron') return { id: 'squadrons', title: 'Squadrons' };
  const type = asString(entity.item.type) || entity.entityType;
  if (entity.entityType === 'objective') {
    return { id: type, title: `${humanize(type)} Objectives` };
  }
  return { id: type, title: UPGRADE_TYPE_LABELS[type] || humanize(type) };
}

function sectionFor(entity: RawEntity): { id: string; title: string; faction?: string } {
  if (entity.entityType === 'objective') return { id: 'objectives', title: 'Objectives' };
  if (entity.entityType === 'upgrade' && entity.factions.length !== 1) {
    return { id: 'upgrade-cards', title: 'Upgrade Cards' };
  }
  const faction = entity.factions[0];
  if (!faction) return { id: 'upgrade-cards', title: 'Upgrade Cards' };
  return { id: faction, title: FACTION_LABELS[faction] || humanize(faction), faction };
}

function orderIndex(value: string, order: string[]): number {
  const index = order.indexOf(value);
  return index === -1 ? order.length : index;
}

export function buildCommunityChangelog(payloads: ChangelogPayloads): CommunityChangelog {
  const community = flattenSource('community', payloads.community);
  const core = flattenSource('core', payloads.core);
  const historical = [
    ...flattenSource('arc', payloads.arc),
    ...flattenSource('legacy', payloads.legacy),
  ];
  const entriesWithGrouping: Array<{
    entry: ChangelogEntry;
    section: ReturnType<typeof sectionFor>;
    category: ReturnType<typeof categoryFor>;
  }> = [];

  let inheritedRulings = 0;
  let missingBaselines = 0;

  for (const rawEntity of community) {
    const enriched = enrichRulings(rawEntity, historical);
    inheritedRulings += enriched.inherited;
    const entity = enriched.entity;
    const isErrata = entity.id.includes('-errata-');
    const baseline = isErrata ? findBaseline(entity, core, historical) : undefined;
    if (isErrata && !baseline) missingBaselines += 1;

    const beforePoints = baseline ? numericPoints(baseline.item) : undefined;
    const afterPoints = numericPoints(entity.item);
    const pointChange = beforePoints !== undefined && afterPoints !== undefined && beforePoints !== afterPoints
      ? {
          before: beforePoints,
          after: afterPoints,
          direction: afterPoints > beforePoints ? 'increase' as const : 'decrease' as const,
        }
      : undefined;
    const rules = Array.isArray(entity.item.rules) ? entity.item.rules : [];
    const entry: ChangelogEntry = {
      id: entity.id,
      entityType: entity.entityType,
      name: entity.name || humanize(entity.id),
      factions: entity.factions,
      status: isErrata ? 'changed' : 'added',
      points: afterPoints,
      pointChange,
      changes: baseline ? compareGameplay(baseline.item, entity.item) : [],
      additionDetails: isErrata ? [] : additionDetails(entity),
      rulingCount: rules.length,
      inheritedRulingCount: enriched.inherited,
      baselineFound: !isErrata || Boolean(baseline),
    };
    entriesWithGrouping.push({
      entry,
      section: sectionFor(entity),
      category: categoryFor(entity),
    });
  }

  const sectionMap = new Map<string, ChangelogSection>();
  for (const grouped of entriesWithGrouping) {
    let section = sectionMap.get(grouped.section.id);
    if (!section) {
      section = { ...grouped.section, categories: [] };
      sectionMap.set(grouped.section.id, section);
    }
    let category = section.categories.find((candidate) => candidate.id === grouped.category.id);
    if (!category) {
      category = { ...grouped.category, entries: [] };
      section.categories.push(category);
    }
    category.entries.push(grouped.entry);
  }

  const sections = [...sectionMap.values()]
    .sort((a, b) => orderIndex(a.id, SECTION_ORDER) - orderIndex(b.id, SECTION_ORDER) || a.title.localeCompare(b.title));
  for (const section of sections) {
    section.categories.sort((a, b) =>
      orderIndex(a.id, CATEGORY_ORDER) - orderIndex(b.id, CATEGORY_ORDER) || a.title.localeCompare(b.title)
    );
    for (const category of section.categories) {
      category.entries.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  const entries = entriesWithGrouping.map(({ entry }) => entry);
  const summary: ChangelogSummary = {
    total: entries.length,
    added: entries.filter((entry) => entry.status === 'added').length,
    changed: entries.filter((entry) => entry.status === 'changed').length,
    pointChanges: entries.filter((entry) => Boolean(entry.pointChange)).length,
    rulesChanges: entries.filter((entry) => entry.changes.some((change) => change.longForm)).length,
    inheritedRulings,
    missingBaselines,
  };

  return {
    sections,
    summary,
    lastModified: payloads.lastModified,
    warnings: payloads.warnings || [],
  };
}

async function fetchEndpoint(path: string): Promise<{ data: JsonObject; warning?: string }> {
  const primary = process.env.NEXT_PUBLIC_PRIMARY_API_URL || 'https://api.swarmada.wiki';
  const backup = process.env.NEXT_PUBLIC_BACKUP_API_URL || 'https://api-backup.swarmada.wiki';
  const bases = [...new Set([primary, backup])];
  let lastError = 'unknown error';

  for (const base of bases) {
    try {
      const response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
        next: { revalidate: API_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) {
        lastError = `${response.status} ${response.statusText}`;
        continue;
      }
      return { data: asObject(await response.json()) };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  return { data: {}, warning: `${path}: ${lastError}` };
}

function payloadRecord(payload: JsonObject, key: keyof SourcePayloads): JsonObject {
  return asObject(payload[key]);
}

export async function fetchCommunityChangelog(): Promise<CommunityChangelog> {
  const sourcePaths = {
    community: {
      ships: '/community/ships',
      squadrons: '/community/squadrons',
      upgrades: '/community/upgrades',
      objectives: '/community/objectives',
    },
    core: {
      ships: '/ships',
      squadrons: '/squadrons',
      upgrades: '/upgrades',
      objectives: '/objectives',
    },
    arc: {
      ships: '/arc/ships',
      squadrons: '/arc/squadrons',
      upgrades: '/arc/upgrades',
      objectives: '/arc/objectives',
    },
    legacy: {
      ships: '/legacy/ships',
      squadrons: '/legacy/squadrons',
      upgrades: '/legacy/upgrades',
      objectives: '',
    },
  } as const;

  const requests: Array<{
    source: keyof typeof sourcePaths;
    type: keyof SourcePayloads;
    path: string;
  }> = [];
  for (const [source, paths] of Object.entries(sourcePaths) as Array<[
    keyof typeof sourcePaths,
    (typeof sourcePaths)[keyof typeof sourcePaths],
  ]>) {
    for (const [type, path] of Object.entries(paths) as Array<[keyof SourcePayloads, string]>) {
      if (path) requests.push({ source, type, path });
    }
  }

  const [responses, manifestResponse] = await Promise.all([
    Promise.all(requests.map(async (request) => ({ ...request, ...(await fetchEndpoint(request.path)) }))),
    fetchEndpoint('/lastModified'),
  ]);
  const assembled: Record<keyof typeof sourcePaths, SourcePayloads> = {
    community: { ...EMPTY_SOURCE },
    core: { ...EMPTY_SOURCE },
    arc: { ...EMPTY_SOURCE },
    legacy: { ...EMPTY_SOURCE },
  };
  const warnings: string[] = [];

  for (const response of responses) {
    assembled[response.source][response.type] = payloadRecord(response.data, response.type);
    if (response.warning) warnings.push(response.warning);
  }
  if (manifestResponse.warning) warnings.push(manifestResponse.warning);

  const manifestFiles = asObject(manifestResponse.data.files);
  const communityDates = ['community-ships', 'community-squadrons', 'community-upgrades', 'community-objectives']
    .map((key) => asString(asObject(manifestFiles[key]).lastModified))
    .filter(Boolean)
    .sort();

  return buildCommunityChangelog({
    ...assembled,
    lastModified: communityDates.at(-1),
    warnings,
  });
}
