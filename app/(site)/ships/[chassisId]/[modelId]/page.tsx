import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCardCatalog, isHuge } from '@/lib/cards/catalog';
import { cardFace } from '@/lib/cards/images';
import { byName, factionLabel, shipChassisName, shipEntries, shipHref, upgradeFactions, upgradeTypeGlyphs } from '@/lib/cards/entries';
import { upgradeGroupTitle } from '@/lib/rulings/pages';
import { resolveCardKey } from '@/utils/cardSources';
import { ArmadaIcon } from '@/components/rulings/ArmadaIcon';
import { DefenseTokens, DetailFooter, DetailHero, DetailSheet, Dice, neighbors, Pager, RelatedCards, Section, Stats, TitleBlock } from '@/components/wiki/Detail';
import type { Ship } from '@/types/cards';

export const revalidate = false;

type Params = Promise<{ chassisId: string; modelId: string }>;

async function findShip(chassisId: string, modelId: string) {
  const catalog = await getCardCatalog();
  const chassis = catalog.ships[chassisId];
  if (!chassis) return undefined;
  const modelKey = resolveCardKey(chassis.models ?? {}, modelId);
  if (!modelKey) return undefined;
  return { catalog, chassis, modelKey, model: chassis.models[modelKey] };
}

export async function generateStaticParams() {
  const catalog = await getCardCatalog();
  return Object.entries(catalog.ships).flatMap(([chassisId, chassis]) =>
    Object.keys(chassis.models ?? {}).map((modelId) => ({ chassisId, modelId })),
  );
}

const SIZE_LABELS: Record<string, string> = { small: 'Small', medium: 'Medium', large: 'Large', huge: 'Huge', '280-huge': 'Huge', 'wide-huge': 'Huge' };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { chassisId, modelId } = await params;
  const found = await findShip(chassisId, modelId);
  if (!found) return {};
  const { chassis, model, modelKey, catalog } = found;
  const face = cardFace(model.cardimage, catalog.imageStyles, 'ship');
  const description = `${model.name}, a ${SIZE_LABELS[chassis.size]?.toLowerCase() ?? ''} ${factionLabel(model.faction)} ship for Star Wars: Armada. ${model.points} points, hull ${chassis.hull}, command ${model.values?.command}. Stats, navigation chart, armament and upgrade slots.`;
  return {
    title: `${model.name} (${model.points})`,
    description: description.replace(/\s+/g, ' '),
    alternates: { canonical: shipHref(chassisId, modelKey) },
    openGraph: { type: 'article', images: face ? [{ url: face.src, width: face.width, height: face.height, alt: model.name }] : undefined },
  };
}

const YAW = ['–', 'I', 'II'];

function NavigationChart({ speed }: { speed: Ship['speed'] }) {
  const speeds = Object.entries(speed ?? {})
    .filter(([, clicks]) => clicks.length > 0)
    .sort(([a], [b]) => Number(a) - Number(b));
  if (speeds.length === 0) return <p className="text-rulebook-muted">This ship cannot move.</p>;
  const joints = Math.max(...speeds.map(([, clicks]) => clicks.length));
  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-1 text-center">
        <caption className="sr-only">Yaw clicks allowed at each joint for each speed</caption>
        <tbody>
          {Array.from({ length: joints }, (_, row) => joints - 1 - row).map((joint) => (
            <tr key={joint}>
              {speeds.map(([value, clicks]) => (
                <td key={value} className="size-10">
                  {joint < clicks.length ? (
                    <span className="flex size-10 items-center justify-center rounded border border-rulebook-accent/20 bg-white/70 font-aero text-base font-bold text-rulebook-ink">
                      {YAW[clicks[joint]] ?? clicks[joint]}
                    </span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            {speeds.map(([value]) => (
              <th key={value} scope="col" className="size-10">
                <span className="flex size-10 items-center justify-center rounded bg-rulebook-ink font-aero text-lg font-bold text-white">{value}</span>
              </th>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const ZONES: Array<{ key: string; label: string }> = [
  { key: 'front', label: 'Front' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
  { key: 'rear', label: 'Rear' },
  { key: 'left_aux', label: 'Left auxiliary' },
  { key: 'right_aux', label: 'Right auxiliary' },
];

export default async function ShipPage({ params }: { params: Params }) {
  const { chassisId, modelId } = await params;
  const found = await findShip(chassisId, modelId);
  if (!found) notFound();
  const { catalog, chassis, modelKey, model } = found;
  // Links saved before a Community erratum point at the core card it replaced.
  if (modelKey !== modelId) permanentRedirect(shipHref(chassisId, modelKey));

  const face = cardFace(model.cardimage, catalog.imageStyles, 'ship');
  const huge = isHuge(chassis.size);
  const armament = (model.armament ?? {}) as Record<string, number[]>;
  const shields = (chassis.shields ?? {}) as Record<string, number | undefined>;
  const zones = ZONES.filter((zone) => zone.key in shields && ((shields[zone.key] ?? 0) > 0 || (armament[zone.key] ?? []).some(Boolean) || !zone.key.endsWith('_aux')));
  const traits = ([] as string[]).concat(model.traits ?? []).filter((trait) => trait?.trim());
  const slots = ([] as string[]).concat(model.upgrades ?? []).filter((slot) => slot?.trim());
  const siblings = Object.entries(chassis.models ?? {})
    .filter(([key]) => key !== modelKey)
    .map(([key, sibling]) => ({
      href: shipHref(chassisId, key),
      name: sibling.name,
      subtitle: `${sibling.points} points`,
      face: cardFace(sibling.cardimage, catalog.imageStyles, 'ship'),
    }));
  // Titles name the chassis they fit in bound_shiptype; shared chassis such as the
  // Gozanti carry titles for more than one faction.
  const titles = Object.entries(catalog.upgrades)
    .filter(([, upgrade]) => upgrade.type === 'title' && upgrade.bound_shiptype === chassis.chassis_name)
    .filter(([, upgrade]) => {
      const factions = upgradeFactions(upgrade);
      return factions.length === 0 || factions.includes(model.faction);
    })
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([key, upgrade]) => ({
      href: `/upgrades/${key}`,
      name: upgrade.name,
      subtitle: `${upgrade.points} points`,
      face: cardFace(upgrade.cardimage, catalog.imageStyles, 'poker'),
    }));

  return (
    <DetailSheet
      crumbs={[{ href: '/ships', label: 'Ships' }, { href: `/ships?faction=${model.faction}`, label: factionLabel(model.faction, true) }, { href: shipHref(chassisId, modelKey), label: model.name }]}
      pager={<Pager group={`${factionLabel(model.faction, true)} ships`} {...neighbors(shipEntries(catalog).filter((entry) => entry.facets.faction[0] === model.faction).sort(byName), `${chassisId}/${modelKey}`)} />}
    >
      <DetailHero face={face} name={model.name} points={model.points} wide={huge}>
        <TitleBlock
          kicker={`${SIZE_LABELS[chassis.size] ?? chassis.size} ship · ${factionLabel(model.faction)}`}
          name={model.name}
          subtitle={traits.length > 0 ? traits.map((trait) => trait[0].toUpperCase() + trait.slice(1)).join('. ') + '.' : undefined}
          factions={[model.faction]}
          source={model.source}
          unique={model.unique}
        />

        <Stats
          items={[
            { label: 'Points', value: model.points },
            // Command uses the font's "any_token" glyph, the dial symbol printed on ship cards.
            { label: 'Hull', value: chassis.hull, icon: 'hull' },
            { label: 'Command', value: model.values?.command, icon: 'any_token' },
            { label: 'Squadron', value: model.values?.squadron, icon: 'squadron' },
            { label: 'Engineering', value: model.values?.engineer, icon: 'engineering' },
            { label: 'Max speed', icon: 'speed', value: Math.max(0, ...Object.entries(chassis.speed ?? {}).filter(([, clicks]) => clicks.length > 0).map(([value]) => Number(value))) },
          ]}
        />

        <Section title="Defense tokens">
          <DefenseTokens tokens={model.tokens} />
        </Section>

        <Section title="Shields and armament">
          <div className="overflow-x-auto rounded-md border border-rulebook-accent/15 bg-white/40">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-rulebook-accent/15 font-aero text-[11px] uppercase tracking-[0.12em] text-rulebook-accent">
                  <th scope="col" className="px-3 py-2">Hull zone</th>
                  <th scope="col" className="px-3 py-2">Shields</th>
                  <th scope="col" className="px-3 py-2">Battery armament</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.key} className="border-b border-rulebook-accent/10 last:border-0">
                    <th scope="row" className="px-3 py-2 font-normal">{zone.label}</th>
                    <td className="px-3 py-2 tabular-nums">{shields[zone.key] ?? 0}</td>
                    <td className="px-3 py-2"><Dice dice={armament[zone.key]} /></td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-3 py-2 font-normal">Anti-squadron</th>
                  <td className="px-3 py-2 text-rulebook-muted">·</td>
                  <td className="px-3 py-2"><Dice dice={armament.asa} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Navigation chart">
          <NavigationChart speed={chassis.speed} />
        </Section>

        {slots.length > 0 && (
          <Section title="Upgrade slots">
            <ul className="flex flex-wrap gap-2">
              {slots.map((slot, index) => (
                <li key={`${slot}${index}`} className="inline-flex items-center gap-2 rounded-full border border-rulebook-accent/20 bg-white/60 py-1 pl-2 pr-3 text-sm">
                  {upgradeTypeGlyphs(slot).map((glyph) => <ArmadaIcon key={glyph} glyph={glyph} className="text-lg text-rulebook-accent" />)}
                  {upgradeGroupTitle(slot).replace(/s$/, '')}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </DetailHero>

      <RelatedCards title={`Other ${shipChassisName(chassis)} cards`} cards={siblings} />
      <RelatedCards title="Titles" cards={titles} />

      <DetailFooter
        favorite={{ id: `${chassisId}/${modelKey}`, type: 'ship', name: model.name, faction: model.faction, points: model.points, href: shipHref(chassisId, modelKey) }}
        comments={{ cardType: 'ship', cardId: `${chassisId}-${modelKey}` }}
        compareHref={`/compare?cards=${encodeURIComponent(`${chassisId}/${modelKey}`)}`}
      />
    </DetailSheet>
  );
}
