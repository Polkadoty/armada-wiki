import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCardCatalog } from '@/lib/cards/catalog';
import { cardFace } from '@/lib/cards/images';
import { factionLabel, keywordLabel, squadronName } from '@/lib/cards/entries';
import { apiKeyOf, cardRulings } from '@/lib/cards/rulings';
import { iconGlyph } from '@/lib/rulings/data';
import { resolveCardKey } from '@/utils/cardSources';
import { formatChassisName } from '@/utils/diceDisplay';
import { ArmadaIcon } from '@/components/rulings/ArmadaIcon';
import { CardTextAndRulings, DefenseTokens, DetailFooter, DetailHero, DetailSheet, Dice, RelatedCards, Section, Stats, TitleBlock } from '@/components/wiki/Detail';
import type { Squadron } from '@/types/cards';

export const revalidate = false;

type Params = Promise<{ id: string }>;

async function findSquadron(id: string) {
  const catalog = await getCardCatalog();
  const key = resolveCardKey(catalog.squadrons, id);
  return key ? { catalog, key, squadron: catalog.squadrons[key] } : undefined;
}

export async function generateStaticParams() {
  const catalog = await getCardCatalog();
  return Object.keys(catalog.squadrons).map((id) => ({ id }));
}

const typeLine = (squadron: Squadron) => formatChassisName(squadron.squadron_type || squadron.name);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const found = await findSquadron(id);
  if (!found) return {};
  const { squadron, key, catalog } = found;
  const name = squadronName(squadron);
  const face = cardFace(squadron.cardimage, catalog.imageStyles, 'poker');
  const intro = squadron['ace-name'] ? `${name}, a ${squadron.name} ace` : `${squadron.name}, a squadron`;
  return {
    title: `${name} (${squadron.points})`,
    description: `${intro} for ${factionLabel(squadron.faction)} in Star Wars: Armada. ${squadron.points} points, hull ${squadron.hull}, speed ${squadron.speed}. ${squadron.ability ?? ''}`.trim().slice(0, 300),
    alternates: { canonical: `/squadrons/${key}` },
    openGraph: { type: 'article', images: face ? [{ url: face.src, width: face.width, height: face.height, alt: name }] : undefined },
  };
}

export default async function SquadronPage({ params }: { params: Params }) {
  const { id } = await params;
  const found = await findSquadron(id);
  if (!found) notFound();
  const { catalog, key, squadron } = found;
  if (key !== id) permanentRedirect(`/squadrons/${key}`);

  const name = squadronName(squadron);
  const face = cardFace(squadron.cardimage, catalog.imageStyles, 'poker');
  const keywords = Object.entries(squadron.abilities ?? {}).filter(([, value]) => value === true || (typeof value === 'number' && value > 0));
  const rulings = await cardRulings(squadron.source, apiKeyOf(key), { cardText: squadron.ability, rules: squadron.rules, rulings: squadron.rulings });

  // Other cards for the same craft: the generic squadron and its aces.
  const craft = squadron.squadron_type;
  const related = craft
    ? Object.entries(catalog.squadrons)
        .filter(([other, entry]) => other !== key && entry.squadron_type === craft)
        .map(([other, entry]) => ({ href: `/squadrons/${other}`, name: squadronName(entry), subtitle: `${entry.points} points`, face: cardFace(entry.cardimage, catalog.imageStyles, 'poker') }))
    : [];

  return (
    <DetailSheet crumbs={[{ href: '/squadrons', label: 'Squadrons' }, { href: `/squadrons/${key}`, label: name }]}>
      <DetailHero face={face} name={name} points={squadron.points}>
        <TitleBlock
          kicker={`${squadron.unique ? 'Ace squadron' : 'Squadron'} · ${factionLabel(squadron.faction)}`}
          name={name}
          subtitle={squadron['ace-name'] ? squadron.name : typeLine(squadron) !== squadron.name ? typeLine(squadron) : undefined}
          factions={[squadron.faction]}
          source={squadron.source}
          unique={squadron.unique}
        />

        <Stats
          items={[
            { label: 'Points', value: squadron.points },
            { label: 'Hull', value: squadron.hull },
            { label: 'Speed', value: squadron.speed },
            { label: 'Anti-squadron', value: <Dice dice={squadron.armament?.['anti-squadron']} /> },
            { label: 'Anti-ship', value: <Dice dice={squadron.armament?.['anti-ship']} /> },
            { label: 'Defense tokens', value: <DefenseTokens tokens={squadron.tokens} /> },
          ]}
        />

        {keywords.length > 0 && (
          <Section title="Keywords">
            <ul className="flex flex-wrap gap-2">
              {keywords.map(([keyword, value]) => {
                const glyph = iconGlyph(keyword.startsWith('ai-') ? 'ai' : keyword);
                return (
                  <li key={keyword} className="inline-flex items-center gap-2 rounded-full border border-rulebook-accent/20 bg-white/60 py-1 pl-2 pr-3">
                    {glyph && <ArmadaIcon glyph={glyph} className="text-lg text-rulebook-accent" />}
                    <span className="font-aero text-sm font-bold uppercase tracking-[0.04em]">
                      {keywordLabel(keyword)}
                      {typeof value === 'number' ? ` ${value}` : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        <CardTextAndRulings rulings={rulings} italic />
      </DetailHero>

      <RelatedCards title="Same craft" cards={related} />

      <DetailFooter
        favorite={{ id: key, type: 'squadron', name, faction: squadron.faction, points: squadron.points, href: `/squadrons/${key}` }}
        comments={{ cardType: 'squadron', cardId: key }}
      />
    </DetailSheet>
  );
}
