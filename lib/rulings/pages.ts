import {
  FACTION_ORDER,
  OBJECTIVE_TYPE_ORDER,
  UPGRADE_TYPE_ORDER,
  upgradeTypeLabel,
  type RulingCard,
} from './build';

export const RULINGS_TITLE = 'Rules & Rulings';
export const RULINGS_DESCRIPTION = 'Rulings and clarifications for Star Wars: Armada, following the Armada Reference Manual.';

export interface RulingsGroup {
  id: string;
  title: string;
  /** Icon-font key shown after the title (see scripts/karm/icon-map.json). */
  icon?: string;
  /** Key into scripts/karm/header-content.json for the section's preamble. */
  introKey?: string;
  cards: RulingCard[];
}

export interface RulingsPageSpec {
  href: string;
  title: string;
  /** Shorter label for navigation, when it differs from the title. */
  navLabel?: string;
  description: string;
  select: (cards: RulingCard[]) => RulingsGroup[];
}

const FACTION_TITLES: Record<string, string> = {
  empire: 'Galactic Empire',
  rebel: 'Rebel Alliance',
  republic: 'Galactic Republic',
  separatist: 'Separatist Alliance',
  scum: 'Scum & Villainy',
  'new-republic': 'New Republic',
  neutral: 'Unaligned',
};

const OBJECTIVE_TITLES: Record<string, string> = {
  assault: 'Assault',
  defense: 'Defense',
  navigation: 'Navigation',
  skirmish: 'Skirmish',
  campaign: 'Campaign',
};

export function upgradeGroupTitle(type: string): string {
  return type === 'weapons-team-offensive-retro' ? 'Boarding Teams' : upgradeTypeLabel(type);
}

/** `weapons-team-offensive-retro` reads as two upgrade icons; every other type is one. */
export function upgradeTypeIcons(type: string): string[] {
  if (type === 'weapons-team-offensive-retro') return ['weapons_team', 'offensive_retro'];
  return [type.replace(/-/g, '_')];
}

function groupBy(cards: RulingCard[], keyOf: (card: RulingCard) => string, order: string[]): Array<[string, RulingCard[]]> {
  const groups = new Map<string, RulingCard[]>();
  for (const card of cards) {
    const key = keyOf(card);
    groups.set(key, [...(groups.get(key) ?? []), card]);
  }
  const rank = (key: string) => (order.includes(key) ? order.indexOf(key) : order.length);
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
}

function byUpgradeType(cards: RulingCard[]): RulingsGroup[] {
  return groupBy(cards, (card) => card.upgradeType || 'unknown', UPGRADE_TYPE_ORDER).map(([type, group]) => ({
    id: type,
    title: upgradeGroupTitle(type),
    icon: type,
    introKey: type,
    cards: group,
  }));
}

function byFaction(cards: RulingCard[]): RulingsGroup[] {
  return groupBy(cards, (card) => card.primaryFaction, FACTION_ORDER).map(([faction, group]) => ({
    id: faction,
    title: FACTION_TITLES[faction] ?? faction,
    cards: group,
  }));
}

function byObjectiveType(cards: RulingCard[]): RulingsGroup[] {
  return groupBy(cards, (card) => card.objectiveType || 'objective', OBJECTIVE_TYPE_ORDER).map(([type, group]) => ({
    id: type,
    title: OBJECTIVE_TITLES[type] ?? upgradeTypeLabel(type),
    cards: group,
  }));
}

const isCampaign = (card: RulingCard) => card.objectiveType === 'campaign';

export const RULINGS_PAGES: RulingsPageSpec[] = [
  {
    href: '/rulings/objectives',
    title: 'Objectives',
    description: 'Rulings for assault, defense, navigation and skirmish objectives.',
    select: (cards) => byObjectiveType(cards.filter((card) => card.category === 'objectives' && !isCampaign(card))),
  },
  {
    href: '/rulings/campaign',
    title: 'Campaign Objectives',
    description: 'Rulings for campaign objectives.',
    select: (cards) => [{
      id: 'campaign',
      title: 'Campaign Objectives',
      cards: cards.filter((card) => card.category === 'objectives' && isCampaign(card)),
    }],
  },
  {
    href: '/rulings/damage-cards',
    title: 'Damage Cards',
    description: 'Rulings for faceup damage cards.',
    select: (cards) => [{ id: 'damage-cards', title: 'Damage Cards', cards: cards.filter((card) => card.category === 'damage-cards') }],
  },
  {
    href: '/rulings/squadrons',
    title: 'Ace Squadrons',
    description: 'Rulings for unique squadrons, by faction.',
    select: (cards) => byFaction(cards.filter((card) => card.category === 'ace-squadrons')),
  },
  {
    href: '/rulings/upgrades',
    title: 'Upgrades',
    navLabel: 'All Upgrades',
    description: 'Rulings for every upgrade card, by upgrade type.',
    select: (cards) => byUpgradeType(cards.filter((card) => card.category === 'upgrades')),
  },
  ...UPGRADE_TYPE_ORDER.map((type): RulingsPageSpec => ({
    href: `/rulings/upgrades/${type}`,
    title: upgradeGroupTitle(type),
    description: `Rulings for ${upgradeGroupTitle(type)} upgrade cards.`,
    select: (cards) => byUpgradeType(cards.filter((card) => card.category === 'upgrades' && card.upgradeType === type)),
  })),
  {
    href: '/rulings/nexus-upgrades',
    title: 'Nexus Upgrades',
    description: 'Rulings for Nexus upgrade cards.',
    select: (cards) => byUpgradeType(cards.filter((card) => card.category === 'nexus-upgrades')),
  },
  {
    href: '/rulings/nexus-squadrons',
    title: 'Nexus Squadrons',
    description: 'Rulings for Nexus ace squadrons.',
    select: (cards) => byFaction(cards.filter((card) => card.category === 'nexus-ace-squadrons')),
  },
];

export function findRulingsPage(href: string): RulingsPageSpec | undefined {
  return RULINGS_PAGES.find((page) => page.href === href);
}

/** The page a card is published on — the most specific one, for upgrades. */
export function rulingsPageHref(card: RulingCard): string {
  switch (card.category) {
    case 'objectives':
      return isCampaign(card) ? '/rulings/campaign' : '/rulings/objectives';
    case 'damage-cards':
      return '/rulings/damage-cards';
    case 'upgrades':
      return UPGRADE_TYPE_ORDER.includes(card.upgradeType || '') ? `/rulings/upgrades/${card.upgradeType}` : '/rulings/upgrades';
    case 'nexus-upgrades':
      return '/rulings/nexus-upgrades';
    case 'ace-squadrons':
      return '/rulings/squadrons';
    case 'nexus-ace-squadrons':
      return '/rulings/nexus-squadrons';
  }
}

export type RulingsNavEntry = { section: string } | { href: string; label: string; sub?: boolean };

export const RULINGS_NAV: RulingsNavEntry[] = [
  ...RULINGS_PAGES.slice(0, 4).map((page) => ({ href: page.href, label: page.navLabel ?? page.title })),
  { section: 'Upgrades' },
  ...RULINGS_PAGES.filter((page) => page.href.startsWith('/rulings/upgrades')).map((page) => ({
    href: page.href,
    label: page.navLabel ?? page.title,
    sub: true,
  })),
  { section: 'Nexus' },
  ...RULINGS_PAGES.filter((page) => page.href.startsWith('/rulings/nexus')).map((page) => ({
    href: page.href,
    label: page.navLabel ?? page.title,
    sub: true,
  })),
];
