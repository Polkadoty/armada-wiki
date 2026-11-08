import type { Metadata } from 'next';
import { Fragment } from 'react';
import { getCatalogManifest } from '@/lib/cardApi';
import { buildCardLinkIndex } from '@/lib/rulings/build';
import { getRulingsData, iconGlyph } from '@/lib/rulings/data';
import { RULINGS_DESCRIPTION, RULINGS_PAGES, upgradeTypeIcons } from '@/lib/rulings/pages';
import linkAliases from '@/scripts/karm/link-aliases.json';
import { ArmadaIcon } from '@/components/rulings/ArmadaIcon';
import { RulingCard } from '@/components/rulings/RulingCard';
import { GroupIntro } from '@/components/rulings/RulingsPage';
import { RulebookToolbar } from '@/components/rulings/RulebookToolbar';

// The whole of Rules & Rulings as one printable document. Readers save it as a PDF from
// their own browser, so the server only renders this page when the card data changes.
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Rulebook PDF',
  description: 'Every Rules & Rulings section on one page, ready to print or save as a PDF from your browser.',
  alternates: { canonical: '/rulebook' },
  // The same rulings are indexed on their own pages.
  robots: { index: false, follow: true },
};

// Each upgrade type already appears inside the all-upgrades section.
const SECTIONS = RULINGS_PAGES.filter((page) => !page.href.startsWith('/rulings/upgrades/'));

// Chrome stores WebP images in a PDF losslessly, which made the book over 500 MB. The
// image host keeps a JPEG copy of every face, and JPEGs go into the PDF as they are.
function printableImage(src: string): string {
  return src.replace(/^(https:\/\/images\.swarmada\.wiki)\/images\/([^/?#]+)\.webp(\?[^#]*)?$/, '$1/jpeg-images/$2.jpg$3');
}

function formatDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default async function RulebookPage() {
  const [rulings, manifest] = await Promise.all([getRulingsData(), getCatalogManifest().catch(() => undefined)]);
  const cards = rulings.cards.map((card) => ({ ...card, image: card.image ? printableImage(card.image) : card.image }));
  // Cross-references point inside this document, so they still work in the saved PDF.
  const ctx = { linkIndex: buildCardLinkIndex(cards, () => '', linkAliases) };
  const sections = SECTIONS.map((spec) => ({ spec, groups: spec.select(cards).filter((group) => group.cards.length > 0) })).filter(
    (section) => section.groups.length > 0,
  );
  const total = sections.reduce((sum, section) => sum + section.groups.reduce((count, group) => count + group.cards.length, 0), 0);

  return (
    <main className="mx-auto max-w-[920px] px-0 py-6 sm:px-4 sm:py-10 print:max-w-none print:p-0">
      <RulebookToolbar cardCount={total} />

      <div className="rulebook-document border border-rulebook-accent/10 bg-gradient-to-b from-rulebook-sheet to-rulebook-parchment px-5 py-8 shadow-[0_1px_2px_rgba(24,20,14,0.08),0_18px_48px_rgba(12,14,22,0.28)] sm:px-12 sm:py-12">
        <section className="rulebook-cover flex flex-col items-center text-center">
          <h1 className="mt-10 w-full border-y border-rulebook-accent/35 py-5 font-logo text-[clamp(34px,7vw,60px)] font-bold uppercase leading-none tracking-[0.06em] text-rulebook-accent">
            Rules &amp; Rulings
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-rulebook-muted">{RULINGS_DESCRIPTION}</p>
          <p className="mt-2 text-sm text-rulebook-muted">
            Core game with the Community Edition errata applied, plus Nexus. Card data as of {formatDate(manifest?.globalLastModified)}.
          </p>

          <nav aria-label="Contents" className="mt-12 w-full max-w-md text-left">
            <h2 className="wiki-section-title">Contents</h2>
            <ol className="space-y-1 text-[17px]">
              {sections.map(({ spec, groups }) => (
                <li key={spec.href}>
                  <a href={`#book-${spec.href.split('/').pop()}`} className="flex items-baseline gap-2 hover:text-rulebook-accent">
                    <span>{spec.title}</span>
                    <span aria-hidden className="flex-1 border-b border-dotted border-rulebook-accent/30" />
                    <span className="text-sm tabular-nums text-rulebook-muted">{groups.reduce((count, group) => count + group.cards.length, 0)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <p className="mt-auto pt-16 text-xs text-rulebook-muted">
            armada.wiki/rulings · Star Wars: Armada is a trademark of Fantasy Flight Games. This is an unofficial fan project.
          </p>
        </section>

        {sections.map(({ spec, groups }) => (
          <section key={spec.href} id={`book-${spec.href.split('/').pop()}`} className="rulebook-section">
            <h2 className="border-y border-rulebook-accent/35 py-3 text-center font-logo text-[clamp(28px,4.4vw,44px)] font-bold uppercase leading-none tracking-[0.06em] text-rulebook-accent">
              {spec.title}
            </h2>
            {groups.map((group) => (
              <section key={group.id} className="rulebook-group mt-12 first:mt-10">
                {(groups.length > 1 || group.title !== spec.title) && (
                  <h3 className="flex items-center justify-center gap-3 border-y border-rulebook-accent/25 py-2.5 text-center font-logo text-[clamp(20px,3vw,28px)] font-bold uppercase leading-none tracking-[0.05em] text-rulebook-accent">
                    {group.title}
                    {group.icon &&
                      upgradeTypeIcons(group.icon).map((icon) => {
                        const glyph = iconGlyph(icon);
                        return glyph ? <ArmadaIcon key={icon} glyph={glyph} className="text-[0.8em] normal-case" /> : null;
                      })}
                  </h3>
                )}
                <GroupIntro introKey={group.introKey} ctx={ctx} />
                <div className="mt-8">
                  {group.cards.map((card, index) => (
                    <Fragment key={card.key}>
                      {index > 0 && <hr data-ruling-divider className="my-9 border-0 border-t border-rulebook-accent/15" />}
                      <RulingCard card={card} ctx={ctx} />
                    </Fragment>
                  ))}
                </div>
              </section>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
