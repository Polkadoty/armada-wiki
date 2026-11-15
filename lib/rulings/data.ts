import { cache } from 'react';
import { fetchCatalogDataset } from '@/lib/cardApi';
import displayNameOverrides from '@/scripts/karm/display-name-overrides.json';
import headerContent from '@/scripts/karm/header-content.json';
import iconMap from '@/scripts/karm/icon-map.json';
import linkAliases from '@/scripts/karm/link-aliases.json';
import {
  addRulebookClarifications,
  buildCardLinkIndex,
  buildRulingCards,
  normalizeRules,
  type RuleEntry,
  type RulebookClarification,
  type RulingCard,
} from './build';
import { rulingsPageHref } from './pages';
import { SVG_GLYPH_PREFIX } from '@/components/rulings/ArmadaIcon';

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
  // Its "Card Clarifications" section adds to the cards' rulings.
  rulesReference: 'rules-reference',
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

  const built = buildRulingCards({
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
  const { cards } = addRulebookClarifications(built, rulebookClarifications(payload.rulesReference), {
    source: 'Rules Reference',
    date: typeof payload.rulesReference.effective === 'string' ? payload.rulesReference.effective : '',
    version: typeof payload.rulesReference.version === 'string' ? payload.rulesReference.version : '',
  });

  // An empty card set means the API was unreachable. Throwing keeps the previously
  // generated page live rather than publishing an empty one.
  if (cards.length === 0) {
    throw new Error(`Rulings: the card API returned no cards (${warnings.join('; ') || 'no detail'})`);
  }

  return { cards, linkIndex: buildCardLinkIndex(cards, rulingsPageHref, linkAliases), warnings };
});

interface ClarificationEntry {
  title: string;
  group?: string;
  blocks: Array<{ type: string; text?: string }>;
}

/**
 * The Rules Reference's card clarifications, one ruling per paragraph. Bullets join the
 * paragraph that introduces them, and text under "Campaign Clarifications" is filed
 * with the card's campaign interactions.
 */
function rulebookClarifications(book: Record<string, unknown>): RulebookClarification[] {
  const sections = Array.isArray(book.sections) ? (book.sections as Array<{ id: string; entries: ClarificationEntry[] }>) : [];
  const section = sections.find((candidate) => candidate.id === 'card-clarifications');
  return (section?.entries ?? []).map((entry) => {
    const rules: RulebookClarification['rules'] = [];
    let campaign = false;
    for (const block of entry.blocks) {
      const text = block.text?.trim();
      if (!text) continue;
      if (block.type === 'heading') {
        campaign = /campaign/i.test(text);
      } else if (block.type === 'bullet' && rules.length > 0) {
        const last = rules[rules.length - 1];
        last.text = `${last.text}${last.text.endsWith(':') ? ' ' : '; '}${text.replace(/\.$/, '')}`;
      } else {
        rules.push({ section: campaign ? 'campaign_interactions' : 'clarifications', text });
      }
    }
    for (const rule of rules) if (!/[.!?"”)]$/.test(rule.text)) rule.text += '.';
    return { group: entry.group ?? '', title: entry.title, rules };
  });
}

// Keywords newer than the icon font are drawn from SVGs in public/images/icons, copied
// from the-isb-api's keyword tokens.
const SVG_ICONS = ['boost', 'hunt'];

export const ICON_MAP: Record<string, string> = {
  ...iconMap,
  ...Object.fromEntries(SVG_ICONS.map((name) => [name, `${SVG_GLYPH_PREFIX}${name}`])),
};

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
