#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import process from 'node:process';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const verbose = args.has('--verbose');
const engineArg = [...args].find((arg) => arg.startsWith('--engine=')) || '';
const requestedEngine = engineArg ? engineArg.split('=')[1] : '';
const dpiArg = [...args].find((arg) => arg.startsWith('--dpi=')) || '';
const requestedDpi = dpiArg ? Number.parseInt(dpiArg.split('=')[1], 10) : null;
const configArg = [...args].find((arg) => arg.startsWith('--config=')) || '';
const configOverridePath = configArg ? configArg.split('=')[1] : '';
const includeCategoriesArg = [...args].find((arg) => arg.startsWith('--include-categories=')) || '';
const includeUpgradeTypesArg = [...args].find((arg) => arg.startsWith('--include-upgrade-types=')) || '';
const outputHtmlArg = [...args].find((arg) => arg.startsWith('--output-html=')) || '';
const compileLogArg = [...args].find((arg) => arg.startsWith('--compile-log=')) || '';
let ICON_MAP_RUNTIME = {};
let ICON_FONT_ENABLED = true;
const WEB_ASSET_VERSION =
  (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || '')
    .toString()
    .slice(0, 12) || 'rulings-v1';

const emojiMap = {
  accuracy: '🎯',
  attack: '⚔️',
  bomber: '💣',
  brace: '🛡️',
  contain: '⛨',
  crit: '💥',
  damage: '🟥',
  evade: '💨',
  redirect: '↪️',
  salvo: '📡',
  scatter: '✶',
  ship: '🚢',
  squadron: '✈️',
  speed: '➤',
  shield: '🛡',
};

const RULE_SECTION_LABELS = {
  card_text: 'Card Text',
  timing: 'Timing',
  clarifications: 'Clarifications',
  upgrade_interactions: 'Upgrade Interactions',
  squadron_interactions: 'Squadron Interactions',
  objective_interactions: 'Objective Interactions',
  counter_and_salvo_interactions: 'Counter and Salvo Interactions',
  obstacle_interactions: 'Obstacle Interactions',
  deployment_interactions: 'Deployment Interactions',
  campaign_interactions: 'Campaign Interactions',
};

const RULE_SECTION_ALIASES = {
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
  obstacle: 'obstacle_interactions',
  obstacles: 'obstacle_interactions',
  deployment: 'deployment_interactions',
  campaign: 'campaign_interactions',
  card_text: 'card_text',
};

const SECTION_ORDER = [
  'card_text',
  'timing',
  'clarifications',
  'upgrade_interactions',
  'squadron_interactions',
  'objective_interactions',
  'counter_and_salvo_interactions',
  'obstacle_interactions',
  'deployment_interactions',
  'campaign_interactions',
];

const UPGRADE_TYPE_ORDER = [
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
  'superweapon',
];

const defaultConfig = {
  apiBaseUrl: 'https://api.swarmada.wiki',
  backupApiUrl: 'https://api-backup.swarmada.wiki',
  includeCategories: ['objectives', 'damage-cards', 'upgrades', 'ace-squadrons'],
  outputHtml: 'scripts/karm/out/rulings-book.html',
  outputPdf: 'scripts/karm/out/rulings-book.pdf',
  templateCss: 'scripts/karm/template.css',
  pageBackgroundImage: '',
  compileLog: 'scripts/karm/out/compile.log',
  iconsMapSource: 'scripts/karm/icon-map.json',
  iconsMapSourceExternal: '/Users/andrew/Documents/GitHub/armada-list-builder/src/constants/icons.ts',
  fonts: {
    optimaRegular: '/Users/andrew/Library/Fonts/Optima-Regular.ttf',
    optimaItalic: '/Users/andrew/Downloads/armada-fonts/Optima Italic.ttf',
    optimaBold: '/Users/andrew/Downloads/armada-fonts/Optima Bold.TTF',
    aeroMaticsBold: '/Users/andrew/Downloads/aero_matics/Aero Matics Display Bold.ttf',
    aeroMaticsRegular: '/Users/andrew/Downloads/aero-matics.display-regular.ttf',
    teutonFett: '/Users/andrew/Downloads/armada-fonts/TeutonFett.otf',
    revengerLite: '/Users/andrew/Library/Fonts/RevengerLiteBB.ttf',
    iconFont: '/Users/andrew/Downloads/icons.otf',
  },
  chromeExecutable: '',
  staticPages: {
    before: [],
    after: [],
  },
  factionIcons: {
    rebel: '',
    empire: '',
    republic: '',
    separatist: '',
    neutral: '',
  },
  sourceOrder: ['core', 'legacy', 'legacy-beta', 'nexus', 'arc', 'naboo', 'legends'],
  pdfEngine: 'chrome',
  weasyprintExecutable: '',
  pdfDpi: 300,
  includeUpgradeTypes: [],
  excludeSources: ['legacy-alpha', 'legacy-beta', 'arc-beta', 'nexus-experimental'],
};

async function main() {
  const config = await loadConfig();
  if (includeCategoriesArg) {
    config.includeCategories = splitCsv(includeCategoriesArg.split('=')[1]);
  }
  if (includeUpgradeTypesArg) {
    config.includeUpgradeTypes = splitCsv(includeUpgradeTypesArg.split('=')[1]);
  }
  if (outputHtmlArg) {
    config.outputHtml = outputHtmlArg.split('=')[1];
  }
  if (compileLogArg) {
    config.compileLog = compileLogArg.split('=')[1];
  }
  ICON_FONT_ENABLED = Boolean(String(config.fonts?.iconFont || '').trim());
  const iconMap = await loadIconMap(config.iconsMapSource, config.iconsMapSourceExternal);
  const data = await fetchAllData(config);
  const buildResult = buildCards(data, config, iconMap);
  let cards = buildResult.cards;
  if (cards.length === 0) {
    log('No qualifying cards were found from live APIs. Emitting a placeholder page.');
    cards = [buildPlaceholderCard()];
  }

  const webMode = isWebOutput(config);
  const pages = webMode ? null : paginateCards(cards);
  const html = await renderHtml({ pages, cards, config });
  const outputHtmlPath = path.resolve(repoRoot, config.outputHtml);
  const outputPdfPath = path.resolve(repoRoot, config.outputPdf);
  const compileLogPath = path.resolve(repoRoot, config.compileLog);

  await mkdir(path.dirname(outputHtmlPath), { recursive: true });
  await mkdir(path.dirname(outputPdfPath), { recursive: true });
  await mkdir(path.dirname(compileLogPath), { recursive: true });
  await writeFile(outputHtmlPath, html, 'utf8');
  await writeFile(compileLogPath, buildResult.logLines.join('\n') || 'No warnings.\n', 'utf8');

  if (dryRun) {
    log(`Dry run complete. HTML written to ${outputHtmlPath}`);
    return;
  }

  const engine = requestedEngine || config.pdfEngine || 'chrome';
  const effectiveDpi = Number.isFinite(requestedDpi)
    ? clampDpi(requestedDpi)
    : clampDpi(config.pdfDpi);
  if (engine === 'weasyprint') {
    const weasyExecutable = await resolveWeasyExecutable(config.weasyprintExecutable);
    await renderPdfWithWeasyprint(weasyExecutable, outputHtmlPath, outputPdfPath);
  } else {
    const chromeExecutable = await resolveChromeExecutable(config.chromeExecutable);
    await renderPdfWithChrome(chromeExecutable, outputHtmlPath, outputPdfPath, effectiveDpi);
  }

  log(`Generated ${cards.length} entries across ${pages.length} pages.`);
  log(`PDF written to ${outputPdfPath}`);
}

async function loadConfig() {
  const configPath = path.resolve(repoRoot, configOverridePath || 'scripts/karm/config.json');
  try {
    await access(configPath);
    const raw = await readFile(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...defaultConfig,
      ...parsed,
      staticPages: {
        ...defaultConfig.staticPages,
        ...(parsed.staticPages || {}),
      },
      factionIcons: {
        ...defaultConfig.factionIcons,
        ...(parsed.factionIcons || {}),
      },
      fonts: {
        ...defaultConfig.fonts,
        ...(parsed.fonts || {}),
      },
    };
  } catch {
    log('scripts/karm/config.json not found, using defaults.');
    return defaultConfig;
  }
}

async function fetchAllData(config) {
  const result = {
    upgrades: [],
    objectives: [],
    squadrons: [],
    damageCards: [],
  };

  const bases = [config.apiBaseUrl, config.backupApiUrl].filter(Boolean);
  const excludedSources = new Set((config.excludeSources || []).map((source) => String(source || '').toLowerCase()));
  const endpointGroups = await discoverEndpointGroups(bases);
  if (verbose) {
    for (const [group, endpoints] of Object.entries(endpointGroups)) {
      log(`Discovered ${endpoints.length} endpoints for ${group}`);
    }
  }

  for (const [key, endpoints] of Object.entries(endpointGroups)) {
    for (const endpoint of endpoints) {
      for (const base of bases) {
        const url = `${base}${endpoint}`;
        const payload = await tryFetchJson(url);
        if (!payload) {
          continue;
        }

        const source = inferSourceFromEndpoint(endpoint);
        if (excludedSources.has(String(source || '').toLowerCase())) {
          if (verbose) {
            log(`Skipping source ${source}: ${endpoint}`);
          }
          continue;
        }
        const items = extractItemsByKey(key, payload);
        if (items.length === 0) {
          continue;
        }

        result[key].push({ source, endpoint, items });
        if (verbose) {
          log(`Loaded ${items.length} records from ${url}`);
        }
        break;
      }
    }
  }

  return result;
}

async function discoverEndpointGroups(bases) {
  const discoveredFileKeys = new Set();

  for (const base of bases) {
    const manifest = await tryFetchJson(`${base}/lastModified`);
    if (!manifest || typeof manifest !== 'object' || !manifest.files || typeof manifest.files !== 'object') {
      continue;
    }
    for (const key of Object.keys(manifest.files)) {
      discoveredFileKeys.add(key);
    }
  }

  const groups = {
    upgrades: new Set(),
    objectives: new Set(),
    squadrons: new Set(),
    damageCards: new Set(),
  };

  for (const key of discoveredFileKeys) {
    const inferred = inferEndpointFromFileKey(key);
    if (!inferred) continue;
    if (inferred.group === 'upgrades') groups.upgrades.add(inferred.endpoint);
    if (inferred.group === 'objectives') groups.objectives.add(inferred.endpoint);
    if (inferred.group === 'squadrons') groups.squadrons.add(inferred.endpoint);
    if (inferred.group === 'damageCards') groups.damageCards.add(inferred.endpoint);
  }

  return {
    upgrades: [...groups.upgrades],
    objectives: [...groups.objectives],
    squadrons: [...groups.squadrons],
    damageCards: [...groups.damageCards],
  };
}

function inferEndpointFromFileKey(fileKey) {
  const direct = {
    upgrades: { group: 'upgrades', endpoint: '/upgrades/' },
    objectives: { group: 'objectives', endpoint: '/objectives/' },
    squadrons: { group: 'squadrons', endpoint: '/squadrons/' },
    'damage-cards': { group: 'damageCards', endpoint: '/damage-cards/' },
    damagecards: { group: 'damageCards', endpoint: '/damagecards/' },
    'critical-damage-cards': { group: 'damageCards', endpoint: '/critical-damage-cards/' },
    'crit-damage-cards': { group: 'damageCards', endpoint: '/crit-damage-cards/' },
    ships: { group: 'ships', endpoint: '/ships/' },
  };

  if (direct[fileKey]) return direct[fileKey];

  const match = fileKey.match(/^([a-z-]+)-(upgrades|objectives|squadrons|ships|damage-cards|damagecards|critical-damage-cards|crit-damage-cards)$/);
  if (!match) return null;

  const prefix = match[1];
  const category = match[2];
  if (category === 'damage-cards' || category === 'damagecards' || category === 'critical-damage-cards' || category === 'crit-damage-cards') {
    return { group: 'damageCards', endpoint: `/${prefix}/${category}/` };
  }
  return {
    group: category === 'upgrades' ? 'upgrades' : category === 'objectives' ? 'objectives' : category === 'squadrons' ? 'squadrons' : 'ships',
    endpoint: `/${prefix}/${category}/`,
  };
}

function inferSourceFromEndpoint(endpoint) {
  const normalized = String(endpoint || '').replace(/^\/+|\/+$/g, '');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length <= 1) return 'core';
  return parts[0];
}

function isNexusSource(source) {
  const value = String(source || '').toLowerCase();
  return value === 'nexus' || value === 'nexus-experimental';
}

function upgradeTypeToHeaderTitle(type) {
  const normalized = String(type || 'unknown');
  if (normalized === 'weapons-team-offensive-retro') return 'Boarding Teams';
  return normalized
    .split('-')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ') || 'Unknown';
}

function categoryHeaderTitleForNexus(category) {
  if (category === 'nexus-upgrades') return 'Nexus Upgrades';
  if (category === 'nexus-ace-squadrons') return 'Nexus Ace Squadrons';
  return 'Nexus';
}

function extractItemsByKey(groupKey, payload) {
  if (groupKey === 'damageCards') {
    const candidates = [payload['damage-cards'], payload.damageCards, payload.damage_cards, payload.cards, payload];
    for (const candidate of candidates) {
      const list = normalizeCandidateCollection(candidate);
      if (list.length > 0) return list;
    }
    return [];
  }

  const propMap = {
    upgrades: 'upgrades',
    objectives: 'objectives',
    squadrons: 'squadrons',
  };

  const mapped = payload[propMap[groupKey]] ?? payload;
  return normalizeCandidateCollection(mapped);
}

function normalizeCandidateCollection(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v) => v && typeof v === 'object');
  if (typeof value === 'object') {
    return Object.values(value).filter((v) => v && typeof v === 'object');
  }
  return [];
}

function buildCards(data, config, iconMap) {
  const cards = [];
  const logLines = [];

  if (config.includeCategories.includes('upgrades')) {
    for (const group of data.upgrades) {
      for (const item of group.items) {
        const card = buildUpgradeCard(item, group.source, iconMap);
        if (card) cards.push(card);
      }
    }
  }

  if (config.includeCategories.includes('objectives')) {
    for (const group of data.objectives) {
      for (const item of group.items) {
        const card = buildObjectiveCard(item, group.source, iconMap);
        if (card) cards.push(card);
      }
    }
  }

  if (config.includeCategories.includes('ace-squadrons')) {
    for (const group of data.squadrons) {
      for (const item of group.items) {
        const card = buildAceSquadronCard(item, group.source, iconMap, logLines);
        if (card) cards.push(card);
      }
    }
  }

  if (config.includeCategories.includes('damage-cards')) {
    for (const group of data.damageCards) {
      for (const item of group.items) {
        const card = buildDamageCard(item, group.source, iconMap);
        if (card) cards.push(card);
      }
    }
  }

  const requestedUpgradeTypes = new Set((config.includeUpgradeTypes || []).map((type) => normalizeUpgradeType(type)));
  if (requestedUpgradeTypes.size > 0) {
    for (let i = cards.length - 1; i >= 0; i -= 1) {
      const card = cards[i];
      if (card.category !== 'upgrades' && card.category !== 'nexus-upgrades') continue;
      if (!requestedUpgradeTypes.has(normalizeUpgradeType(card.upgradeType))) {
        cards.splice(i, 1);
      }
    }
  }

  const deduped = dedupeCards(cards);
  deduped.sort((a, b) => sortCard(a, b));
  const withHeaders = insertDynamicHeaderCards(deduped, iconMap);
  const withAnchors = assignAnchorIds(withHeaders);
  return { cards: withAnchors, logLines };
}

function buildPlaceholderCard() {
  return {
    category: 'objectives',
    source: 'core',
    name: 'No Rulings Data Found',
    image: '',
    factions: ['neutral'],
    cardText:
      'The generator could not fetch qualifying rulings data from the configured API endpoints.\\n\\n' +
      '- Check API URLs in scripts/karm/config.json\\n' +
      '- Verify network connectivity\\n' +
      '- Ensure Chrome path is configured for PDF output',
    details: 'generator notice',
    keywords: ['diagnostic'],
    rules: [
      {
        heading: 'Next Steps',
        text: '- Confirm apiBaseUrl and backupApiUrl\\n- Re-run `npm run rulings:pdf -- --verbose`\\n- Add fixed cover/back matter pages under scripts/karm/static/',
      },
    ],
  };
}

function dedupeCards(cards) {
  const seen = new Set();
  const deduped = [];
  for (const card of cards) {
    const key = `${card.category}:${card.source}:${card.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(card);
  }
  return deduped;
}

function sortCard(a, b) {
  const categoryRank = {
    objectives: 0,
    'damage-cards': 1,
    upgrades: 2,
    'nexus-upgrades': 3,
    'ace-squadrons': 4,
    'nexus-ace-squadrons': 5,
    header: 6,
  };
  const cat = (categoryRank[a.category] ?? 99) - (categoryRank[b.category] ?? 99);
  if (cat !== 0) return cat;
  if (a.category === 'objectives' && b.category === 'objectives') {
    const typeCmp = normalizeObjectiveType(a.type).localeCompare(normalizeObjectiveType(b.type));
    if (typeCmp !== 0) return typeCmp;
    return a.name.localeCompare(b.name);
  }
  if ((a.category === 'upgrades' || a.category === 'nexus-upgrades') && (b.category === a.category)) {
    const typeCmp = getUpgradeTypeSortIndex(a.upgradeType) - getUpgradeTypeSortIndex(b.upgradeType);
    if (typeCmp !== 0) return typeCmp;
    if (isFactionSortedUpgradeType(a.upgradeType) && isFactionSortedUpgradeType(b.upgradeType)) {
      const factionCmp = normalizeFaction(a.primaryFaction).localeCompare(normalizeFaction(b.primaryFaction));
      if (factionCmp !== 0) return factionCmp;
    }
    return a.name.localeCompare(b.name);
  }
  if ((a.category === 'ace-squadrons' || a.category === 'nexus-ace-squadrons') && (b.category === a.category)) {
    const factionCmp = normalizeFaction(a.primaryFaction).localeCompare(normalizeFaction(b.primaryFaction));
    if (factionCmp !== 0) return factionCmp;
    return a.name.localeCompare(b.name);
  }
  return a.name.localeCompare(b.name);
}

function getUpgradeTypeSortIndex(type) {
  const idx = UPGRADE_TYPE_ORDER.indexOf(type || '');
  return idx === -1 ? 999 : idx;
}

function normalizeUpgradeType(type) {
  const normalized = String(type || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .trim();
  return normalized || 'unknown';
}

function upgradeTypeToIconKey(type) {
  if (type === 'weapons-team-offensive-retro') return 'weapons_team';
  return String(type || '').replace(/-/g, '_');
}

function normalizeObjectiveType(type) {
  return String(type || 'zzzz').toLowerCase();
}

function normalizeFaction(faction) {
  return String(faction || 'neutral').toLowerCase();
}

function isFactionSortedUpgradeType(type) {
  return type === 'commander' || type === 'officer';
}

function insertDynamicHeaderCards(cards, iconMap) {
  const output = [];
  const insertedCategoryHeaders = new Set();
  const insertedUpgradeTypeHeaders = new Set();
  for (const card of cards) {
    if ((card.category === 'nexus-upgrades' || card.category === 'nexus-ace-squadrons') && !insertedCategoryHeaders.has(card.category)) {
      output.push({
        category: 'header',
        source: '',
        name: categoryHeaderTitleForNexus(card.category),
        image: '',
        factions: [],
        cardText: '',
        details: '',
        keywords: [],
        rules: [],
        sections: [],
        headerIcon: card.category === 'nexus-upgrades' ? (iconMap.nexus || '') : (iconMap.squadron || ''),
      });
      insertedCategoryHeaders.add(card.category);
    }

    if ((card.category === 'upgrades' || card.category === 'nexus-upgrades') && card.upgradeType) {
      const key = `${card.category}:${card.upgradeType}`;
      if (!insertedUpgradeTypeHeaders.has(key)) {
        const typeTitle = upgradeTypeToHeaderTitle(card.upgradeType);
        const typeIcon = iconMap[upgradeTypeToIconKey(card.upgradeType)] || '';
        output.push({
          category: 'header',
          source: '',
          name: typeTitle,
          image: '',
          factions: [],
          cardText: '',
          details: '',
          keywords: [],
          rules: [],
          sections: [],
          headerIcon: typeIcon,
        });
        insertedUpgradeTypeHeaders.add(key);
      }
    }

    output.push(card);
  }
  return output;
}

function buildUpgradeCard(item, source, iconMap) {
  const rules = normalizeRules(item.rules, item.rulings);
  if (rules.length === 0) return null;
  const factions = Array.isArray(item.faction) ? item.faction.filter((f) => typeof f === 'string') : ['neutral'];
  const upgradeType = normalizeUpgradeType(item.type);
  const typeIconChar = iconMap[upgradeTypeToIconKey(upgradeType)] || '';

  return {
    category: isNexusSource(source) ? 'nexus-upgrades' : 'upgrades',
    source,
    name: stringValue(item.name, 'Unknown Upgrade'),
    image: stringValue(item.cardimage, ''),
    factions,
    cardText: stringValue(item.ability, ''),
    details: `${numberValue(item.points, 0)} points`,
    keywords: [],
    upgradeType,
    primaryFaction: factions[0] || 'neutral',
    type: upgradeType,
    titleSuffix: typeIconChar ? ` ${typeIconChar}` : '',
    rules,
  };
}

function buildObjectiveCard(item, source) {
  const rules = normalizeRules(item.rules, item.rulings);
  const summaryParts = [];

  if (item.setup) summaryParts.push(`**Setup:** ${stringValue(item.setup, '')}`);
  if (item.special_rule) summaryParts.push(`**Special Rule:** ${stringValue(item.special_rule, '')}`);
  if (item.end_of_round) summaryParts.push(`**End of Round:** ${stringValue(item.end_of_round, '')}`);
  if (item.end_of_game) summaryParts.push(`**End of Game:** ${stringValue(item.end_of_game, '')}`);
  if (item.errata) summaryParts.push(`**Errata:** ${stringValue(item.errata, '')}`);

  if (rules.length === 0 && summaryParts.length === 0) return null;

  return {
    category: 'objectives',
    source,
    name: stringValue(item.name, 'Unknown Objective'),
    image: stringValue(item.cardimage, ''),
    factions: ['neutral'],
    cardText: summaryParts.join('\n\n'),
    details: stringValue(item.type, 'objective'),
    keywords: [],
    type: normalizeObjectiveType(item.type),
    primaryFaction: 'neutral',
    rules,
  };
}

function buildAceSquadronCard(item, source, iconMap, logLines) {
  if (String(source || '').toLowerCase() === 'legends') {
    return null;
  }
  const isAce = item.ace === true;
  if (!isAce) {
    if (item.unique) {
      logLines.push(`[warn] unique but not ace: ${stringValue(item.name, 'unknown')} (${source})`);
    }
    return null;
  }
  const rules = normalizeRules(item.rules, item.rulings);

  const abilities = item.abilities && typeof item.abilities === 'object' ? item.abilities : {};
  const abilityKeywords = Object.entries(abilities)
    .filter(([, value]) => value === true || (typeof value === 'number' && value > 0))
    .map(([name, value]) => {
      if (typeof value === 'number') return `${name.replace(/-/g, ' ')} ${value}`;
      return name.replace(/-/g, ' ');
    });

  return {
    category: isNexusSource(source) ? 'nexus-ace-squadrons' : 'ace-squadrons',
    source,
    name: stringValue(item['ace-name'] || item.name, 'Unknown Ace'),
    image: stringValue(item.cardimage, ''),
    factions: [stringValue(item.faction, 'neutral')],
    cardText: stringValue(item.ability, ''),
    details: `${numberValue(item.points, 0)} points`,
    keywords: ['Unique', ...abilityKeywords],
    type: 'ace-squadron',
    primaryFaction: stringValue(item.faction, 'neutral'),
    titleSuffix: iconMap[normalizeFaction(item.faction)] || '',
    rules,
  };
}

function buildDamageCard(item, source) {
  const rules = normalizeRules(item.rules, item.rulings || item.clarification || item.clarifications);
  if (rules.length === 0) return null;

  return {
    category: 'damage-cards',
    source,
    name: stringValue(item.name || item.title, 'Unknown Damage Card'),
    image: stringValue(item.cardimage || item.image, ''),
    factions: ['neutral'],
    cardText: stringValue(item.card_text || item.text || item.ability, ''),
    details: 'damage card',
    keywords: [],
    type: 'damage',
    primaryFaction: 'neutral',
    rules,
  };
}

function normalizeRules(structured, fallback) {
  const result = collectRuleEntries(structured);
  if (result.length > 0) return mergeRulesBySection(result);

  const fallbackText = stringValue(fallback, '');
  if (!fallbackText) return [];

  return [{ section: 'clarifications', text: fallbackText, source: '', date: '', version: '' }];
}

function collectRuleEntries(input, headingHint = 'Clarifications') {
  if (!input) return [];

  if (typeof input === 'string') {
    const text = stringValue(input, '');
    return text ? [{ section: resolveSectionKey(headingHint), text, source: '', date: '', version: '' }] : [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((entry) => collectRuleEntries(entry, headingHint));
  }

  if (typeof input === 'object') {
    const obj = input;
    const directText = stringValue(obj.text || obj.body || obj.value || obj.clarification || obj.ruling, '');
    const section = resolveSectionKey(obj.type || obj.section || obj.heading || headingHint);
    const source = stringValue(obj.source, '');
    const date = stringValue(obj.date, '');
    const version = stringValue(obj.version, '');
    const collected = [];

    if (directText) {
      collected.push({ section, text: directText, source, date, version });
    }

    for (const [key, value] of Object.entries(obj)) {
      if ([
        'text',
        'body',
        'value',
        'clarification',
        'ruling',
        'type',
        'section',
        'heading',
        'source',
        'date',
        'version',
        'uid',
        'id',
        '_id',
      ].includes(key)) {
        continue;
      }
      const nestedSection = resolveSectionKey(key || headingHint);
      collected.push(...collectRuleEntries(value, nestedSection));
    }

    return collected;
  }

  return [];
}

function mergeRulesBySection(rules) {
  const grouped = new Map();

  for (const rule of rules) {
    const key = rule.section;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push({
      text: rule.text,
      source: rule.source || '',
      date: rule.date || '',
      version: rule.version || '',
    });
  }

  const merged = [];
  for (const [section, rows] of grouped.entries()) {
    const seen = new Set();
    for (const row of rows) {
      const dedupeKey = `${row.text}|${row.source}|${row.date}|${row.version}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      merged.push({
        section,
        text: row.text,
        source: row.source,
        date: row.date,
        version: row.version,
      });
    }
  }
  return merged;
}

function resolveSectionKey(raw) {
  const normalized = String(raw || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return 'clarifications';
  const canonical = normalized.replace(/\s+/g, '_');
  if (RULE_SECTION_LABELS[canonical]) return canonical;
  return RULE_SECTION_ALIASES[canonical] || RULE_SECTION_ALIASES[normalized] || 'clarifications';
}

function paginateCards(cards) {
  // Keep a safety buffer for print/render engine differences so cards do not clip at the bottom.
  const pageUsableHeight = 2520;
  const pages = [];
  let currentPage = [];
  let currentHeight = 0;

  for (const card of cards) {
    if (card.category === 'header') {
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      pages.push([card]);
      currentPage = [];
      currentHeight = 0;
      continue;
    }
    const height = estimateCardHeight(card);
    if (currentPage.length > 0 && currentHeight + height > pageUsableHeight) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }
    currentPage.push(card);
    currentHeight += height;
  }

  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
}

function estimateCardHeight(card) {
  const baseTopBlock = 560; // image row + fixed card chrome
  const rules = Array.isArray(card.rules) ? card.rules : [];
  const sectionEntryCount = new Map();

  for (const rule of rules) {
    const sectionKey = resolveSectionKey(rule.section);
    if (card.category === 'upgrades' && (sectionKey === 'card_text' || sectionKey === 'timing')) {
      continue;
    }
    sectionEntryCount.set(sectionKey, (sectionEntryCount.get(sectionKey) || 0) + 1);
  }

  let sectionCount = sectionEntryCount.size;
  if (card.category !== 'upgrades' && (card.cardText || '').trim()) {
    sectionCount += 1; // Card Text is rendered as a section outside upgrades.
  }

  const cardTextLines = estimateLineCount(card.cardText || '', card.category === 'upgrades' ? 62 : 92);
  const rulesTextLength = rules.reduce((sum, r) => sum + String(r.text || '').length, 0);
  const rulesLines = estimateLineCountByLength(rulesTextLength, 96);
  const sectionHeadingsHeight = sectionCount * 58;
  const bulletSpacing = rules.length * 14;
  const lineHeightTotal = Math.max(cardTextLines, 0) * 34 + Math.max(rulesLines, 0) * 34;
  const upgradeSummaryBoost = card.category === 'upgrades' ? 130 : 0;
  const keywordBoost = Array.isArray(card.keywords) && card.keywords.length > 0 ? 44 : 0;
  const hasFootnotes = rules.some((r) => r.source || r.date || r.version);
  const footnoteBoost = hasFootnotes ? 44 : 0;
  const safetyPadding = 72;

  return (
    baseTopBlock +
    sectionHeadingsHeight +
    bulletSpacing +
    lineHeightTotal +
    upgradeSummaryBoost +
    keywordBoost +
    footnoteBoost +
    safetyPadding
  );
}

function estimateLineCount(text, charsPerLine) {
  const normalized = String(text || '').trim();
  if (!normalized) return 0;
  const paragraphs = normalized
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return paragraphs.reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
}

function estimateLineCountByLength(totalChars, charsPerLine) {
  if (!Number.isFinite(totalChars) || totalChars <= 0) return 0;
  return Math.ceil(totalChars / charsPerLine);
}

async function renderHtml({ pages, cards, config }) {
  const cssPath = path.resolve(repoRoot, config.templateCss);
  const css = await readFile(cssPath, 'utf8');
  const fontFaces = buildFontFaceCss(config.fonts, config);
  const webMode = isWebOutput(config);

  const beforePages = await readStaticPages(config.staticPages.before || []);
  const afterPages = await readStaticPages(config.staticPages.after || []);

  let cardsHtml;
  if (pages) {
    // Paginated mode (PDF output)
    cardsHtml = pages
      .map((pageCards, idx) => {
        const body = pageCards
          .map((card) => (card.category === 'header' ? renderHeaderCard(card) : renderCard(card)))
          .join('\n');
        const pageNumber = idx + 1;
        return `
<div class="karm-page-shell">
  <section class="karm-page">
    <div class="page-body">${body}</div>
    ${pageCards.length === 1 && pageCards[0].category === 'header' ? '' : `<div class="page-number">${pageNumber}</div>`}
  </section>
</div>`;
      })
      .join('\n');
  } else {
    // Continuous mode (web output)
    const rendered = cards.map((card, idx) => {
      const html = card.category === 'header' ? renderHeaderCard(card) : renderCard(card);
      const divider = idx < cards.length - 1 && card.category !== 'header' ? '\n<hr class="card-divider" />' : '';
      return html + divider;
    });
    cardsHtml = `<div class="karm-continuous">${rendered.join('\n')}</div>`;
  }

  const pageBackground = config.pageBackgroundImage
    ? `url('${withAssetVersion(toAssetUrl(path.resolve(repoRoot, config.pageBackgroundImage), config), config)}')`
    : 'none';
  const webNav = webMode ? renderWebNav() : '';
  const preloadLinks = webMode ? buildPreloadLinks(config) : '';
  const bodyClass = webMode ? ' class="karm-web"' : '';
  const scaleScript = webMode
    ? ''
    : `<script>
      (function () {
        const PAGE_WIDTH = 2194;
        const GUTTER = 24;
        function updateScale() {
          const usable = Math.max(320, window.innerWidth - GUTTER);
          const scale = Math.min(1, usable / PAGE_WIDTH);
          document.documentElement.style.setProperty('--page-scale', String(scale));
        }
        updateScale();
        window.addEventListener('resize', updateScale);
      })();
    </script>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>KARM Rulings Book</title>
    ${preloadLinks}
    <style>
      :root { --page-background: ${pageBackground}; }
      ${fontFaces}
      ${css}
    </style>
  </head>
  <body${bodyClass}>
    ${webNav}
    <div class="karm-book">
      ${beforePages}
      ${cardsHtml}
      ${afterPages}
    </div>
    ${scaleScript}
    <!-- Generated cards: ${cards.length} -->
  </body>
</html>`;
}

function buildPreloadLinks(config) {
  const fonts = config.fonts || {};
  const entries = [
    fonts.optimaRegular,
    fonts.optimaItalic,
    fonts.optimaBold,
    fonts.revengerLite,
    fonts.teutonFett,
    fonts.iconFont,
  ].filter(Boolean);

  return entries
    .map((file) => {
      const url = withAssetVersion(toAssetUrl(file, config), config);
      const lower = String(file).toLowerCase();
      const format = lower.endsWith('.otf')
        ? 'opentype'
        : lower.endsWith('.woff2')
          ? 'woff2'
          : lower.endsWith('.woff')
            ? 'woff'
            : 'truetype';
      const crossorigin = format === 'woff' || format === 'woff2' ? ' crossorigin' : '';
      return `<link rel="preload" href="${url}" as="font" type="font/${format}"${crossorigin} />`;
    })
    .join('\n    ');
}

function renderWebNav() {
  const links = [];
  links.push(`<a href="/rulings/objectives.html" class="toc-link">Objectives</a>`);
  links.push(`<a href="/rulings/damage-cards.html" class="toc-link">Damage Cards</a>`);
  links.push(`<a href="/rulings/upgrades.html" class="toc-link">Upgrades</a>`);
  links.push(`<a href="/rulings/squadrons.html" class="toc-link">Ace Squadrons</a>`);
  links.push(`<a href="/rulings/upgrades/commander.html" class="toc-link">Commander</a>`);
  links.push(`<a href="/rulings/upgrades/officer.html" class="toc-link">Officer</a>`);
  links.push(`<a href="/rulings/upgrades/weapons-team-offensive-retro.html" class="toc-link">Boarding Teams</a>`);

  return `
<button type="button" class="toc-fab" aria-label="Open rulings menu" onclick="document.body.classList.toggle('toc-open')">
  <span class="hamburger" aria-hidden="true"><span></span><span></span><span></span></span>
</button>
<aside class="toc-drawer" aria-label="Rulings navigation">
  <div class="toc-title">Rulings</div>
  ${links.join('\n')}
</aside>`;
}

async function readStaticPages(files) {
  const rendered = [];
  for (const entry of files) {
    const resolved = path.resolve(repoRoot, entry);
    try {
      const html = await readFile(resolved, 'utf8');
      rendered.push(`<section class="karm-page"><div class="karm-static-page">${html}</div></section>`);
    } catch (error) {
      log(`Skipping static page ${entry}: ${error.message}`);
    }
  }
  return rendered.join('\n');
}

async function loadIconMap(localMapPath, externalMapPath) {
  const map = {};
  try {
    const localPath = path.resolve(repoRoot, localMapPath);
    try {
      const localRaw = await readFile(localPath, 'utf8');
      const parsed = JSON.parse(localRaw);
      if (parsed && typeof parsed === 'object') {
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof val === 'string' && val.length > 0) {
            map[String(key).toLowerCase()] = val;
          }
        }
      }
    } catch {
      // Local map is optional fallback.
    }

    if (Object.keys(map).length === 0 && externalMapPath) {
      const raw = await readFile(externalMapPath, 'utf8');
      const objectMatch = raw.match(/ICON_MAP\s*=\s*{([\s\S]*?)}\s*as const/);
      if (objectMatch) {
        const lines = objectMatch[1].split('\n');
        for (const line of lines) {
          const m = line.match(/^\s*([a-z0-9_]+)\s*:\s*'\\u([0-9A-Fa-f]{4})'/);
          if (!m) continue;
          const key = m[1].toLowerCase();
          map[key] = String.fromCharCode(parseInt(m[2], 16));
        }
      }
    }

    ICON_MAP_RUNTIME = map;
    if (verbose) log(`Loaded ${Object.keys(map).length} icon glyph mappings`);
    return map;
  } catch (error) {
    if (verbose) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Icon map load failed: ${message}`);
    }
    ICON_MAP_RUNTIME = map;
    return map;
  }
}

function buildFontFaceCss(fonts, config) {
  const rules = [];
  const pushFace = (name, file, weight = '400', style = 'normal') => {
    if (!file) return;
    const lower = String(file).toLowerCase();
    const format = lower.endsWith('.otf')
      ? 'opentype'
      : lower.endsWith('.woff2')
        ? 'woff2'
        : lower.endsWith('.woff')
          ? 'woff'
          : 'truetype';
    const srcUrl = withAssetVersion(toAssetUrl(file, config), config);
    rules.push(`
@font-face {
  font-family: '${name}';
  src: url('${srcUrl}') format('${format}');
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`);
  };

  pushFace('OptimaCustom', fonts?.optimaRegular, '400', 'normal');
  pushFace('OptimaCustom', fonts?.optimaItalic, '400', 'italic');
  pushFace('OptimaCustom', fonts?.optimaBold, '700', 'normal');
  pushFace('AeroMaticsDisplay', fonts?.aeroMaticsRegular, '400', 'normal');
  pushFace('AeroMaticsDisplay', fonts?.aeroMaticsBold, '700', 'normal');
  pushFace('TeutonFett', fonts?.teutonFett, '400', 'normal');
  pushFace('RevengerLite', fonts?.revengerLite, '400', 'normal');
  pushFace('Icons', fonts?.iconFont, '400', 'normal');
  pushFace('ArmadaIcons', fonts?.iconFont, '400', 'normal');
  return rules.join('\n');
}

function renderCard(card) {
  const titleSuffixIcon = ICON_FONT_ENABLED && card.titleSuffix
    ? `<span class="icon-font">${escapeHtml(card.titleSuffix)}</span>`
    : '';
  const titleIcons = [titleSuffixIcon]
    .filter(Boolean)
    .join(' ');

  const isSquadronCard = card.category === 'ace-squadrons' || card.category === 'nexus-ace-squadrons';
  const keywordHtml = card.keywords.length
    ? isSquadronCard
      ? `<div class="card-keywords squadron-keywords"><span class="card-keyword-label">Keywords:</span><span class="squadron-keyword-values">${card.keywords.map((value) => `<span class="squadron-keyword-token">${escapeHtml(value)}</span>`).join(', ')}</span></div>`
      : `<div class="card-keywords"><span class="card-keyword-label">Keywords:</span>${escapeHtml(card.keywords.join(', '))}</div>`
    : '';

  const sectionBundle = buildSectionBundle(card);
  const rulesHtml = sectionBundle.sectionsHtml;
  const footnotesHtml = sectionBundle.footnotesHtml;
  const topSummary = renderTopSummary(card, sectionBundle.sectionEntries);
  const topBody = isSquadronCard
    ? `${keywordHtml}${topSummary}`
    : `${topSummary}${keywordHtml}`;

  const imageHtml = card.image
    ? `<img class="card-image" src="${escapeAttribute(card.image)}" alt="${escapeAttribute(card.name)}" />`
    : `<div class="card-image fallback">No image</div>`;

  return `
<article class="karm-card" id="${escapeAttribute(card.anchorId || '')}">
  <div class="card-top">
    <div class="card-image-wrap">${imageHtml}</div>
    <div class="card-main">
      <h2 class="card-title">${escapeHtml(card.name)} ${titleIcons}</h2>
      ${topBody}
    </div>
  </div>
  <div class="card-bottom card-rulings">${rulesHtml}</div>
  ${footnotesHtml}
</article>`;
}

function renderHeaderCard(card) {
  const iconHtml = ICON_FONT_ENABLED && card.headerIcon
    ? `<span class="icon-font">${escapeHtml(card.headerIcon)}</span>`
    : '';
  return `
<article class="karm-card karm-header-card" id="${escapeAttribute(card.anchorId || '')}">
  <div class="section-header-title">${escapeHtml(card.name)} ${iconHtml}</div>
</article>`;
}

function buildSectionBundle(card) {
  const sections = new Map();
  if (card.cardText) {
    sections.set('card_text', [{ text: card.cardText, footnote: null }]);
  }

  const footnotes = [];
  const footnoteKeyToIndex = new Map();

  for (const rule of card.rules || []) {
    const sectionKey = resolveSectionKey(rule.section);
    if (!sections.has(sectionKey)) sections.set(sectionKey, []);
    const footnoteLabel = [rule.source, rule.date, rule.version].filter(Boolean).join(' | ');
    let footnoteIndex = null;
    if (footnoteLabel) {
      if (!footnoteKeyToIndex.has(footnoteLabel)) {
        footnotes.push(footnoteLabel);
        footnoteKeyToIndex.set(footnoteLabel, footnotes.length);
      }
      footnoteIndex = footnoteKeyToIndex.get(footnoteLabel);
    }
    sections.get(sectionKey).push({
      text: rule.text,
      footnote: footnoteIndex,
    });
  }

  const sectionHtmlParts = [];
  const skipInBody =
    card.category === 'upgrades'
      ? new Set(['card_text', 'timing'])
      : card.category === 'objectives'
        ? new Set(['card_text'])
        : card.category === 'ace-squadrons' || card.category === 'nexus-ace-squadrons'
          ? new Set(['card_text', 'timing'])
        : new Set();
  for (const sectionKey of SECTION_ORDER) {
    if (skipInBody.has(sectionKey)) continue;
    const entries = sections.get(sectionKey) || [];
    if (entries.length === 0) continue;
    const content =
      sectionKey === 'card_text'
        ? entries
            .map((entry) => `<div class="card-text-content">${markdownishToHtml(entry.text)}</div>`)
            .join('')
        : `<ul>${entries
            .map((entry) => {
              const suffix = entry.footnote ? ` <span class="footnote-ref">[${entry.footnote}]</span>` : '';
              return `<li>${markdownishToHtmlInline(entry.text)}${suffix}</li>`;
            })
            .join('')}</ul>`;
    sectionHtmlParts.push(`
<div class="ruling-section">
  <h3 class="ruling-heading">${RULE_SECTION_LABELS[sectionKey]}</h3>
  <div class="ruling-content">${content}</div>
</div>`);
  }

  const footnotesHtml = footnotes.length
    ? `<div class="ruling-footnotes">${footnotes.map((note, idx) => `<div>[${idx + 1}] ${escapeHtml(note)}</div>`).join('')}</div>`
    : '';

  return {
    sectionsHtml: sectionHtmlParts.join('\n'),
    footnotesHtml,
    sectionEntries: sections,
  };
}

function renderUpgradeTopSummary(sectionEntries) {
  const cardTextEntries = sectionEntries.get('card_text') || [];
  const timingEntries = sectionEntries.get('timing') || [];
  const blocks = [];

  if (cardTextEntries.length > 0) {
    blocks.push(`
<div class="top-summary-block">
  <div class="top-summary-label">Card Text</div>
  <div class="top-summary-text">${markdownishToHtml(cardTextEntries[0].text)}</div>
</div>`);
  }

  if (timingEntries.length > 0) {
    const timingText = timingEntries
      .map((entry) => markdownishToHtmlInline(entry.text))
      .join('<br/>');
    blocks.push(`
<div class="top-summary-block">
  <div class="top-summary-label">Timing</div>
  <div class="top-summary-text">${timingText}</div>
</div>`);
  }

  if (blocks.length === 0) return '';
  return `<div class="top-summary">${blocks.join('')}</div>`;
}

function renderObjectiveTopSummary(sectionEntries) {
  const cardTextEntries = sectionEntries.get('card_text') || [];
  if (cardTextEntries.length === 0) return '';

  return `<div class="top-summary">
<div class="top-summary-block">
  <div class="top-summary-label">Card Text</div>
  <div class="top-summary-text">${markdownishToHtml(cardTextEntries[0].text)}</div>
</div>
</div>`;
}

function renderTopSummary(card, sectionEntries) {
  if (card.category === 'upgrades') return renderUpgradeTopSummary(sectionEntries);
  if (card.category === 'objectives') return renderObjectiveTopSummary(sectionEntries);
  if (card.category === 'ace-squadrons' || card.category === 'nexus-ace-squadrons') return renderUpgradeTopSummary(sectionEntries);
  return '';
}

function markdownishToHtml(input) {
  const text = applyEmojiShortcodes(decodeEscapedSequences(String(input || '')));
  const lines = text.split(/\r?\n/);
  const out = [];
  let inList = false;
  let inQuote = false;

  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  const closeQuote = () => {
    if (inQuote) {
      out.push('</blockquote>');
      inQuote = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      closeList();
      closeQuote();
      continue;
    }

    if (line.startsWith('>')) {
      closeList();
      if (!inQuote) {
        out.push('<blockquote>');
        inQuote = true;
      }
      out.push(`<p>${inlineMarkup(line.replace(/^>\s?/, ''))}</p>`);
      continue;
    }

    closeQuote();

    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineMarkup(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${inlineMarkup(line)}</p>`);
  }

  closeList();
  closeQuote();

  return out.join('');
}

function inlineMarkup(line) {
  let safe = escapeHtml(line);
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/(^|\s)\*(.+?)\*(?=\s|$)/g, '$1<em>$2</em>');
  safe = safe.replace(/(^|\s)_(.+?)_(?=\s|$)/g, '$1<em>$2</em>');
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
  safe = safe.replace(/:([a-z0-9_-]+):/gi, (_, token) => `<span class="icon-font">${escapeHtml(iconGlyphForToken(token))}</span>`);
  return safe;
}

function applyEmojiShortcodes(text) {
  return text.replace(/:([a-z0-9_-]+):/gi, (_, token) => emojiMap[token.toLowerCase()] || `:${token}:`);
}

function markdownishToHtmlInline(input) {
  const text = decodeEscapedSequences(String(input || '')).trim();
  return inlineMarkup(text);
}

function iconGlyphForToken(token) {
  const lower = token.toLowerCase();
  const mapped = ICON_MAP_RUNTIME[lower] || '';
  if (ICON_FONT_ENABLED && mapped) return mapped;
  if (mapped && isPrivateUseGlyph(mapped)) {
    return emojiMap[lower] || `:${token}:`;
  }
  return mapped || emojiMap[lower] || `:${token}:`;
}

function isPrivateUseGlyph(char) {
  if (!char) return false;
  const code = char.codePointAt(0) || 0;
  return (
    (code >= 0xe000 && code <= 0xf8ff) ||
    (code >= 0xf0000 && code <= 0xffffd) ||
    (code >= 0x100000 && code <= 0x10fffd)
  );
}

async function resolveChromeExecutable(configured) {
  const candidates = [
    configured,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error(
    'Could not find a Chrome/Chromium executable. Set scripts/karm/config.json chromeExecutable or CHROME_PATH.'
  );
}

async function resolveWeasyExecutable(configured) {
  const candidates = [
    configured,
    process.env.WEASYPRINT_PATH,
    'weasyprint',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === 'weasyprint') return candidate;
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return 'weasyprint';
}

async function renderPdfWithChrome(chromeExecutable, htmlPath, pdfPath, dpi = 300) {
  const htmlUrl = toFileUrl(htmlPath);
  const scaleFactor = (dpi / 96).toFixed(4);

  const chromeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--force-device-scale-factor=${scaleFactor}`,
    '--print-to-pdf-no-header',
    `--print-to-pdf=${pdfPath}`,
    htmlUrl,
  ];

  if (verbose) {
    log(`Running: ${chromeExecutable} ${chromeArgs.join(' ')}`);
  }

  await execFileAsync(chromeExecutable, chromeArgs, { maxBuffer: 1024 * 1024 * 20 });
}

async function renderPdfWithWeasyprint(weasyExecutable, htmlPath, pdfPath) {
  const args = ['--presentational-hints', htmlPath, pdfPath];
  if (verbose) {
    log(`Running: ${weasyExecutable} ${args.join(' ')}`);
  }
  await execFileAsync(weasyExecutable, args, { maxBuffer: 1024 * 1024 * 20 });
}

function toFileUrl(filePath) {
  return pathToFileURL(path.resolve(filePath)).href;
}

function toAssetUrl(filePath, config) {
  const resolved = path.resolve(filePath);
  if (isWebOutput(config)) {
    const publicRoot = path.resolve(repoRoot, 'public');
    if (resolved === publicRoot || resolved.startsWith(`${publicRoot}${path.sep}`)) {
      const rel = path.relative(publicRoot, resolved);
      const parts = rel.split(path.sep).filter(Boolean).map(encodeURIComponent);
      return `/${parts.join('/')}`;
    }
  }
  return toFileUrl(resolved);
}

function isWebOutput(config) {
  const outputHtml = String(config?.outputHtml || '');
  return outputHtml === 'public/rulings/index.html' || outputHtml.startsWith('public/');
}

function withAssetVersion(url, config) {
  if (!isWebOutput(config)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${WEB_ASSET_VERSION}`;
}

function clampDpi(value) {
  if (!Number.isFinite(value)) return 300;
  return Math.max(72, Math.min(600, Math.round(value)));
}

function assignAnchorIds(cards) {
  const seen = new Set();
  return cards.map((card, idx) => {
    const base = slugify(card.name || card.category || 'entry');
    let candidate = `${base}-${idx + 1}`;
    while (seen.has(candidate)) candidate = `${candidate}-x`;
    seen.add(candidate);
    return { ...card, anchorId: candidate };
  });
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entry';
}

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

async function tryFetchJson(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) {
      if (verbose) log(`Fetch failed ${response.status} ${response.statusText}: ${url}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    if (verbose) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Fetch error: ${url} -> ${message}`);
    }
    return null;
  }
}

function stringValue(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const trimmed = decodeEscapedSequences(value).trim();
  return trimmed || fallback;
}

function numberValue(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

function log(message) {
  process.stdout.write(`[karm-pdf] ${message}\n`);
}

function decodeEscapedSequences(value) {
  return String(value).replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[karm-pdf] ERROR: ${message}\n`);
  if (verbose && error instanceof Error && error.stack) {
    process.stderr.write(`${error.stack}\n`);
  }
  process.exit(1);
});
