/* eslint-disable @next/next/no-img-element -- card art comes from several remote hosts */
import { Link2 } from 'lucide-react';
import { buildCardSections, type RulingCard as RulingCardData } from '@/lib/rulings/build';
import { iconGlyph } from '@/lib/rulings/data';
import { upgradeTypeIcons } from '@/lib/rulings/pages';
import { cn } from '@/lib/utils';
import { ArmadaIcon, NewRepublicIcon } from './ArmadaIcon';
import { RulingText, renderInline, type RulingTextContext } from './RulingText';

const FACTION_LABELS: Record<string, string> = {
  rebel: 'Rebel Alliance',
  empire: 'Galactic Empire',
  republic: 'Galactic Republic',
  separatist: 'Separatist Alliance',
  scum: 'Scum & Villainy',
};

function FactionIcons({ factions }: { factions: string[] }) {
  return (
    <>
      {factions.map((faction) => {
        if (faction === 'new-republic') return <NewRepublicIcon key={faction} />;
        const glyph = iconGlyph(faction);
        return glyph ? <ArmadaIcon key={faction} glyph={glyph} label={FACTION_LABELS[faction] ?? faction} /> : null;
      })}
    </>
  );
}

export function CommunityMark() {
  return (
    <span
      title="Armada Community edition"
      className="community-mark"
    >
      <span className="sr-only">Community edition</span>
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <h4 className="ruling-label">{children}</h4>;
}

function Refs({ footnote, note }: { footnote?: number; note?: number }) {
  if (!footnote && !note) return null;
  return (
    <sup className="ruling-ref">
      {[footnote, note && String.fromCharCode(96 + note)].filter(Boolean).join(',')}
    </sup>
  );
}

/** Where the card's own text is a quotation of the printed card, the ARM sets it in italics. */
const QUOTES_CARD_TEXT = new Set(['upgrades', 'nexus-upgrades', 'ace-squadrons', 'nexus-ace-squadrons']);

export function RulingCard({ card, ctx }: { card: RulingCardData; ctx: RulingTextContext }) {
  const sections = buildCardSections(card);
  const textCtx = { ...ctx, selfKey: card.key };
  const upgradeIcons = card.upgradeType ? upgradeTypeIcons(card.upgradeType) : [];

  return (
    <article
      id={card.anchorId}
      data-ruling-card
      data-name={card.name.toLowerCase()}
      data-factions={card.factions.join(',')}
      className="group/card scroll-mt-20 md:scroll-mt-48"
    >
      <div className="flex gap-6 max-sm:flex-col max-sm:items-center">
        <div className="w-[200px] shrink-0 sm:w-[220px]">
          {card.image ? (
            <img
              src={card.image}
              alt={card.name}
              width={220}
              height={312}
              loading="lazy"
              decoding="async"
              className="ruling-card-image object-cover"
            />
          ) : (
            <div className="ruling-card-image flex items-center justify-center italic text-rulebook-muted">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3.5 max-sm:w-full">
          <h3 className="ruling-card-title">
            <span>{card.name}</span>
            <span className="inline-flex items-baseline gap-1 text-[0.72em] tracking-normal">
              {card.showFactionIcons && <FactionIcons factions={card.factions} />}
              {upgradeIcons.map((icon) => {
                const glyph = iconGlyph(icon);
                return glyph ? <ArmadaIcon key={icon} glyph={glyph} label={icon.replace(/_/g, ' ')} /> : null;
              })}
            </span>
            {card.points !== undefined && <span className="tracking-normal">({card.points})</span>}
            {card.source === 'community' && <CommunityMark />}
            <a
              href={`#${card.anchorId}`}
              data-copy-link
              aria-label={`Copy link to ${card.name}`}
              title="Copy link"
              className="ruling-copy-link"
            >
              <Link2 className="size-4" aria-hidden />
            </a>
          </h3>

          {card.category.endsWith('ace-squadrons') && card.keywords.length > 0 && (
            <p className="text-[15px]">
              <span className="mr-2 font-aero font-bold uppercase tracking-[0.04em] text-rulebook-accent">Keywords:</span>
              <span className="font-aero font-bold capitalize">{card.keywords.join(', ')}</span>
            </p>
          )}

          {sections.cardText && (
            <section>
              {card.category !== 'damage-cards' && <Label>Card Text</Label>}
              <div className={cn('rulebook-prose', QUOTES_CARD_TEXT.has(card.category) && 'italic')}>
                <RulingText text={sections.cardText} ctx={textCtx} />
              </div>
            </section>
          )}

          {sections.timing.length > 0 && (
            <section>
              <Label>Timing</Label>
              <div className="rulebook-prose">
                {sections.timing.map((entry, index) => (
                  <p key={index}>
                    {renderInline(entry.text, textCtx, `t${index}`)}
                    <Refs footnote={entry.footnote} note={entry.note} />
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {sections.sections.length > 0 && (
        <div className="mt-4 space-y-4">
          {sections.sections.map((section) => (
            <section key={section.key}>
              <Label>{section.label}</Label>
              <ul className="rulebook-prose ruling-list">
                {section.entries.map((entry, index) => (
                  <li key={index} className={cn(entry.defunct && 'opacity-55')}>
                    <span className={cn(entry.defunct && 'line-through')}>
                      {renderInline(entry.text, textCtx, `${section.key}${index}`)}
                    </span>
                    <Refs footnote={entry.footnote} note={entry.note} />
                    {entry.defunct && entry.explanation && (
                      <div className="mt-0.5 text-[0.82em] italic">{entry.explanation}</div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {(sections.footnotes.length > 0 || sections.notes.length > 0) && (
        <footer className="mt-4 border-t border-rulebook-accent/10 pt-2 text-xs text-rulebook-muted">
          {sections.footnotes.map((note, index) => <div key={`f${index}`}>[{index + 1}] {note}</div>)}
          {sections.notes.map((note, index) => (
            <div key={`n${index}`}>[{String.fromCharCode(97 + index)}] {renderInline(note, textCtx, `n${index}`)}</div>
          ))}
        </footer>
      )}
    </article>
  );
}
