import { RULINGS_PAGES } from '@/lib/rulings/pages';
import type { CardCatalog } from './catalog';
import { objectiveEntries, shipEntries, squadronEntries, upgradeEntries, type CardKind } from './entries';

/** One row of the site search index, kept short because every visitor downloads it. */
export interface SearchRow {
  /** Card kind, or `page` for a rulings or reference page. */
  k: CardKind | 'page';
  /** Name. */
  n: string;
  /** Subtitle. */
  s?: string;
  /** Link. */
  h: string;
  /** Points. */
  p?: number;
  /** Content source when it is not Core. */
  c?: string;
  /** Card face image. */
  i?: string;
  /** Extra lowercased text to match, such as ability text and traits. */
  t?: string;
}

const PAGES: SearchRow[] = [
  { k: 'page', n: 'Rules & Rulings', s: 'Rulings for every card, following the Armada Reference Manual', h: '/rulings' },
  { k: 'page', n: 'Community changelog', s: 'Points changes and errata in the Community Edition card set', h: '/changelog' },
  { k: 'page', n: 'Reference Manual changelog', s: 'Every ARM revision, with changed text marked', h: '/changelog/arm' },
  { k: 'page', n: 'Compare cards', s: 'Side-by-side stats for up to 4 cards', h: '/compare' },
  { k: 'page', n: 'Getting started', s: 'New to Star Wars: Armada', h: '/guide' },
  { k: 'page', n: 'Resources', s: 'Community, tools, printing and rules links', h: '/resources' },
];

export function buildSearchIndex(catalog: CardCatalog): SearchRow[] {
  const cards = [...shipEntries(catalog), ...squadronEntries(catalog), ...upgradeEntries(catalog), ...objectiveEntries(catalog)];
  const rulings = RULINGS_PAGES.map((page): SearchRow => ({ k: 'page', n: `${page.title} rulings`, s: page.description, h: page.href }));
  return [
    ...PAGES,
    ...rulings,
    ...cards.map((card): SearchRow => ({
      k: card.kind,
      n: card.name,
      s: card.subtitle,
      h: card.href,
      p: card.points,
      c: card.source === 'Core' ? undefined : card.source,
      i: card.face?.src,
      // Names and subtitles are matched separately; this carries ability text and traits.
      t: card.search.replace(card.name.toLowerCase(), '').replace(/:[a-z_-]+:/g, '').replace(/\s+/g, ' ').trim().slice(0, 400) || undefined,
    })),
  ];
}
