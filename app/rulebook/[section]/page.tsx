import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { getRulingsData } from '@/lib/rulings/data';
import {
  CAMPAIGN_GUIDES,
  getCampaignGuide,
  getRulebook,
  normalizeTopic,
  rulebookIndex,
  type Rulebook,
  type RulebookEntry as Entry,
  type RulebookSection,
} from '@/lib/rulebook';
import { RulebookBlocks, RulebookEntry } from '@/components/rulebook/RulebookEntry';
import type { RulingTextContext } from '@/components/rulings/RulingText';

// Static until the API publishes a new version: /api/revalidate invalidates the
// catalog tag the rulebook datasets are cached under, like the card data.
export const revalidate = false;

const SHEET =
  'mx-auto max-w-[920px] border border-rulebook-accent/10 bg-gradient-to-b from-rulebook-sheet to-rulebook-parchment px-5 py-8 shadow-[0_1px_2px_rgba(24,20,14,0.08),0_18px_48px_rgba(12,14,22,0.28)] sm:px-12 sm:py-12';

/** Wiki notes for sections whose printed pointers lead off the site. */
const SECTION_NOTES: Record<string, React.ReactNode> = {
  'card-clarifications': (
    <>
      For the current card errata, see the <Link href="/changelog" className="card-ref">Community changelog</Link>.
    </>
  ),
};

export async function generateStaticParams() {
  const book = await getRulebook().catch(() => undefined);
  const sections = (book?.sections ?? []).filter((section) => section.id !== 'introduction').map((section) => ({ section: section.id }));
  return [...sections, ...CAMPAIGN_GUIDES.map((guide) => ({ section: guide.slug }))];
}

async function findSection(id: string) {
  const book = await getRulebook().catch(() => undefined);
  const section = book?.sections.find((candidate) => candidate.id === id && candidate.id !== 'introduction');
  return book && section ? { book, section } : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const id = (await params).section;
  const guide = CAMPAIGN_GUIDES.find((spec) => spec.slug === id);
  if (guide) return { title: guide.title, description: guide.description, alternates: { canonical: `/rulebook/${guide.slug}` } };
  const found = await findSection(id);
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

const groupId = (title: string) => `group-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

// The glossary reads like a dictionary, so it is split by first letter. Card
// clarifications keep the card-type headings the PDF uses.
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
      if (groups.at(-1)?.title !== title) groups.push({ id: groupId(title), title, entries: [] });
      const group = groups.at(-1)!;
      if (entry.title === entry.group && group.entries.length === 0 && !group.intro) group.intro = entry;
      else group.entries.push(entry);
    }
    return groups;
  }
  return [{ id: 'entries', entries: section.entries }];
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-y border-rulebook-accent/35 py-3 text-center font-logo text-[clamp(22px,3.2vw,32px)] font-bold uppercase leading-none tracking-[0.05em] text-rulebook-accent">
      {children}
    </h2>
  );
}

function Entries({ entries, ctx, topicHref }: { entries: Entry[]; ctx: RulingTextContext; topicHref: (title: string) => string | undefined }) {
  return (
    <>
      {entries.map((entry, index) => (
        <Fragment key={entry.id}>
          {index > 0 && <hr className="my-9 border-0 border-t border-rulebook-accent/15" />}
          <RulebookEntry entry={entry} ctx={ctx} topicHref={topicHref} />
        </Fragment>
      ))}
    </>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <header className="mb-8 text-center">
      <h1 className="border-y border-rulebook-accent/35 py-3 font-logo text-[clamp(28px,4.4vw,44px)] font-bold uppercase leading-none tracking-[0.06em] text-rulebook-accent">
        {title}
      </h1>
      <p className="mt-3 text-sm text-rulebook-muted">{subtitle}</p>
    </header>
  );
}

/** Glossary links for "Related Topics", from any page. */
function glossaryLinks(book: Rulebook | undefined, onGlossary: boolean) {
  const { glossaryByTitle } = book ? rulebookIndex(book) : { glossaryByTitle: new Map<string, Entry>() };
  return (title: string) => {
    const entry = glossaryByTitle.get(normalizeTopic(title));
    if (!entry) return undefined;
    return onGlossary ? `#${entry.id}` : `/rulebook/glossary#${entry.id}`;
  };
}

async function GuidePage({ slug }: { slug: string }) {
  const spec = CAMPAIGN_GUIDES.find((guide) => guide.slug === slug)!;
  const [guide, rules, rulings] = await Promise.all([
    getCampaignGuide(slug),
    getRulebook().catch(() => undefined),
    getRulingsData().catch(() => undefined),
  ]);
  if (!guide) notFound();
  const ctx = { linkIndex: rulings?.linkIndex ?? new Map() };
  const topicHref = glossaryLinks(rules, false);
  const sections = guide.sections.filter((section) => section.entries.length > 0 || section.intro.length > 0);

  return (
    <div className={SHEET}>
      <PageTitle title={spec.title} subtitle={<>{guide.title}. {guide.errata}</>} />

      <nav aria-label="Chapters" className="mx-auto mb-10 max-w-md">
        <h2 className="wiki-section-title">Chapters</h2>
        <ol className="space-y-1 text-[17px]">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="flex items-baseline gap-2 hover:text-rulebook-accent">
                <span>{section.title}</span>
                <span aria-hidden className="flex-1 border-b border-dotted border-rulebook-accent/30" />
                <span className="text-sm tabular-nums text-rulebook-muted">p. {section.page}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-20 [&+&]:mt-16">
          <GroupHeading>{section.title}</GroupHeading>
          {section.intro.length > 0 && (
            <div className="mt-6">
              <RulebookBlocks blocks={section.intro} ctx={ctx} keyPrefix={`${section.id}-intro`} />
            </div>
          )}
          <div className="mt-10">
            <Entries entries={section.entries} ctx={ctx} topicHref={topicHref} />
          </div>
        </section>
      ))}
    </div>
  );
}

export default async function RulebookSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const id = (await params).section;
  if (CAMPAIGN_GUIDES.some((guide) => guide.slug === id)) return <GuidePage slug={id} />;

  const found = await findSection(id);
  if (!found) notFound();
  const { book, section } = found;
  const rulings = await getRulingsData().catch(() => undefined);
  const ctx = { linkIndex: rulings?.linkIndex ?? new Map() };
  const topicHref = glossaryLinks(book, section.id === 'glossary');
  const groups = groupsOf(section);
  const hasChanges = section.entries.some((entry) => entry.blocks.some((block) => 'changed' in block && block.changed));

  return (
    <div className={SHEET}>
      <PageTitle
        title={section.title}
        subtitle={
          <>
            Rules Reference version {book.version}, page {section.page}.
            {hasChanges && <> A <span className="rulebook-changed-key" aria-hidden /> rule in the margin marks text new in this version.</>}
          </>
        }
      />

      {SECTION_NOTES[section.id] && <p className="mb-6 text-center text-[15px]">{SECTION_NOTES[section.id]}</p>}
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
            {group.title && <GroupHeading>{group.title}</GroupHeading>}
            {group.intro && (
              <div className="mt-6">
                <RulebookBlocks blocks={group.intro.blocks} ctx={ctx} keyPrefix={group.intro.id} />
              </div>
            )}
            <div className={group.title ? 'mt-10' : undefined}>
              <Entries entries={group.entries} ctx={ctx} topicHref={topicHref} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
