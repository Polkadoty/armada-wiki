import { cache } from 'react';
import { fetchCatalogDataset } from '@/lib/cardApi';

// The Star Wars: Armada Rules Reference, as the card API publishes it (the
// `rules-reference` dataset, converted from AMG's PDF in the-isb-api). Text uses the
// same inline markup as card rulings: **bold**, *italic* and :icon: tokens.

export type RulebookBlock =
  | { type: 'paragraph' | 'question' | 'answer'; text: string; changed?: boolean }
  // `continued` marks another paragraph of the list item before it, such as an example.
  | { type: 'bullet'; level: number; text: string; changed?: boolean; continued?: boolean }
  | { type: 'step'; number: number; text: string; changed?: boolean; continued?: boolean }
  | { type: 'heading'; text: string }
  | { type: 'figure'; title: string; page: number; image?: string; width?: number; height?: number; caption: string[] };

export interface RulebookEntry {
  id: string;
  title: string;
  page: number;
  /** The product or card type heading the entry sits under, in sections that have them. */
  group?: string;
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
  version: string;
  /** ISO date the version takes effect. */
  effective: string;
  publisher: string;
  sections: RulebookSection[];
}

export const RULEBOOK_TITLE = 'Rulebook';
export const RULEBOOK_DESCRIPTION = 'The Star Wars: Armada Rules Reference: the glossary of rules, errata, FAQ and card clarifications.';

/** Diagrams are served from the card image host, like card faces. */
export const RULEBOOK_IMAGE_BASE = 'https://images.swarmada.wiki/images/';

export const getRulebook = cache(async (): Promise<Rulebook | undefined> => {
  const { data } = await fetchCatalogDataset('rules-reference');
  const sections = Array.isArray(data.sections) ? (data.sections as RulebookSection[]) : [];
  if (sections.length === 0) return undefined;
  return data as unknown as Rulebook;
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
