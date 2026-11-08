'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Facet, GridEntry } from '@/lib/cards/entries';
import { cn } from '@/lib/utils';
import { CardFaceImage } from './CardFaceImage';
import { ArmadaIcon } from '@/components/rulings/ArmadaIcon';
import { CommunityMark } from './Marks';

type SortKey = 'name' | 'points-desc' | 'points-asc';
type Selection = Record<string, string[]>;

interface BrowseGridProps {
  entries: GridEntry[];
  facets: Facet[];
  /** Facet whose values become the section headings, in that facet's option order. */
  groupBy: string;
  noun: { one: string; many: string };
  /** Tall ship cards get fewer, wider columns than poker-size cards. */
  layout: 'ship' | 'poker';
}

function readQuery(facets: Facet[]): { query: string; sort: SortKey; selection: Selection } {
  const params = new URLSearchParams(window.location.search);
  const selection: Selection = {};
  for (const facet of facets) {
    const values = params.get(facet.id)?.split(',').filter((value) => facet.options.some((option) => option.value === value));
    if (values?.length) selection[facet.id] = values;
  }
  const sort = params.get('sort');
  return { query: params.get('q') ?? '', sort: sort === 'points-desc' || sort === 'points-asc' ? sort : 'name', selection };
}

function writeQuery(query: string, sort: SortKey, selection: Selection) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (sort !== 'name') params.set('sort', sort);
  for (const [facet, values] of Object.entries(selection)) if (values.length) params.set(facet, values.join(','));
  const search = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
}

export function BrowseGrid({ entries, facets, groupBy, noun, layout }: BrowseGridProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('name');
  const [selection, setSelection] = useState<Selection>({});
  const [ready, setReady] = useState(false);

  // Filters live in the URL so a filtered view can be shared or bookmarked.
  useEffect(() => {
    const initial = readQuery(facets);
    setQuery(initial.query);
    setSort(initial.sort);
    setSelection(initial.selection);
    setReady(true);
  }, [facets]);

  useEffect(() => {
    if (ready) writeQuery(query, sort, selection);
  }, [ready, query, sort, selection]);

  const toggle = (facet: string, value: string) =>
    setSelection((current) => {
      const values = current[facet] ?? [];
      const next = values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
      return { ...current, [facet]: next };
    });

  const visible = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return new Set(
      entries
        .filter((entry) => words.every((word) => entry.search.includes(word)))
        .filter((entry) =>
          Object.entries(selection).every(([facet, values]) => values.length === 0 || values.some((value) => entry.facets[facet]?.includes(value))),
        )
        .map((entry) => entry.key),
    );
  }, [entries, query, selection]);

  const groups = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      if (sort !== 'name' && a.points !== b.points) return sort === 'points-desc' ? (b.points ?? 0) - (a.points ?? 0) : (a.points ?? 0) - (b.points ?? 0);
      return a.name.localeCompare(b.name) || (a.subtitle ?? '').localeCompare(b.subtitle ?? '');
    });
    const facet = facets.find((entry) => entry.id === groupBy);
    const options = facet?.options ?? [];
    return options
      .map((option) => ({ option, entries: sorted.filter((entry) => (entry.facets[groupBy] ?? [])[0] === option.value) }))
      .filter((group) => group.entries.length > 0);
  }, [entries, facets, groupBy, sort]);

  const activeFilters = Object.values(selection).reduce((sum, values) => sum + values.length, 0);
  const shown = visible.size;

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-5 border-b border-rulebook-accent/15 bg-rulebook-sheet/95 px-5 pb-3 pt-3 backdrop-blur sm:-mx-10 sm:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 basis-60">
            <span className="sr-only">Search {noun.many}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rulebook-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${noun.many} by name or text`}
              className="h-10 w-full rounded-md border border-rulebook-accent/20 bg-white/70 pl-9 pr-3 text-[15px] text-rulebook-ink placeholder:text-rulebook-muted focus:border-rulebook-accent/50 focus:outline-none focus:ring-2 focus:ring-rulebook-accent/15"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-rulebook-muted">
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="h-10 rounded-md border border-rulebook-accent/20 bg-white/70 px-2 text-[15px] text-rulebook-ink focus:border-rulebook-accent/50 focus:outline-none"
            >
              <option value="name">Name</option>
              {entries.some((entry) => entry.points !== undefined) && (
                <>
                  <option value="points-desc">Points, high to low</option>
                  <option value="points-asc">Points, low to high</option>
                </>
              )}
            </select>
          </label>
        </div>

        <div className="mt-3 space-y-2">
          {facets.map((facet) => (
            <div key={facet.id} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 w-24 shrink-0 font-aero text-[11px] font-bold uppercase tracking-[0.14em] text-rulebook-accent">{facet.label}</span>
              {facet.options.map((option) => {
                const on = selection[facet.id]?.includes(option.value) ?? false;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(facet.id, option.value)}
                    className={cn(
                      'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[13px] transition-colors',
                      on
                        ? 'border-rulebook-accent bg-rulebook-accent text-white'
                        : 'border-rulebook-accent/20 bg-white/50 text-rulebook-ink hover:border-rulebook-accent/45',
                    )}
                  >
                    {option.glyph && <ArmadaIcon glyph={option.glyph} className="text-[15px]" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm text-rulebook-muted" aria-live="polite">
          <span>
            {shown === entries.length ? `${entries.length} ${noun.many}` : `${shown} of ${entries.length} ${noun.many}`}
          </span>
          {(activeFilters > 0 || query) && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelection({});
              }}
              className="inline-flex items-center gap-1 text-rulebook-accent hover:underline"
            >
              <X className="size-3.5" aria-hidden />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {shown === 0 && (
        <p className="py-16 text-center italic text-rulebook-muted">No {noun.many} match these filters.</p>
      )}

      {groups.map(({ option, entries: groupEntries }) => {
        const count = groupEntries.filter((entry) => visible.has(entry.key)).length;
        return (
          <section key={option.value} hidden={count === 0} className="mt-10 first-of-type:mt-8">
            <h2 className="wiki-group-title">
              {option.glyph && <ArmadaIcon glyph={option.glyph} className="text-[0.8em] normal-case" />}
              {option.label}
              <span className="ml-1 font-body text-sm font-normal normal-case tracking-normal text-rulebook-muted">{count}</span>
            </h2>
            <ul className={cn('mt-6 grid gap-x-4 gap-y-6', layout === 'ship' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6')}>
              {groupEntries.map((entry, index) => (
                <li
                  key={entry.key}
                  hidden={!visible.has(entry.key)}
                  className={cn(entry.face?.pointsKind === 'huge' || entry.facets.size?.includes('huge') ? 'col-span-2' : undefined)}
                >
                  <Link href={entry.href} className="group block focus-visible:outline-none">
                    <CardFaceImage
                      face={entry.face}
                      alt={entry.subtitle ? `${entry.name}, ${entry.subtitle}` : entry.name}
                      points={entry.points}
                      priority={index < 4 && groups[0].option.value === option.value}
                      className="transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-rulebook-accent"
                    />
                    <div className="mt-2 flex items-baseline gap-2 px-0.5">
                      <span className="min-w-0 flex-1 truncate text-[15px] font-bold leading-tight text-rulebook-ink group-hover:text-rulebook-accent">
                        {entry.name}
                      </span>
                      {entry.source === 'Community' && <CommunityMark />}
                      {entry.source === 'Nexus' && <span className="text-[11px] font-bold uppercase tracking-wider text-rulebook-muted">Nexus</span>}
                      {entry.points !== undefined && <span className="text-sm tabular-nums text-rulebook-muted">{entry.points}</span>}
                    </div>
                    {entry.subtitle && <div className="truncate px-0.5 text-[13px] text-rulebook-muted">{entry.subtitle}</div>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
