import { RULINGS_PAGES } from '@/lib/rulings/pages';
import { headingId, type BookSpec, type Rulebook, type RulebookBlock, type RulebookEntry } from '@/lib/rulebook';
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
  { k: 'page', n: 'Rulebook', s: 'The Rules Reference, campaign guides and tournament regulations', h: '/rulebook' },
  { k: 'page', n: 'Community changelog', s: 'Points changes and errata in the Community Edition card set', h: '/changelog' },
  { k: 'page', n: 'Reference Manual changelog', s: 'Every ARM revision, with changed text marked', h: '/changelog/arm' },
  { k: 'page', n: 'Rulings PDF', s: 'Every ruling in one document, saved as a PDF from your browser', h: '/rulings-pdf' },
  { k: 'page', n: 'Compare cards', s: 'Side-by-side stats for up to 4 cards', h: '/compare' },
  { k: 'page', n: 'Getting started', s: 'New to Star Wars: Armada', h: '/guide' },
  { k: 'page', n: 'Resources', s: 'Community, tools, printing and rules links', h: '/resources' },
];

// Rule topics people look up by name. Card clarifications are named after cards, which
// the card rows already cover, and they also appear in each card's rulings.
const SEARCHED_RULEBOOK_SECTIONS = new Set(['glossary', 'rule-clarifications', 'faq', 'optional-rules', 'quick-reference']);

// Rule text is matched on its first few hundred characters; each subheading and FAQ
// topic gets its own row, so long entries are still covered.
const TEXT_LIMIT = 500;

const plainText = (blocks: RulebookBlock[]) =>
  blocks
    .map((block) => ('text' in block ? block.text : block.type === 'table' ? block.rows.flat().join(' ') : ''))
    .join(' ')
    .replace(/\*+|:[a-z_-]+:|\[|\]\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, TEXT_LIMIT) || undefined;

/** Blocks under each subheading of an entry, up to the next subheading. */
function headingParts(blocks: RulebookBlock[]): Array<{ text: string; blocks: RulebookBlock[] }> {
  const parts: Array<{ text: string; blocks: RulebookBlock[] }> = [];
  for (const block of blocks) {
    if (block.type === 'heading') parts.push({ text: block.text, blocks: [] });
    else parts.at(-1)?.blocks.push(block);
  }
  return parts;
}

/**
 * Rows for one entry: the entry, each subheading in it, and each FAQ topic shown in it.
 * `where` names the book and section for the subtitle.
 */
function entryRows(entry: RulebookEntry, href: string, where: string): SearchRow[] {
  const rows: SearchRow[] = [{ k: 'rule', n: entry.title, s: where, h: `${href}#${entry.id}`, t: plainText(entry.blocks) }];
  for (const part of headingParts(entry.blocks)) {
    // Numbered quick-reference steps ("1. Strategy Phase") are found by the entry itself.
    if (/^\d/.test(part.text)) continue;
    rows.push({ k: 'rule', n: part.text, s: `${where}, ${entry.title}`, h: `${href}#${headingId(entry.id, part.text)}`, t: plainText(part.blocks) });
  }
  for (const block of entry.blocks) {
    if (block.type !== 'faq') continue;
    rows.push({ k: 'rule', n: `${block.title} FAQ`, s: `${where}, ${entry.title}`, h: `${href}#${block.id}`, t: plainText(block.blocks) });
  }
  return rows;
}

function rulebookRows(book: Rulebook | undefined): SearchRow[] {
  const sections = (book?.sections ?? []).filter((section) => section.id !== 'introduction');
  return [
    ...sections.map((section): SearchRow => ({ k: 'page', n: section.title, s: 'Rulebook, Rules Reference', h: `/rulebook/${section.id}` })),
    ...sections
      .filter((section) => SEARCHED_RULEBOOK_SECTIONS.has(section.id))
      .flatMap((section) =>
        section.entries.flatMap((entry) => entryRows(entry, `/rulebook/${section.id}`, section.id === 'glossary' ? 'Rulebook glossary' : `Rulebook, ${section.title}`)),
      ),
  ];
}

function bookRows(books: Array<{ spec: BookSpec; book: Rulebook }>): SearchRow[] {
  return books.flatMap(({ spec, book }) => [
    { k: 'page', n: spec.title, s: spec.description, h: `/rulebook/${spec.slug}` } satisfies SearchRow,
    ...book.sections.flatMap((section) =>
      section.entries.flatMap((entry) => entryRows(entry, `/rulebook/${spec.slug}`, `${spec.title}, ${section.title}`)),
    ),
  ]);
}

export function buildSearchIndex(catalog: CardCatalog, book?: Rulebook, books: Array<{ spec: BookSpec; book: Rulebook }> = []): SearchRow[] {
  const cards = [...shipEntries(catalog), ...squadronEntries(catalog), ...upgradeEntries(catalog), ...objectiveEntries(catalog)];
  const rulings = RULINGS_PAGES.map((page): SearchRow => ({ k: 'page', n: `${page.title} rulings`, s: page.description, h: page.href }));
  return [
    ...PAGES,
    ...rulings,
    ...rulebookRows(book),
    ...bookRows(books),
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
