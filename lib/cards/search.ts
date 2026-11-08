import { RULINGS_PAGES } from '@/lib/rulings/pages';
import type { Rulebook } from '@/lib/rulebook';
import type { CardCatalog } from './catalog';
import { objectiveEntries, shipEntries, squadronEntries, upgradeEntries, type CardKind } from './entries';

/** One row of the site search index, kept short because every visitor downloads it. */
export interface SearchRow {
  /** Card kind, `rule` for a rulebook topic, or `page` for a rulings or reference page. */
  k: CardKind | 'rule' | 'page';
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
  { k: 'page', n: 'Rulings', s: 'Rulings for every card, following the Armada Reference Manual', h: '/rulings' },
  { k: 'page', n: 'Rulebook', s: 'The Rules Reference: glossary, errata, FAQ and card clarifications', h: '/rulebook' },
  { k: 'page', n: 'Community changelog', s: 'Points changes and errata in the Community Edition card set', h: '/changelog' },
  { k: 'page', n: 'Reference Manual changelog', s: 'Every ARM revision, with changed text marked', h: '/changelog/arm' },
  { k: 'page', n: 'Rulings PDF', s: 'Every ruling in one document, saved as a PDF from your browser', h: '/rulings-pdf' },
  { k: 'page', n: 'Compare cards', s: 'Side-by-side stats for up to 4 cards', h: '/compare' },
  { k: 'page', n: 'Getting started', s: 'New to Star Wars: Armada', h: '/guide' },
  { k: 'page', n: 'Resources', s: 'Community, tools, printing and rules links', h: '/resources' },
];

// Rule topics people look up by name. Errata and card clarifications are named after
// cards, which the card rows already cover.
const SEARCHED_RULEBOOK_SECTIONS = new Set(['glossary', 'rule-clarifications', 'faq', 'corellian-conflict-faq', 'rebellion-in-the-rim-faq', 'optional-rules', 'quick-reference']);

function rulebookRows(book: Rulebook | undefined): SearchRow[] {
  return (book?.sections ?? [])
    .filter((section) => SEARCHED_RULEBOOK_SECTIONS.has(section.id))
    .flatMap((section) =>
      section.entries.map((entry): SearchRow => {
        const text = entry.blocks.map((block) => ('text' in block ? block.text : '')).join(' ');
        return {
          k: 'rule',
          n: entry.title,
          s: section.id === 'glossary' ? 'Rulebook glossary' : `Rulebook, ${section.title}`,
          h: `/rulebook/${section.id}#${entry.id}`,
          t: text.replace(/\*+|:[a-z_-]+:/g, '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 300) || undefined,
        };
      }),
    );
}

export function buildSearchIndex(catalog: CardCatalog, book?: Rulebook): SearchRow[] {
  const cards = [...shipEntries(catalog), ...squadronEntries(catalog), ...upgradeEntries(catalog), ...objectiveEntries(catalog)];
  const rulings = RULINGS_PAGES.map((page): SearchRow => ({ k: 'page', n: `${page.title} rulings`, s: page.description, h: page.href }));
  return [
    ...PAGES,
    ...rulings,
    ...rulebookRows(book),
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
