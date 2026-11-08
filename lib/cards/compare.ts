import { upgradeTypeLabel } from '@/lib/rulings/build';
import type { CardCatalog } from './catalog';
import { factionLabel, keywordLabel, shipChassisName, shipHref, squadronName, upgradeFactions } from './entries';
import { cardFace } from './images';

export type CompareKind = 'ship' | 'squadron' | 'upgrade';

export interface CompareValue {
  label: string;
  /** Text to show; omitted when `dice` is shown instead. */
  text?: string;
  /** `[red, blue, black]`. */
  dice?: number[];
  /** Set for values where higher is a meaningful comparison. */
  number?: number;
}

export interface CompareCard {
  key: string;
  name: string;
  subtitle?: string;
  href: string;
  image?: string;
  values: CompareValue[];
  text?: string;
}

const TOKENS = ['def_brace', 'def_redirect', 'def_evade', 'def_scatter', 'def_contain', 'def_salvo'];
const tokenList = (tokens?: Record<string, number | undefined>) =>
  TOKENS.flatMap((token) => Array.from({ length: tokens?.[token] ?? 0 }, () => token.replace('def_', ''))).map((name) => name[0].toUpperCase() + name.slice(1)).join(', ') || 'None';
const num = (label: string, value: number | undefined): CompareValue => ({ label, text: value === undefined ? '·' : String(value), number: value });

export function compareCards(catalog: CardCatalog): Record<CompareKind, CompareCard[]> {
  const ships = Object.entries(catalog.ships).flatMap(([chassisKey, chassis]) =>
    Object.entries(chassis.models ?? {}).map(([modelKey, model]): CompareCard => {
      const armament = (model.armament ?? {}) as Record<string, number[]>;
      const speeds = Object.entries(chassis.speed ?? {}).filter(([, clicks]) => clicks.length > 0).map(([speed]) => Number(speed));
      return {
        key: `${chassisKey}/${modelKey}`,
        name: model.name,
        subtitle: `${shipChassisName(chassis)} · ${factionLabel(model.faction, true)}`,
        href: shipHref(chassisKey, modelKey),
        image: cardFace(model.cardimage, catalog.imageStyles, 'ship')?.src,
        values: [
          num('Points', model.points),
          { label: 'Size', text: chassis.size.replace(/^\d+-|wide-/, '').replace(/^./, (c) => c.toUpperCase()) },
          num('Hull', chassis.hull),
          num('Command', model.values?.command),
          num('Squadron', model.values?.squadron),
          num('Engineering', model.values?.engineer),
          num('Max speed', speeds.length ? Math.max(...speeds) : 0),
          { label: 'Shields', text: ['front', 'left', 'right', 'rear'].map((zone) => (chassis.shields as unknown as Record<string, number>)?.[zone] ?? 0).join(' / ') },
          { label: 'Front', dice: armament.front },
          { label: 'Sides', dice: armament.left },
          { label: 'Rear', dice: armament.rear },
          { label: 'Anti-squadron', dice: armament.asa },
          { label: 'Defense tokens', text: tokenList(model.tokens) },
          { label: 'Upgrade slots', text: ([] as string[]).concat(model.upgrades ?? []).filter((slot) => slot?.trim()).map(upgradeTypeLabel).join(', ') },
        ],
      };
    }),
  );

  const squadrons = Object.entries(catalog.squadrons).map(([key, squadron]): CompareCard => {
    const keywords = Object.entries(squadron.abilities ?? {})
      .filter(([, value]) => value === true || (typeof value === 'number' && value > 0))
      .map(([keyword, value]) => `${keywordLabel(keyword)}${typeof value === 'number' ? ` ${value}` : ''}`);
    return {
      key,
      name: squadronName(squadron),
      subtitle: `${squadron['ace-name'] ? squadron.name : 'Squadron'} · ${factionLabel(squadron.faction, true)}`,
      href: `/squadrons/${key}`,
      image: cardFace(squadron.cardimage, catalog.imageStyles, 'poker')?.src,
      values: [
        num('Points', squadron.points),
        num('Hull', squadron.hull),
        num('Speed', squadron.speed),
        { label: 'Anti-squadron', dice: squadron.armament?.['anti-squadron'] },
        { label: 'Anti-ship', dice: squadron.armament?.['anti-ship'] },
        { label: 'Defense tokens', text: tokenList(squadron.tokens) },
        { label: 'Keywords', text: keywords.join(', ') || 'None' },
      ],
      text: squadron.ability,
    };
  });

  const upgrades = Object.entries(catalog.upgrades).map(([key, upgrade]): CompareCard => ({
    key,
    name: upgrade.name,
    subtitle: `${upgradeTypeLabel(upgrade.type)}${upgrade.source && upgrade.source !== 'Core' ? ` · ${upgrade.source}` : ''}`,
    href: `/upgrades/${key}`,
    image: cardFace(upgrade.cardimage, catalog.imageStyles, 'poker')?.src,
    values: [
      num('Points', upgrade.points),
      { label: 'Type', text: upgradeTypeLabel(upgrade.type) },
      { label: 'Faction', text: upgradeFactions(upgrade).map((faction) => factionLabel(faction, true)).join(', ') || 'Any' },
      { label: 'Unique', text: upgrade.unique ? 'Yes' : 'No' },
    ],
    text: upgrade.ability,
  }));

  const byName = (a: CompareCard, b: CompareCard) => a.name.localeCompare(b.name);
  return { ship: ships.sort(byName), squadron: squadrons.sort(byName), upgrade: upgrades.sort(byName) };
}
