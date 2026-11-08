import { cache } from 'react';
import { fetchCatalogDataset } from '@/lib/cardApi';

// The Star Wars: Armada Rules Reference and the two campaign guides, as the card API
// publishes them (the `rules-reference`, `corellian-conflict-campaign` and
// `rebellion-in-the-rim-campaign` datasets, built in the-isb-api's scripts/rules/).
// Text uses the same inline markup as card rulings: **bold**, *italic* and :icon: tokens.

export type RulebookBlock =
  | { type: 'paragraph' | 'question' | 'answer'; text: string; changed?: boolean; errata?: string }
  // `continued` marks another paragraph of the list item before it, such as an example.
  | { type: 'bullet'; level: number; text: string; changed?: boolean; continued?: boolean; errata?: string }
  | { type: 'step'; number: number; text: string; changed?: boolean; continued?: boolean; errata?: string }
  | { type: 'heading'; text: string }
  | { type: 'table'; header: string[]; rows: string[][]; errata?: string }
  | { type: 'figure'; title: string; page: number; image?: string; width?: number; height?: number; caption: string[] };

export interface RulebookEntry {
  id: string;
  title: string;
  page: number;
  /** The product or card type heading the entry sits under, in sections that have them. */
  group?: string;
  /** A boxed aside in the printed book, such as an example. */
  sidebar?: boolean;
  blocks: RulebookBlock[];
  /** Glossary topics named under "Related Topics". */
  related?: string[];
}

export interface RulebookSection {
  id: string;
  title: string;
  page: number;
  intro: RulebookBlock[];
  entries: RulebookEntry[];
}

export interface Rulebook {
  title: string;
  version?: string;
  /** ISO date the version takes effect. */
  effective?: string;
  publisher: string;
  /** Which errata the text already includes. */
  errata?: string;
  sections: RulebookSection[];
}

export const RULEBOOK_TITLE = 'Rulebook';
export const RULEBOOK_DESCRIPTION = 'The Star Wars: Armada Rules Reference and campaign guides: rules glossary, FAQ, card clarifications and campaign rules.';

/** Diagrams are served from the card image host, like card faces. */
export const RULEBOOK_IMAGE_BASE = 'https://images.swarmada.wiki/images/';

export interface CampaignGuideSpec {
  slug: string;
  dataset: string;
  title: string;
  description: string;
}

export const CAMPAIGN_GUIDES: CampaignGuideSpec[] = [
  {
    slug: 'corellian-conflict',
    dataset: 'corellian-conflict-campaign',
    title: 'The Corellian Conflict',
    description: 'The Corellian Conflict campaign guide, with the Rules Reference errata applied.',
  },
  {
    slug: 'rebellion-in-the-rim',
    dataset: 'rebellion-in-the-rim-campaign',
    title: 'Rebellion in the Rim',
    description: 'The Rebellion in the Rim campaign guide, with the Rules Reference errata applied.',
  },
];

// The printed books point readers to their own page numbers and to AMG's website.
// On the wiki those references go to the matching wiki page instead.
const RULES_REFERENCE_REWRITES: Array<[string, string]> = [
  ['use the index on page 46', 'use the site search'],
  ['(see pages 23–27)', '(see the [Community changelog](/changelog))'],
  ['(see diagram on page 18)', '(see the diagram below)'],
];

function rewriteBlocks(sections: RulebookSection[], rewrite: (text: string) => string): RulebookSection[] {
  const blocks = (list: RulebookBlock[]) =>
    list.map((block) => {
      if ('text' in block) return { ...block, text: rewrite(block.text) };
      if (block.type === 'table') return { ...block, rows: block.rows.map((row) => row.map(rewrite)) };
      if (block.type === 'figure') return { ...block, caption: block.caption.map(rewrite) };
      return block;
    });
  return sections.map((section) => ({
    ...section,
    intro: blocks(section.intro),
    entries: section.entries.map((entry) => ({ ...entry, blocks: blocks(entry.blocks) })),
  }));
}

async function loadBook(dataset: string): Promise<Rulebook | undefined> {
  const { data } = await fetchCatalogDataset(dataset);
  const sections = Array.isArray(data.sections) ? (data.sections as RulebookSection[]) : [];
  if (sections.length === 0) return undefined;
  return data as unknown as Rulebook;
}

export const getRulebook = cache(async (): Promise<Rulebook | undefined> => {
  const book = await loadBook('rules-reference');
  if (!book) return undefined;
  const rewrite = (text: string) => RULES_REFERENCE_REWRITES.reduce((out, [from, to]) => out.split(from).join(to), text);
  return { ...book, sections: rewriteBlocks(book.sections, rewrite) };
});

/**
 * Page references in a campaign guide become links: `"Final Victory" on page 9` goes to
 * the topic or subheading with that name, and a bare "page 9" to the topic printed there.
 */
function linkPageReferences(book: Rulebook, href: string): Rulebook {
  const entries = book.sections.flatMap((section) => section.entries);
  const byPage = [...entries].sort((a, b) => a.page - b.page);
  const plain = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const named = (name: string) =>
    entries.find((entry) => plain(entry.title) === plain(name)) ??
    entries.find((entry) => entry.blocks.some((block) => block.type === 'heading' && plain(block.text) === plain(name)));
  const onPage = (page: number) => [...byPage].reverse().find((entry) => entry.page <= page);
  const rewrite = (text: string) =>
    text
      .replace(/"([^"]+)" on (pages? \d+(?:–\d+)?)/g, (match, name: string, pages: string) => {
        const entry = named(name) ?? onPage(Number(pages.replace(/\D+/, '').split('–')[0]));
        return entry ? `"${name}" on [${pages}](${href}#${entry.id})` : match;
      })
      // "page 10 of the Armada Rules Reference" points at another book, so it stays as printed.
      .replace(/(?<![[\w])(pages?) (\d+)(?:–\d+)?\b(?!\]\(| of the)/g, (match, _word, number: string) => {
        const entry = onPage(Number(number));
        return entry ? `[${match}](${href}#${entry.id})` : match;
      });
  return { ...book, sections: rewriteBlocks(book.sections, rewrite) };
}

export const getCampaignGuide = cache(async (slug: string): Promise<Rulebook | undefined> => {
  const spec = CAMPAIGN_GUIDES.find((guide) => guide.slug === slug);
  if (!spec) return undefined;
  const book = await loadBook(spec.dataset).catch(() => undefined);
  return book && linkPageReferences(book, `/rulebook/${spec.slug}`);
});

/** The campaign guides the API has published, in their listed order. */
export const getCampaignGuides = cache(async () => {
  const books = await Promise.all(CAMPAIGN_GUIDES.map(async (spec) => ({ spec, book: await getCampaignGuide(spec.slug) })));
  return books.filter((item): item is { spec: CampaignGuideSpec; book: Rulebook } => item.book !== undefined);
});

export const sectionHref = (section: Pick<RulebookSection, 'id'>) => `/rulebook/${section.id}`;

/** Section and anchor of every entry, plus a lookup from glossary titles for "Related Topics". */
export function rulebookIndex(book: Rulebook) {
  const byId = new Map<string, { section: RulebookSection; entry: RulebookEntry }>();
  const glossaryByTitle = new Map<string, RulebookEntry>();
  for (const section of book.sections) {
    for (const entry of section.entries) {
      byId.set(entry.id, { section, entry });
      if (section.id === 'glossary') glossaryByTitle.set(normalizeTopic(entry.title), entry);
    }
  }
  return { byId, glossaryByTitle };
}

export function normalizeTopic(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/s\b/g, '');
}

export function formatEffectiveDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}
