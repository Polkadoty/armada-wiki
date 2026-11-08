import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { getRulingsData } from '@/lib/rulings/data';
import { getRulebook, normalizeTopic, rulebookIndex, type RulebookEntry as Entry, type RulebookSection } from '@/lib/rulebook';
import { RulebookBlocks, RulebookEntry } from '@/components/rulebook/RulebookEntry';

// Static until the API publishes a new version: /api/revalidate invalidates the
// catalog tag the rules reference is cached under, like the card data.
export const revalidate = false;

export async function generateStaticParams() {
  const book = await getRulebook().catch(() => undefined);
  return (book?.sections ?? []).filter((section) => section.id !== 'introduction').map((section) => ({ section: section.id }));
}

async function findSection(id: string) {
  const book = await getRulebook().catch(() => undefined);
  const section = book?.sections.find((candidate) => candidate.id === id && candidate.id !== 'introduction');
  return book && section ? { book, section } : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const found = await findSection((await params).section);
  if (!found) return {};
  return {
    title: found.section.title,
    description: `${found.section.title} from the Star Wars: Armada Rules Reference, version ${found.book.version}.`,
    alternates: { canonical: `/rulebook/${found.section.id}` },
  };
}

interface Group {
  id: string;
  title?: string;
  /** Text printed under a group heading, before its first entry. */
  intro?: Entry;
  entries: Entry[];
}

// The glossary reads like a dictionary, so it is split by first letter. Errata and card
// clarifications keep the product and card-type headings the PDF uses.
function groupsOf(section: RulebookSection): Group[] {
  if (section.id === 'glossary') {
    const groups: Group[] = [];
    for (const entry of section.entries) {
      const letter = entry.title[0].toUpperCase();
      if (groups.at(-1)?.title !== letter) groups.push({ id: `letter-${letter.toLowerCase()}`, title: letter, entries: [] });
      groups.at(-1)!.entries.push(entry);
    }
    return groups;
  }
  if (section.entries.some((entry) => entry.group)) {
    const groups: Group[] = [];
    for (const entry of section.entries) {
      const title = entry.group ?? section.title;
      if (groups.at(-1)?.title !== title) groups.push({ id: `group-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, title, entries: [] });
      const group = groups.at(-1)!;
      if (entry.title === entry.group && group.entries.length === 0 && !group.intro) group.intro = entry;
      else group.entries.push(entry);
    }
    return groups;
  }
  return [{ id: 'entries', entries: section.entries }];
}

export default async function RulebookSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const found = await findSection((await params).section);
  if (!found) notFound();
  const { book, section } = found;
  const rulings = await getRulingsData().catch(() => undefined);
  const ctx = { linkIndex: rulings?.linkIndex ?? new Map() };
  const { glossaryByTitle } = rulebookIndex(book);
  const topicHref = (title: string) => {
    const entry = glossaryByTitle.get(normalizeTopic(title));
    if (!entry) return undefined;
    return section.id === 'glossary' ? `#${entry.id}` : `/rulebook/glossary#${entry.id}`;
  };
  const groups = groupsOf(section);
  const hasChanges = section.entries.some((entry) => entry.blocks.some((block) => 'changed' in block && block.changed));

  return (
    <div className="mx-auto max-w-[920px] border border-rulebook-accent/10 bg-gradient-to-b from-rulebook-sheet to-rulebook-parchment px-5 py-8 shadow-[0_1px_2px_rgba(24,20,14,0.08),0_18px_48px_rgba(12,14,22,0.28)] sm:px-12 sm:py-12">
      <header className="mb-8 text-center">
        <h1 className="border-y border-rulebook-accent/35 py-3 font-logo text-[clamp(28px,4.4vw,44px)] font-bold uppercase leading-none tracking-[0.06em] text-rulebook-accent">
          {section.title}
        </h1>
        <p className="mt-3 text-sm text-rulebook-muted">
          Rules Reference version {book.version}, page {section.page}.
          {hasChanges && <> A <span className="rulebook-changed-key" aria-hidden /> rule in the margin marks text new in this version.</>}
        </p>
      </header>

      {section.intro.length > 0 && <RulebookBlocks blocks={section.intro} ctx={ctx} keyPrefix="intro" />}

      {section.id === 'glossary' && (
        <nav aria-label="Glossary letters" className="mt-6 flex flex-wrap justify-center gap-1">
          {groups.map((group) => (
            <a key={group.id} href={`#${group.id}`} className="flex size-8 items-center justify-center rounded border border-rulebook-accent/20 bg-white/50 font-logo font-bold text-rulebook-accent hover:bg-rulebook-accent/10">
              {group.title}
            </a>
          ))}
        </nav>
      )}

      <div className="mt-8">
        {groups.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-20 [&+&]:mt-14">
            {group.title && (
              <h2 className="border-y border-rulebook-accent/35 py-3 text-center font-logo text-[clamp(22px,3.2vw,32px)] font-bold uppercase leading-none tracking-[0.05em] text-rulebook-accent">
                {group.title}
              </h2>
            )}
            {group.intro && (
              <div className="mt-6">
                <RulebookBlocks blocks={group.intro.blocks} ctx={ctx} keyPrefix={group.intro.id} />
              </div>
            )}
            <div className={group.title ? 'mt-10' : undefined}>
              {group.entries.map((entry, index) => (
                <Fragment key={entry.id}>
                  {index > 0 && <hr className="my-9 border-0 border-t border-rulebook-accent/15" />}
                  <RulebookEntry entry={entry} ctx={ctx} topicHref={topicHref} />
                </Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
