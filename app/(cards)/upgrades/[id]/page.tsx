import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCardCatalog } from '@/lib/cards/catalog';
import { cardFace } from '@/lib/cards/images';
import { factionLabel, upgradeFactions, upgradeTypeGlyphs } from '@/lib/cards/entries';
import { apiKeyOf, cardRulings } from '@/lib/cards/rulings';
import { upgradeTypeLabel } from '@/lib/rulings/build';
import { resolveCardKey } from '@/utils/cardSources';
import { formatChassisName } from '@/utils/diceDisplay';
import { ArmadaIcon } from '@/components/rulings/ArmadaIcon';
import { CardTextAndRulings, DetailFooter, DetailHero, DetailSheet, RelatedCards, Section, Stats, TitleBlock } from '@/components/wiki/Detail';
import type { Upgrade } from '@/types/cards';

export const revalidate = false;

type Params = Promise<{ id: string }>;

async function findUpgrade(id: string) {
  const catalog = await getCardCatalog();
  const key = resolveCardKey(catalog.upgrades, id);
  return key ? { catalog, key, upgrade: catalog.upgrades[key] } : undefined;
}

export async function generateStaticParams() {
  const catalog = await getCardCatalog();
  return Object.keys(catalog.upgrades).map((id) => ({ id }));
}

// Some cards publish a single string where most publish a list.
const clean = (values?: string[] | string) =>
  (Array.isArray(values) ? values : values ? [values] : []).map((value) => String(value ?? '').trim()).filter(Boolean);
const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);

function restrictionLines(upgrade: Upgrade): string[] {
  const lines: string[] = [];
  const restrictions = upgrade.restrictions ?? {};
  const traits = clean(restrictions.traits);
  const sizes = clean(restrictions.size);
  if (sizes.length) lines.push(`${sizes.map(capitalize).join(' or ')} ship only`);
  if (traits.length) lines.push(`${traits.map(capitalize).join(' or ')} only`);
  if (upgrade.bound_shiptype?.trim()) lines.push(`${formatChassisName(upgrade.bound_shiptype)} only`);
  if (restrictions.flagship) lines.push('Flagship only');
  if (upgrade.modification) lines.push('Modification');
  const disqualified = clean(restrictions.disqual_upgrades);
  if (disqualified.length) lines.push(`Cannot be equipped with ${disqualified.map((type) => upgradeTypeLabel(type)).join(' or ')} upgrades`);
  return lines;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const found = await findUpgrade(id);
  if (!found) return {};
  const { upgrade, key, catalog } = found;
  const face = cardFace(upgrade.cardimage, catalog.imageStyles, 'poker');
  const ability = (upgrade.ability ?? '').replace(/:[a-z_-]+:/gi, '').replace(/\s+/g, ' ').trim();
  return {
    title: `${upgrade.name} (${upgradeTypeLabel(upgrade.type)})`,
    description: `${upgrade.name}, a ${upgrade.points}-point ${upgradeTypeLabel(upgrade.type).toLowerCase()} upgrade for Star Wars: Armada. ${ability}`.slice(0, 300),
    alternates: { canonical: `/upgrades/${key}` },
    openGraph: { type: 'article', images: face ? [{ url: face.src, width: face.width, height: face.height, alt: upgrade.name }] : undefined },
  };
}

export default async function UpgradePage({ params }: { params: Params }) {
  const { id } = await params;
  const found = await findUpgrade(id);
  if (!found) notFound();
  const { catalog, key, upgrade } = found;
  if (key !== id) permanentRedirect(`/upgrades/${key}`);

  const face = cardFace(upgrade.cardimage, catalog.imageStyles, 'poker');
  const factions = upgradeFactions(upgrade);
  const typeLabel = upgradeTypeLabel(upgrade.type);
  const restrictions = restrictionLines(upgrade);
  const rulings = await cardRulings(upgrade.source, apiKeyOf(key), { cardText: upgrade.ability, rules: upgrade.rules, rulings: upgrade.rulings });

  // Other versions of the same card: its core printing, an erratum, or a Nexus take.
  const related = Object.entries(catalog.upgrades)
    .filter(([other, entry]) => other !== key && entry.name === upgrade.name)
    .map(([other, entry]) => ({ href: `/upgrades/${other}`, name: entry.name, subtitle: `${entry.source} · ${entry.points} points`, face: cardFace(entry.cardimage, catalog.imageStyles, 'poker') }));

  return (
    <DetailSheet crumbs={[{ href: '/upgrades', label: 'Upgrades' }, { href: `/upgrades?type=${upgrade.type}`, label: typeLabel }, { href: `/upgrades/${key}`, label: upgrade.name }]}>
      <DetailHero face={face} name={upgrade.name} points={upgrade.points}>
        <TitleBlock
          kicker={
            <span className="inline-flex items-center gap-2">
              {upgradeTypeGlyphs(upgrade.type).map((glyph) => <ArmadaIcon key={glyph} glyph={glyph} className="text-base" />)}
              {typeLabel} upgrade
            </span>
          }
          name={upgrade.name}
          factions={factions}
          source={upgrade.source}
          unique={upgrade.unique}
        />

        <Stats
          items={[
            { label: 'Points', value: upgrade.points },
            { label: 'Faction', value: factions.length ? factions.map((faction) => factionLabel(faction, true)).join(', ') : 'Any' },
            { label: 'Unique', value: upgrade.unique ? 'Yes' : 'No' },
          ]}
        />

        {restrictions.length > 0 && (
          <Section title="Restrictions">
            <ul className="rulebook-prose ruling-list">
              {restrictions.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </Section>
        )}

        <CardTextAndRulings rulings={rulings} italic />
      </DetailHero>

      <RelatedCards title="Other versions" cards={related} />

      <DetailFooter
        favorite={{ id: key, type: 'upgrade', name: upgrade.name, faction: factions[0], points: upgrade.points, href: `/upgrades/${key}` }}
        comments={{ cardType: 'upgrade', cardId: key }}
      />
    </DetailSheet>
  );
}
