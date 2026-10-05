import Link from 'next/link';
import { ArrowRight, ScrollText } from 'lucide-react';
import { ArmadaIcon } from '@/components/rulings/ArmadaIcon';
import { CommunityMark } from '@/components/rulings/RulingCard';
import { ARM_CHANGELOG_SOURCE } from '@/lib/armChangelog';
import { getRulingsData, iconGlyph } from '@/lib/rulings/data';
import { RULINGS_DESCRIPTION, RULINGS_PAGES, RULINGS_TITLE, upgradeTypeIcons } from '@/lib/rulings/pages';

export const revalidate = false;

function SectionLink({ href, title, count, icons = [] }: { href: string; title: string; count: number; icons?: string[] }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 border-b border-rulebook-accent/10 px-3 py-2.5 text-[17px] transition-colors hover:bg-rulebook-accent/[0.06] focus-visible:bg-rulebook-accent/[0.06]"
      >
        <span className="flex-1">{title}</span>
        {icons.map((icon) => {
          const glyph = iconGlyph(icon);
          return glyph ? <ArmadaIcon key={icon} glyph={glyph} className="text-lg text-rulebook-accent/70" /> : null;
        })}
        <span className="min-w-8 text-right text-sm tabular-nums text-rulebook-muted">{count}</span>
        <ArrowRight className="size-4 text-rulebook-accent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
      </Link>
    </li>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <li className="mb-1 mt-8 flex items-center gap-3 font-aero text-xs font-bold uppercase tracking-[0.15em] text-rulebook-accent after:h-px after:flex-1 after:bg-rulebook-accent/15">
      {children}
    </li>
  );
}

export default async function RulingsIndexPage() {
  const { cards } = await getRulingsData();
  const countFor = (href: string) =>
    RULINGS_PAGES.find((page) => page.href === href)!.select(cards).reduce((sum, group) => sum + group.cards.length, 0);
  const communityCount = cards.filter((card) => card.source === 'community').length;

  const top = RULINGS_PAGES.slice(0, 4);
  const upgrades = RULINGS_PAGES.filter((page) => page.href.startsWith('/rulings/upgrades'));
  const nexus = RULINGS_PAGES.filter((page) => page.href.startsWith('/rulings/nexus'));

  return (
    <div className="mx-auto max-w-[760px] border border-rulebook-accent/10 bg-gradient-to-b from-rulebook-sheet to-rulebook-parchment px-5 py-10 shadow-[0_1px_2px_rgba(24,20,14,0.08),0_18px_48px_rgba(12,14,22,0.28)] sm:px-14 sm:py-14">
      <header className="text-center">
        <h1 className="border-y border-rulebook-accent/35 py-4 font-logo text-[clamp(30px,6vw,52px)] font-bold uppercase leading-none tracking-[0.06em] text-rulebook-accent">
          {RULINGS_TITLE}
        </h1>
        <p className="mt-4 text-rulebook-muted">{RULINGS_DESCRIPTION}</p>
        <p className="mt-2 text-sm text-rulebook-muted">
          Covers the core game with the Armada Community errata applied (marked <CommunityMark />; {communityCount} cards), plus Nexus.
        </p>
      </header>

      <ul className="mt-6">
        {top.map((page) => <SectionLink key={page.href} href={page.href} title={page.navLabel ?? page.title} count={countFor(page.href)} />)}
        <SectionLabel>Upgrades</SectionLabel>
        {upgrades.map((page) => (
          <SectionLink
            key={page.href}
            href={page.href}
            title={page.navLabel ?? page.title}
            count={countFor(page.href)}
            icons={page.href === '/rulings/upgrades' ? [] : upgradeTypeIcons(page.href.split('/').at(-1)!)}
          />
        ))}
        <SectionLabel>Nexus</SectionLabel>
        {nexus.map((page) => <SectionLink key={page.href} href={page.href} title={page.title} count={countFor(page.href)} />)}
      </ul>

      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link
          href="/changelog/arm"
          className="flex items-start gap-3 rounded-lg border border-rulebook-accent/20 bg-white/50 p-4 transition-colors hover:bg-rulebook-accent/[0.06]"
        >
          <ScrollText className="mt-0.5 size-5 shrink-0 text-rulebook-accent" aria-hidden />
          <span>
            <span className="block font-bold">Reference Manual changelog</span>
            <span className="text-sm text-rulebook-muted">Every published ARM revision, with changed text marked.</span>
          </span>
        </Link>
        <Link
          href="/changelog"
          className="flex items-start gap-3 rounded-lg border border-rulebook-accent/20 bg-white/50 p-4 transition-colors hover:bg-rulebook-accent/[0.06]"
        >
          <span className="mt-0.5 text-xl leading-none"><CommunityMark /></span>
          <span>
            <span className="block font-bold">Community Edition changelog</span>
            <span className="text-sm text-rulebook-muted">Points changes and errata in the Community card set.</span>
          </span>
        </Link>
      </section>

      <footer className="mt-10 space-y-2 text-center text-sm text-rulebook-muted">
        <p>
          The full illustrated{' '}
          <a href={ARM_CHANGELOG_SOURCE.fullDocumentUrl} target="_blank" rel="noreferrer" className="text-rulebook-accent underline-offset-2 hover:underline">
            Armada Reference Manual {ARM_CHANGELOG_SOURCE.currentVersion} (PDF)
          </a>{' '}
          remains available. Looking for card stats? Browse the{' '}
          <Link href="/ships" className="text-rulebook-accent underline-offset-2 hover:underline">card wiki</Link>.
        </p>
        <p className="text-xs">Star Wars: Armada is a trademark of Fantasy Flight Games. This is an unofficial fan project.</p>
      </footer>
    </div>
  );
}
