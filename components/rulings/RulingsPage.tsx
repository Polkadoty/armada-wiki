import { Fragment } from 'react';
import { getRulingsData, getSectionIntro, iconGlyph } from '@/lib/rulings/data';
import { buildCardSections } from '@/lib/rulings/build';
import { upgradeTypeIcons, type RulingsPageSpec } from '@/lib/rulings/pages';
import { ArmadaIcon } from './ArmadaIcon';
import { RulingCard } from './RulingCard';
import { RulingsToolbar } from './RulingsToolbar';
import { RulingText, renderInline, type RulingTextContext } from './RulingText';

function GroupIntro({ introKey, ctx }: { introKey?: string; ctx: RulingTextContext }) {
  const intro = getSectionIntro(introKey);
  if (!intro) return null;
  const sections = buildCardSections(intro);
  return (
    <div className="mt-6 space-y-4 px-1">
      {sections.cardText && (
        <section>
          <h4 className="ruling-label">Card Text</h4>
          <div className="rulebook-prose">
            <RulingText text={sections.cardText} ctx={ctx} />
          </div>
        </section>
      )}
      {sections.sections.map((section) => (
        <section key={section.key}>
          <h4 className="ruling-label">{section.label}</h4>
          <ul className="rulebook-prose ruling-list">
            {section.entries.map((entry, index) => <li key={index}>{renderInline(entry.text, ctx, `${section.key}${index}`)}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}

export async function RulingsPage({ spec }: { spec: RulingsPageSpec }) {
  const { cards, linkIndex } = await getRulingsData();
  const groups = spec.select(cards).filter((group) => group.cards.length > 0);
  const ctx: RulingTextContext = { linkIndex };
  const total = groups.reduce((sum, group) => sum + group.cards.length, 0);
  // A page that is one group already carries its title in the group header.
  const showPageTitle = groups.length !== 1 || groups[0].title !== spec.title;

  return (
    <div className="mx-auto max-w-[920px] border border-rulebook-accent/10 bg-gradient-to-b from-rulebook-sheet to-rulebook-parchment px-5 py-8 shadow-[0_1px_2px_rgba(24,20,14,0.08),0_18px_48px_rgba(12,14,22,0.28)] sm:px-12 sm:py-12">
      {showPageTitle && (
        <header className="mb-8 text-center">
          <h1 className="border-y border-rulebook-accent/35 py-3 font-logo text-[clamp(28px,4.4vw,44px)] font-bold uppercase leading-none tracking-[0.06em] text-rulebook-accent">
            {spec.title}
          </h1>
          <p className="mt-3 text-sm text-rulebook-muted">{spec.description}</p>
        </header>
      )}

      <RulingsToolbar total={total} />

      <div id="rulings-cards">
        {groups.map((group) => (
          <section key={group.id} id={`group-${group.id}`} data-ruling-group className="scroll-mt-20 md:scroll-mt-48 [&+&]:mt-14">
            <h2 className="flex items-center justify-center gap-3 border-y border-rulebook-accent/35 py-3 text-center font-logo text-[clamp(24px,3.6vw,36px)] font-bold uppercase leading-none tracking-[0.05em] text-rulebook-accent">
              {group.title}
              {group.icon && upgradeTypeIcons(group.icon).map((icon) => {
                const glyph = iconGlyph(icon);
                return glyph ? <ArmadaIcon key={icon} glyph={glyph} className="text-[0.8em] normal-case" /> : null;
              })}
            </h2>
            <GroupIntro introKey={group.introKey} ctx={ctx} />
            <div className="mt-10">
              {group.cards.map((card, index) => (
                <Fragment key={card.key}>
                  {index > 0 && <hr data-ruling-divider className="my-9 border-0 border-t border-rulebook-accent/15" />}
                  <RulingCard card={card} ctx={ctx} />
                </Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
