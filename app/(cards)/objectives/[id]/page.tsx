import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCardCatalog } from '@/lib/cards/catalog';
import { cardFace } from '@/lib/cards/images';
import { OBJECTIVE_TYPE_LABELS, objectiveTypeGlyph } from '@/lib/cards/entries';
import { cardRulings } from '@/lib/cards/rulings';
import { resolveCardKey } from '@/utils/cardSources';
import { ArmadaIcon } from '@/components/rulings/ArmadaIcon';
import { CardTextAndRulings, DetailFooter, DetailHero, DetailSheet, Section, Stats, TitleBlock } from '@/components/wiki/Detail';
import type { Objective } from '@/types/cards';

export const revalidate = false;

type Params = Promise<{ id: string }>;

async function findObjective(id: string) {
  const catalog = await getCardCatalog();
  const key = resolveCardKey(catalog.objectives, id);
  return key ? { catalog, key, objective: catalog.objectives[key] } : undefined;
}

export async function generateStaticParams() {
  const catalog = await getCardCatalog();
  return Object.keys(catalog.objectives).map((id) => ({ id }));
}

const typeLabel = (objective: Objective) => OBJECTIVE_TYPE_LABELS[objective.type] ?? objective.type;

// `debris_1`, `dust-field_2` and so on; the numbers only tell copies apart.
function obstacleList(obstacles?: string[]): string[] {
  const counts = new Map<string, number>();
  for (const raw of ([] as unknown[]).concat(obstacles ?? [])) {
    if (typeof raw !== 'string') continue;
    const name = raw.replace(/_\d+$/, '').replace(/[-_]/g, ' ').trim();
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => (count > 1 ? `${count} ${name}s` : name)).map((line) => line[0].toUpperCase() + line.slice(1));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const found = await findObjective(id);
  if (!found) return {};
  const { objective, key, catalog } = found;
  const face = cardFace(objective.cardimage, catalog.imageStyles, 'poker');
  const rule = (objective.special_rule ?? objective.setup ?? '').replace(/:[a-z_-]+:/gi, '').replace(/\s+/g, ' ').trim();
  return {
    title: `${objective.name} (${typeLabel(objective)} objective)`,
    description: `${objective.name}, a ${typeLabel(objective).toLowerCase()} objective for Star Wars: Armada. ${rule}`.slice(0, 300),
    alternates: { canonical: `/objectives/${key}` },
    openGraph: { type: 'article', images: face ? [{ url: face.src, width: face.width, height: face.height, alt: objective.name }] : undefined },
  };
}

export default async function ObjectivePage({ params }: { params: Params }) {
  const { id } = await params;
  const found = await findObjective(id);
  if (!found) notFound();
  const { catalog, key, objective } = found;
  if (key !== id) permanentRedirect(`/objectives/${key}`);

  const face = cardFace(objective.cardimage, catalog.imageStyles, 'poker');
  const glyph = objectiveTypeGlyph(objective.type);
  const obstacles = obstacleList(objective.obstacles);
  // The rulings entry already sets Setup, Special Rule and the scoring as card text.
  const fallbackText = [
    objective.setup && `**Setup:** ${objective.setup}`,
    objective.special_rule && `**Special Rule:** ${objective.special_rule}`,
    objective.end_of_round && `**End of Round:** ${objective.end_of_round}`,
    objective.end_of_game && `**End of Game:** ${objective.end_of_game}`,
  ].filter(Boolean).join('\n\n');
  const rulings = await cardRulings(objective.source, key, { cardText: fallbackText, rules: objective.rules });

  return (
    <DetailSheet crumbs={[{ href: '/objectives', label: 'Objectives' }, { href: `/objectives/${key}`, label: objective.name }]}>
      <DetailHero face={face} name={objective.name}>
        <TitleBlock
          kicker={
            <span className="inline-flex items-center gap-2">
              {glyph && <ArmadaIcon glyph={glyph} className="text-base" />}
              {typeLabel(objective)} objective
            </span>
          }
          name={objective.name}
          source={objective.source}
        />

        <Stats
          items={[
            { label: 'Type', value: typeLabel(objective) },
            objective.victory_tokens && { label: 'Victory tokens', value: objective.victory_tokens_points ? `${objective.victory_tokens_points} points each` : 'Yes' },
            objective.objective_tokens && { label: 'Objective tokens', value: ([] as unknown[]).concat(objective.objective_tokens_count ?? []).filter(Boolean).join(' / ') || 'Yes' },
            objective.command_tokens && { label: 'Command tokens', value: [objective.command_tokens_count, objective.command_tokens_type, objective.command_tokens_value].filter(Boolean).join(' ') },
          ]}
        />

        {obstacles.length > 0 && (
          <Section title="Obstacles">
            <ul className="flex flex-wrap gap-2">
              {obstacles.map((line) => (
                <li key={line} className="rounded-full border border-rulebook-accent/20 bg-white/60 px-3 py-1 text-sm">{line}</li>
              ))}
            </ul>
          </Section>
        )}

        <CardTextAndRulings rulings={rulings} />
      </DetailHero>

      <DetailFooter
        favorite={{ id: key, type: 'objective', name: objective.name, href: `/objectives/${key}` }}
        comments={{ cardType: 'objective', cardId: key }}
      />
    </DetailSheet>
  );
}
