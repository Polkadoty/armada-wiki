import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, GitCompare, ScrollText } from 'lucide-react';
import { buildCardSections } from '@/lib/rulings/build';
import { iconGlyph } from '@/lib/rulings/data';
import type { CardRulings } from '@/lib/cards/rulings';
import type { CardFace } from '@/lib/cards/images';
import { factionLabel } from '@/lib/cards/entries';
import { cn } from '@/lib/utils';
import { ArmadaIcon, NewRepublicIcon } from '@/components/rulings/ArmadaIcon';
import { RulingText, renderInline } from '@/components/rulings/RulingText';
import { Comments } from '@/components/Comments';
import { FavoriteButton } from '@/components/FavoriteButton';
import type { Favorite } from '@/hooks/useFavorites';
import { CardFaceSwitch } from './CardFaceSwitch';
import { CommunityMark } from './Marks';
import { Dice } from './Dice';

export { Dice };

// Building blocks of the card detail pages, set like an entry in the rulebook.

export interface Crumb {
  href: string;
  label: string;
}

export interface Neighbor {
  href: string;
  name: string;
}

/** The cards before and after this one in its browse group, such as the same faction or slot. */
export function Pager({ prev, next, group }: { prev?: Neighbor; next?: Neighbor; group: string }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={`More ${group}`} className="flex items-center gap-1 text-sm">
      {prev ? (
        <Link href={prev.href} rel="prev" className="inline-flex max-w-[45vw] items-center gap-1 rounded-md px-2 py-1 text-rulebook-ink hover:bg-rulebook-accent/10 sm:max-w-56" title={prev.name}>
          <ChevronLeft className="size-4 shrink-0 text-rulebook-accent" aria-hidden />
          <span className="truncate">{prev.name}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link href={next.href} rel="next" className="inline-flex max-w-[45vw] items-center gap-1 rounded-md px-2 py-1 text-rulebook-ink hover:bg-rulebook-accent/10 sm:max-w-56" title={next.name}>
          <span className="truncate">{next.name}</span>
          <ChevronRight className="size-4 shrink-0 text-rulebook-accent" aria-hidden />
        </Link>
      )}
    </nav>
  );
}

export function neighbors<T extends { key: string; href: string; name: string }>(group: T[], key: string): { prev?: Neighbor; next?: Neighbor } {
  const index = group.findIndex((entry) => entry.key === key);
  if (index < 0) return {};
  const pick = (entry?: T) => (entry ? { href: entry.href, name: entry.name } : undefined);
  return { prev: pick(group[index - 1]), next: pick(group[index + 1]) };
}

export function DetailSheet({ crumbs, pager, children }: { crumbs: Crumb[]; pager?: ReactNode; children: ReactNode }) {
  return (
    <article className="wiki-sheet mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <nav aria-label="Breadcrumb" className="text-sm text-rulebook-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="size-3.5" aria-hidden />}
              <Link href={crumb.href} className="hover:text-rulebook-accent hover:underline">{crumb.label}</Link>
            </li>
          ))}
        </ol>
      </nav>
      {pager}
      </div>
      {children}
    </article>
  );
}

interface DetailHeroProps {
  face?: CardFace;
  name: string;
  points?: number;
  /** The wide huge-ship cards get a wider image column. */
  wide?: boolean;
  children: ReactNode;
}

export function DetailHero({ face, name, points, wide, children }: DetailHeroProps) {
  return (
    <div className={cn('grid gap-8 md:gap-10', wide ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]' : 'md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
      <div className={cn('mx-auto w-full md:sticky md:top-20 md:self-start', wide ? 'max-w-2xl' : 'max-w-sm')}>
        <CardFaceSwitch face={face} alt={name} points={points} />
      </div>
      <div className="min-w-0 space-y-7">{children}</div>
    </div>
  );
}

export function FactionMarks({ factions }: { factions: string[] }) {
  return (
    <>
      {factions.map((faction) => {
        if (faction === 'new-republic') return <NewRepublicIcon key={faction} />;
        const glyph = iconGlyph(faction);
        return glyph ? <ArmadaIcon key={faction} glyph={glyph} label={factionLabel(faction)} /> : null;
      })}
    </>
  );
}

interface TitleBlockProps {
  name: string;
  /** Small line above the name, such as "Officer upgrade". */
  kicker: ReactNode;
  subtitle?: ReactNode;
  factions?: string[];
  source?: string;
  unique?: boolean;
}

export function TitleBlock({ name, kicker, subtitle, factions = [], source, unique }: TitleBlockProps) {
  return (
    <header>
      <p className="font-aero text-xs font-bold uppercase tracking-[0.15em] text-rulebook-accent">{kicker}</p>
      <h1 className="ruling-card-title mt-2 !text-[clamp(30px,4.2vw,44px)]">
        {unique && <span aria-label="Unique" className="-mr-1">•</span>}
        <span>{name}</span>
        <span className="inline-flex items-baseline gap-1.5 text-[0.62em] tracking-normal text-rulebook-ink">
          <FactionMarks factions={factions} />
        </span>
        {source === 'Community' && <CommunityMark />}
      </h1>
      {subtitle && <p className="mt-1.5 text-[17px] text-rulebook-muted">{subtitle}</p>}
      {source && source !== 'Core' && (
        <p className="mt-3 text-sm text-rulebook-muted">
          {source === 'Community'
            ? 'Community Edition card. It replaces a printed card or adds a new one.'
            : 'Nexus card, from a community expansion.'}
        </p>
      )}
    </header>
  );
}

export function Stats({ items }: { items: Array<{ label: string; value: ReactNode } | false | undefined> }) {
  const shown = items.filter(Boolean) as Array<{ label: string; value: ReactNode }>;
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {shown.map((item) => (
        <div key={item.label} className="wiki-stat">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      <h2 className="wiki-section-title">{title}</h2>
      {children}
    </section>
  );
}

const TOKEN_ORDER = ['def_brace', 'def_redirect', 'def_evade', 'def_scatter', 'def_contain', 'def_salvo'];

export function DefenseTokens({ tokens }: { tokens?: Record<string, number | undefined> }) {
  const list = TOKEN_ORDER.flatMap((token) => Array.from({ length: tokens?.[token] ?? 0 }, () => token));
  if (list.length === 0) return <span className="text-rulebook-muted">None</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {list.map((token, index) => {
        const name = token.replace('def_', '');
        const glyph = iconGlyph(name);
        return glyph ? (
          <span key={`${token}${index}`} className="inline-flex size-8 items-center justify-center rounded-full border border-rulebook-accent/25 bg-white/80 text-rulebook-accent">
            <ArmadaIcon glyph={glyph} label={name} className="text-lg" />
          </span>
        ) : (
          <span key={`${token}${index}`} className="capitalize">{name}</span>
        );
      })}
    </span>
  );
}

/** Card text, timing and every rulings section, as the ARM lays them out. */
export function CardTextAndRulings({ rulings, italic }: { rulings: CardRulings; italic?: boolean }) {
  const sections = buildCardSections({ cardText: rulings.cardText, rules: rulings.rules });
  const ctx = { linkIndex: rulings.linkIndex, selfKey: rulings.selfKey };
  const hasRulings = sections.timing.length > 0 || sections.sections.length > 0;
  return (
    <>
      {sections.cardText && (
        <Section title="Card text">
          <div className={cn('rulebook-prose rounded-md border-l-2 border-rulebook-accent/30 bg-white/40 py-2 pl-4 pr-3 text-[17px]', italic && 'italic')}>
            <RulingText text={sections.cardText} ctx={ctx} />
          </div>
        </Section>
      )}
      {hasRulings && (
        <Section title="Rulings">
          <div className="space-y-4">
            {sections.timing.length > 0 && (
              <div>
                <h3 className="ruling-label">Timing</h3>
                <div className="rulebook-prose">
                  {sections.timing.map((entry, index) => (
                    <p key={index}>
                      {renderInline(entry.text, ctx, `t${index}`)}
                      <Refs footnote={entry.footnote} note={entry.note} />
                    </p>
                  ))}
                </div>
              </div>
            )}
            {sections.sections.map((section) => (
              <div key={section.key}>
                <h3 className="ruling-label">{section.label}</h3>
                <ul className="rulebook-prose ruling-list">
                  {section.entries.map((entry, index) => (
                    <li key={index} className={cn(entry.defunct && 'opacity-55')}>
                      <span className={cn(entry.defunct && 'line-through')}>{renderInline(entry.text, ctx, `${section.key}${index}`)}</span>
                      <Refs footnote={entry.footnote} note={entry.note} />
                      {entry.defunct && entry.explanation && <div className="mt-0.5 text-[0.82em] italic">{entry.explanation}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {(sections.footnotes.length > 0 || sections.notes.length > 0) && (
              <footer className="border-t border-rulebook-accent/10 pt-2 text-xs text-rulebook-muted">
                {sections.footnotes.map((note, index) => <div key={`f${index}`}>[{index + 1}] {note}</div>)}
                {sections.notes.map((note, index) => (
                  <div key={`n${index}`}>[{String.fromCharCode(97 + index)}] {renderInline(note, ctx, `n${index}`)}</div>
                ))}
              </footer>
            )}
          </div>
        </Section>
      )}
      {rulings.rulingsHref && (
        <Link href={rulings.rulingsHref} className="inline-flex items-center gap-2 text-sm text-rulebook-accent hover:underline">
          <ScrollText className="size-4" aria-hidden />
          Open this card in Rules &amp; Rulings
        </Link>
      )}
    </>
  );
}

function Refs({ footnote, note }: { footnote?: number; note?: number }) {
  if (!footnote && !note) return null;
  return <sup className="ruling-ref">{[footnote, note && String.fromCharCode(96 + note)].filter(Boolean).join(',')}</sup>;
}

export function RelatedCards({ title, cards }: { title: string; cards: Array<{ href: string; name: string; subtitle?: string; face?: CardFace; points?: number }> }) {
  if (cards.length === 0) return null;
  return (
    <Section title={title} className="mt-12">
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {cards.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className="group block">
              {card.face ? (
                // eslint-disable-next-line @next/next/no-img-element -- card faces come from the card API's image hosts
                <img src={card.face.src} alt="" width={card.face.width} height={card.face.height} loading="lazy" decoding="async" className="wiki-card-face h-auto w-full transition-transform group-hover:-translate-y-0.5" />
              ) : (
                <div className="wiki-card-face aspect-[5/7]" />
              )}
              <div className="mt-1.5 truncate text-[13px] font-bold leading-tight group-hover:text-rulebook-accent">{card.name}</div>
              {card.subtitle && <div className="truncate text-xs text-rulebook-muted">{card.subtitle}</div>}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function DetailFooter({ favorite, comments, compareHref }: { favorite: Omit<Favorite, 'addedAt'>; comments: { cardType: Favorite['type']; cardId: string }; compareHref?: string }) {
  return (
    <div className="mt-12 border-t border-rulebook-accent/15 pt-8">
      <div className="mb-6 flex flex-wrap justify-end gap-2">
        {compareHref && (
          <Link href={compareHref} className="inline-flex h-8 items-center gap-2 rounded-md border border-rulebook-accent/25 bg-white/60 px-3 text-sm hover:border-rulebook-accent/50 hover:text-rulebook-accent">
            <GitCompare className="size-4" aria-hidden />
            Compare
          </Link>
        )}
        <FavoriteButton favorite={favorite} variant="outline" size="sm" showLabel />
      </div>
      <Comments cardType={comments.cardType} cardId={comments.cardId} />
    </div>
  );
}
