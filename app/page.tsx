/* eslint-disable @next/next/no-img-element -- card faces come from the card API's image hosts */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { getCardCatalog } from '@/lib/cards/catalog';
import { FACTIONS, objectiveEntries, shipEntries, squadronEntries, upgradeEntries, type GridEntry } from '@/lib/cards/entries';
import { iconGlyph } from '@/lib/rulings/data';
import { ArmadaIcon, NewRepublicIcon } from '@/components/rulings/ArmadaIcon';
import { SearchButton } from '@/components/site/SearchProvider';

export const revalidate = false;

export const metadata: Metadata = {
  title: { absolute: 'Armada Wiki: Star Wars: Armada cards and rulings' },
  description:
    'Every Star Wars: Armada ship, squadron, upgrade and objective with points, stats and rulings. Includes the Armada Community errata, Nexus and the Armada Reference Manual rulings.',
  alternates: { canonical: '/' },
};

/** Three cards to fan out on a section tile: the costliest ones with a new card face. */
function showcase(entries: GridEntry[], filter: (entry: GridEntry) => boolean = () => true): GridEntry[] {
  const picked: GridEntry[] = [];
  const names = new Set<string>();
  for (const entry of [...entries].filter((e) => e.face?.originalSrc && filter(e)).sort((a, b) => (b.points ?? 0) - (a.points ?? 0))) {
    if (names.has(entry.name)) continue;
    names.add(entry.name);
    picked.push(entry);
    if (picked.length === 3) break;
  }
  return picked;
}

function Fan({ cards, wide }: { cards: GridEntry[]; wide?: boolean }) {
  const turns = ['-rotate-[9deg] -translate-x-[38%]', 'z-10 -translate-y-1', 'rotate-[9deg] translate-x-[38%]'];
  return (
    <div className="relative mx-auto flex h-44 items-end justify-center">
      {cards.map((card, index) => (
        <img
          key={card.key}
          src={card.face!.src}
          alt=""
          width={card.face!.width}
          height={card.face!.height}
          loading={index === 1 ? 'eager' : 'lazy'}
          className={`absolute bottom-0 h-auto ${wide ? 'w-24' : 'w-28'} origin-bottom rounded-[6px] shadow-[0_6px_18px_rgba(24,20,14,0.3)] transition-transform duration-300 group-hover:-translate-y-2 ${turns[index] ?? ''}`}
        />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const catalog = await getCardCatalog();
  const ships = shipEntries(catalog);
  const squadrons = squadronEntries(catalog);
  const upgrades = upgradeEntries(catalog);
  const objectives = objectiveEntries(catalog);
  const total = ships.length + squadrons.length + upgrades.length + objectives.length;

  const sections = [
    { href: '/ships', title: 'Ships', count: ships.length, text: 'Stats, navigation charts, armament and upgrade slots.', cards: showcase(ships, (e) => !e.facets.size.includes('huge')), wide: true },
    { href: '/squadrons', title: 'Squadrons', count: squadrons.length, text: 'Aces and generics, with keywords and rulings.', cards: showcase(squadrons, (e) => e.facets.kind.includes('ace')) },
    { href: '/upgrades', title: 'Upgrades', count: upgrades.length, text: 'Every slot, from commanders to titles.', cards: showcase(upgrades, (e) => e.facets.type.includes('commander')) },
    { href: '/objectives', title: 'Objectives', count: objectives.length, text: 'Setup, special rules and scoring.', cards: showcase(objectives) },
  ];

  const reference = [
    { href: '/rulings', title: 'Rules & Rulings', text: 'Clarifications for every card, set out like the Armada Reference Manual.' },
    { href: '/changelog', title: 'Community changelog', text: 'Points changes and errata in the Armada Community card set.' },
    { href: '/changelog/arm', title: 'Reference Manual changelog', text: 'Every ARM revision, with the changed text marked.' },
  ];

  return (
    <main className="mx-auto max-w-7xl px-0 py-6 sm:px-4 sm:py-10">
      <section className="wiki-sheet text-center">
        <h1 className="wiki-page-title !text-[clamp(36px,6vw,64px)]">Armada Wiki</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[17px] text-rulebook-muted">
          Cards and rulings for Star Wars: Armada. The core game, the Armada Community errata and Nexus, with the new card designs.
        </p>
        <SearchButton className="mx-auto mt-6 flex h-12 w-full max-w-xl items-center gap-3 rounded-md border border-rulebook-accent/25 bg-white/70 px-4 text-left text-rulebook-muted shadow-sm transition-colors hover:border-rulebook-accent/50">
          <Search className="size-5 text-rulebook-accent" aria-hidden />
          <span className="flex-1">Search {total} cards</span>
          <kbd className="rounded border border-rulebook-accent/20 px-1.5 text-xs">/</kbd>
        </SearchButton>
        <nav aria-label="Ships by faction" className="mt-5 flex flex-wrap justify-center gap-1.5">
          {FACTIONS.slice(0, 6).map((faction) => {
            const glyph = iconGlyph(faction.id);
            return (
              <Link
                key={faction.id}
                href={`/ships?faction=${faction.id}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rulebook-accent/20 bg-white/50 px-3 text-sm hover:border-rulebook-accent/45 hover:text-rulebook-accent"
              >
                {faction.id === 'new-republic' ? <NewRepublicIcon /> : glyph && <ArmadaIcon glyph={glyph} className="text-[15px]" />}
                {faction.short} ships
              </Link>
            );
          })}
        </nav>
      </section>

      <section aria-label="Card types" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="wiki-sheet group !px-5 !py-6 transition-shadow hover:shadow-[0_1px_2px_rgba(24,20,14,0.08),0_22px_56px_rgba(12,14,22,0.36)]">
            <Fan cards={section.cards} wide={section.wide} />
            <h2 className="mt-6 flex items-baseline justify-between gap-2 font-logo text-2xl font-bold uppercase tracking-[0.05em] text-rulebook-accent">
              {section.title}
              <span className="font-body text-sm font-normal normal-case tracking-normal text-rulebook-muted">{section.count}</span>
            </h2>
            <p className="mt-1 text-[15px] text-rulebook-muted">{section.text}</p>
          </Link>
        ))}
      </section>

      <section aria-label="Reference" className="mt-6 grid gap-4 md:grid-cols-3">
        {reference.map((entry) => (
          <Link key={entry.href} href={entry.href} className="wiki-sheet group flex items-start gap-3 !px-6 !py-6">
            <div className="flex-1">
              <h2 className="font-logo text-xl font-bold uppercase tracking-[0.05em] text-rulebook-accent">{entry.title}</h2>
              <p className="mt-1 text-[15px] text-rulebook-muted">{entry.text}</p>
            </div>
            <ArrowRight className="mt-1 size-5 text-rulebook-accent transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        ))}
      </section>
    </main>
  );
}
