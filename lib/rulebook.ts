import { cache } from 'react';
import { fetchCatalogDataset } from '@/lib/cardApi';

// The Star Wars: Armada Rules Reference, the two campaign guides and the tournament
// regulations, as the card API publishes them (the `rules-reference`,
// `corellian-conflict-campaign`, `rebellion-in-the-rim-campaign` and
// `tournament-regulations` datasets, built in the-isb-api's scripts/rules/).
// Text uses the same inline markup as card rulings: **bold**, *italic* and :icon: tokens.

export type RulebookBlock =
  | { type: 'paragraph' | 'question' | 'answer'; text: string; changed?: boolean; errata?: string }
  // `continued` marks another paragraph of the list item before it, such as an example.
  | { type: 'bullet'; level: number; text: string; changed?: boolean; continued?: boolean; errata?: string }
  | { type: 'step'; number: number; text: string; changed?: boolean; continued?: boolean; errata?: string }
  | { type: 'heading'; text: string }
  | { type: 'table'; header: string[]; rows: string[][]; errata?: string }
  | { type: 'figure'; title: string; page: number; image?: string; width?: number; height?: number; caption: string[] }
  // Added on the wiki, not in the datasets: a Rules Reference FAQ topic shown inside the
  // rule it is about. `id` is the FAQ entry's own id, so its old links still resolve.
  | { type: 'faq'; id: string; title: string; blocks: RulebookBlock[] };

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
export const RULEBOOK_DESCRIPTION =
  'The Star Wars: Armada Rules Reference, campaign guides and tournament regulations: the rules glossary with its FAQ, card clarifications, campaign rules and tournament play.';

/** Diagrams are served from the card image host, like card faces. */
export const RULEBOOK_IMAGE_BASE = 'https://images.swarmada.wiki/images/';

/** A book with a single page on the wiki: a campaign guide or the tournament regulations. */
export interface BookSpec {
  slug: string;
  dataset: string;
  title: string;
  description: string;
}

export const CAMPAIGN_GUIDES: BookSpec[] = [
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

export const TOURNAMENT_REGULATIONS: BookSpec = {
  slug: 'tournament-regulations',
  dataset: 'tournament-regulations',
  title: 'Tournament Regulations',
  description: 'The rules for Standard Play tournaments: fleet building, game setup, round times, scoring, pairings and tiebreakers.',
};

/** Every book with one page of its own under /rulebook/<slug>. */
export const BOOKS: BookSpec[] = [...CAMPAIGN_GUIDES, TOURNAMENT_REGULATIONS];

export const bookHref = (spec: Pick<BookSpec, 'slug'>) => `/rulebook/${spec.slug}`;

/** Anchor id of a subheading inside an entry, such as "Determine Initiative" in Battle Phase. */
export const headingId = (entryId: string, text: string) =>
  `${entryId}--${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;

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

/** The Rules Reference as published, with its printed page pointers rewritten for the wiki. */
const getRulesReference = cache(async (): Promise<Rulebook | undefined> => {
  const book = await loadBook('rules-reference');
  if (!book) return undefined;
  const rewrite = (text: string) => RULES_REFERENCE_REWRITES.reduce((out, [from, to]) => out.split(from).join(to), text);
  return { ...book, sections: rewriteBlocks(book.sections, rewrite) };
});

// ── FAQ placement ──
//
// The Rules Reference prints its FAQ as separate sections. On the wiki each FAQ topic is
// shown inside the rule it is about: the general FAQ in the glossary, and each campaign
// FAQ in its campaign guide. A topic with no home stays in a FAQ section, so nothing is
// lost when a new version renames a topic.

const plainTitle = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** FAQ topics whose glossary entry has a different name. Others match by name. */
const GLOSSARY_FAQ_HOMES: Record<string, string> = {
  'Damage Cards': 'Damage',
  'Setup and Fleet-Building': 'Setup',
};

interface FaqHome {
  /** Section id, when the entry title is not unique in the book. */
  section?: string;
  entry: string;
  /** Place the FAQ at the end of the text under this subheading. */
  heading?: string;
  /** Place the FAQ after the paragraph that starts with this text. */
  after?: string;
}

/** Campaign FAQ topics that are not named after a topic of their guide. Others match by name. */
const CAMPAIGN_FAQ_HOMES: Record<string, Record<string, FaqHome>> = {
  'corellian-conflict': {
    'Determine Initiative': { entry: 'Battle Phase', heading: 'Determine Initiative' },
    'Scoring Battles': { entry: 'Battle Phase', heading: 'Scoring Battles' },
    'Tracking Fleet Condition': { entry: 'Battle Phase', heading: 'Tracking Fleet Condition' },
    'Refit and Expand Fleets': { entry: 'Management Phase', heading: 'Refit and Expand Fleets' },
    'Grav Well Interdiction': { entry: 'Hyperspace Retreat', heading: 'Grav Well Interdiction' },
    'All-Out Assault': { section: 'all-out-offensive', entry: 'Special Rules' },
  },
  'rebellion-in-the-rim': {
    'Task Force Battles': { section: 'task-force-battles', entry: 'Play Area' },
    'Scoring Battles': { entry: 'Battle Phase', after: '**Score Battle:**' },
  },
};

const faqBlock = (entry: RulebookEntry): RulebookBlock => ({ type: 'faq', id: entry.id, title: entry.title, blocks: entry.blocks });

/** Inserts the FAQ into its home entry and returns true, or returns false when the home is missing. */
function placeFaq(sections: RulebookSection[], faq: RulebookEntry, home: FaqHome): boolean {
  const candidates = sections.filter((section) => !home.section || section.id === home.section).flatMap((section) => section.entries);
  const target = candidates.find((entry) => plainTitle(entry.title) === plainTitle(home.entry));
  if (!target) return false;
  const blocks = target.blocks;
  let index = blocks.length;
  if (home.heading) {
    const start = blocks.findIndex((block) => block.type === 'heading' && plainTitle(block.text) === plainTitle(home.heading!));
    if (start === -1) return false;
    const next = blocks.findIndex((block, at) => at > start && block.type === 'heading');
    index = next === -1 ? blocks.length : next;
  } else if (home.after) {
    const at = blocks.findIndex((block) => 'text' in block && block.text.startsWith(home.after!));
    if (at === -1) return false;
    index = at + 1;
  }
  blocks.splice(index, 0, faqBlock(faq));
  return true;
}

/** A guide entry or subheading with the FAQ topic's name. */
function homeByName(sections: RulebookSection[], title: string): FaqHome | undefined {
  for (const section of sections) {
    for (const entry of section.entries) {
      if (plainTitle(entry.title) === plainTitle(title)) return { section: section.id, entry: entry.title };
    }
  }
  for (const section of sections) {
    for (const entry of section.entries) {
      const heading = entry.blocks.find((block) => block.type === 'heading' && plainTitle(block.text) === plainTitle(title));
      if (heading && heading.type === 'heading') return { section: section.id, entry: entry.title, heading: heading.text };
    }
  }
  return undefined;
}

const cloneSections = (sections: RulebookSection[]): RulebookSection[] =>
  sections.map((section) => ({ ...section, entries: section.entries.map((entry) => ({ ...entry, blocks: [...entry.blocks] })) }));

/** The FAQ section of the Rules Reference that belongs to a campaign guide. */
const campaignFaqSectionId = (slug: string) => `${slug}-faq`;

export const getRulebook = cache(async (): Promise<Rulebook | undefined> => {
  const book = await getRulesReference();
  if (!book) return undefined;
  const sections = cloneSections(book.sections);
  const glossary = sections.find((section) => section.id === 'glossary');
  const faq = sections.find((section) => section.id === 'faq');
  if (glossary && faq) {
    faq.entries = faq.entries.filter((entry) => {
      const title = GLOSSARY_FAQ_HOMES[entry.title] ?? entry.title;
      const home = glossary.entries.find((candidate) => normalizeTopic(candidate.title) === normalizeTopic(title));
      return !(home && placeFaq([glossary], entry, { entry: home.title }));
    });
  }
  // Campaign FAQs move to their guides (see getBook), so they leave the Rules Reference.
  const campaignFaqs = new Set(CAMPAIGN_GUIDES.map((spec) => campaignFaqSectionId(spec.slug)));
  return { ...book, sections: sections.filter((section) => !campaignFaqs.has(section.id) && !(section.id === 'faq' && section.entries.length === 0)) };
});

/** Rules Reference section ids that now live elsewhere, and the page they moved to. */
export const MOVED_SECTIONS: Record<string, string> = {
  faq: '/rulebook/glossary',
  ...Object.fromEntries(CAMPAIGN_GUIDES.map((spec) => [campaignFaqSectionId(spec.slug), bookHref(spec)])),
};

/**
 * Page references in a book become links: `"Final Victory" on page 9` goes to the topic
 * or subheading with that name, and a bare "page 9" to the topic printed there.
 */
function linkPageReferences(book: Rulebook, href: string): Rulebook {
  const entries = book.sections.flatMap((section) => section.entries);
  const byPage = [...entries].sort((a, b) => a.page - b.page);
  const named = (name: string) => {
    const entry = entries.find((candidate) => plainTitle(candidate.title) === plainTitle(name));
    if (entry) return entry.id;
    for (const candidate of entries) {
      const heading = candidate.blocks.find((block) => block.type === 'heading' && plainTitle(block.text) === plainTitle(name));
      if (heading && heading.type === 'heading') return headingId(candidate.id, heading.text);
    }
    return undefined;
  };
  const onPage = (page: number) => [...byPage].reverse().find((entry) => entry.page <= page)?.id;
  const rewrite = (text: string) =>
    text
      .replace(/"([^"]+)" on (pages? \d+(?:–\d+)?)/g, (match, name: string, pages: string) => {
        const id = named(name) ?? onPage(Number(pages.replace(/\D+/, '').split('–')[0]));
        return id ? `"${name}" on [${pages}](${href}#${id})` : match;
      })
      // "page 10 of the Armada Rules Reference" points at another book, so it stays as printed.
      .replace(/(?<![[\w])(pages?) (\d+)(?:–\d+)?\b(?!\]\(| of the)/g, (match, _word, number: string) => {
        const id = onPage(Number(number));
        return id ? `[${match}](${href}#${id})` : match;
      });
  return { ...book, sections: rewriteBlocks(book.sections, rewrite) };
}

/** Adds the Rules Reference FAQ for a campaign guide to the guide's own topics. */
async function withCampaignFaq(book: Rulebook, slug: string): Promise<Rulebook> {
  const rules = await getRulesReference().catch(() => undefined);
  const faqs = rules?.sections.find((section) => section.id === campaignFaqSectionId(slug))?.entries ?? [];
  if (faqs.length === 0) return book;
  const sections = cloneSections(book.sections);
  const homes = CAMPAIGN_FAQ_HOMES[slug] ?? {};
  const unplaced = faqs.filter((faq) => {
    const home = homes[faq.title] ?? homeByName(sections, faq.title);
    return !(home && placeFaq(sections, faq, home));
  });
  if (unplaced.length > 0) {
    sections.push({ id: 'faq', title: 'FAQ', page: unplaced[0].page, intro: [], entries: unplaced });
  }
  return { ...book, sections };
}

/** A campaign guide or the tournament regulations, by its slug. */
export const getBook = cache(async (slug: string): Promise<Rulebook | undefined> => {
  const spec = BOOKS.find((book) => book.slug === slug);
  if (!spec) return undefined;
  const book = await loadBook(spec.dataset).catch(() => undefined);
  if (!book) return undefined;
  const linked = linkPageReferences(book, bookHref(spec));
  return CAMPAIGN_GUIDES.includes(spec) ? withCampaignFaq(linked, slug) : linked;
});

/** The campaign guides the API has published, in their listed order. */
export const getCampaignGuides = cache(async () => {
  const books = await Promise.all(CAMPAIGN_GUIDES.map(async (spec) => ({ spec, book: await getBook(spec.slug) })));
  return books.filter((item): item is { spec: BookSpec; book: Rulebook } => item.book !== undefined);
});

/** Every single-page book the API has published: the campaign guides, then the tournament regulations. */
export const getBooks = cache(async () => {
  const books = await Promise.all(BOOKS.map(async (spec) => ({ spec, book: await getBook(spec.slug) })));
  return books.filter((item): item is { spec: BookSpec; book: Rulebook } => item.book !== undefined);
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
