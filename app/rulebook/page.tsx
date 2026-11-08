import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getRulingsData } from '@/lib/rulings/data';
import { formatEffectiveDate, getRulebook, RULEBOOK_DESCRIPTION, RULEBOOK_TITLE, sectionHref } from '@/lib/rulebook';
import { RulebookBlocks, RulebookEntry } from '@/components/rulebook/RulebookEntry';

export const revalidate = false;

const SHEET =
  'mx-auto max-w-[760px] border border-rulebook-accent/10 bg-gradient-to-b from-rulebook-sheet to-rulebook-parchment px-5 py-10 shadow-[0_1px_2px_rgba(24,20,14,0.08),0_18px_48px_rgba(12,14,22,0.28)] sm:px-14 sm:py-14';

export default async function RulebookIndexPage() {
  const [book, rulings] = await Promise.all([getRulebook().catch(() => undefined), getRulingsData().catch(() => undefined)]);
  const ctx = { linkIndex: rulings?.linkIndex ?? new Map() };
  const intro = book?.sections.find((section) => section.id === 'introduction');
  const sections = book?.sections.filter((section) => section.id !== 'introduction') ?? [];

  return (
    <div className={SHEET}>
      <header className="text-center">
        <h1 className="border-y border-rulebook-accent/35 py-4 font-logo text-[clamp(30px,6vw,52px)] font-bold uppercase leading-none tracking-[0.06em] text-rulebook-accent">
          {RULEBOOK_TITLE}
        </h1>
        <p className="mt-4 text-rulebook-muted">{RULEBOOK_DESCRIPTION}</p>
        {book && (
          <p className="mt-2 text-sm text-rulebook-muted">
            Version {book.version}, effective {formatEffectiveDate(book.effective)}. Published by {book.publisher}.
          </p>
        )}
      </header>

      {!book && (
        <p className="mt-10 text-center text-rulebook-muted">The rules reference is not available from the card API yet. Check back soon.</p>
      )}

      {sections.length > 0 && (
        <ul className="mt-8">
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                href={sectionHref(section)}
                className="group flex items-center gap-3 border-b border-rulebook-accent/10 px-3 py-2.5 text-[17px] transition-colors hover:bg-rulebook-accent/[0.06] focus-visible:bg-rulebook-accent/[0.06]"
              >
                <span className="flex-1">{section.title}</span>
                <span className="min-w-8 text-right text-sm tabular-nums text-rulebook-muted">{section.entries.length || ''}</span>
                <ArrowRight className="size-4 text-rulebook-accent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {intro && (
        <section className="mt-12 space-y-8">
          <RulebookBlocks blocks={intro.intro} ctx={ctx} />
          {intro.entries.map((entry) => (
            <RulebookEntry key={entry.id} entry={entry} ctx={ctx} topicHref={() => undefined} />
          ))}
        </section>
      )}

      <footer className="mt-12 space-y-2 text-center text-sm text-rulebook-muted">
        <p>
          Card-by-card clarifications from the Armada Reference Manual are in{' '}
          <Link href="/rulings" className="text-rulebook-accent underline-offset-2 hover:underline">Rulings</Link>.
        </p>
        <p className="text-xs">
          Rules text © Atomic Mass Games. Star Wars: Armada is a trademark of Fantasy Flight Games. This is an unofficial fan project.
        </p>
      </footer>
    </div>
  );
}
