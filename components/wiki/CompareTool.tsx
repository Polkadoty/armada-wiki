'use client';

/* eslint-disable @next/next/no-img-element -- card faces come from the card API's image hosts */
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { CompareCard, CompareKind } from '@/lib/cards/compare';
import { cn } from '@/lib/utils';
import { Dice } from './Dice';

const KINDS: Array<{ value: CompareKind; label: string }> = [
  { value: 'ship', label: 'Ships' },
  { value: 'squadron', label: 'Squadrons' },
  { value: 'upgrade', label: 'Upgrades' },
];
const MAX = 4;

// Card text uses :icon: codes; the compare table reads them as words.
const plainText = (text: string) => text.replace(/:([a-z_-]+):/gi, (_, name: string) => `[${name.replace(/[_-]/g, ' ')}]`);

export function CompareTool({ cards }: { cards: Record<CompareKind, CompareCard[]> }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const kind = (KINDS.find((entry) => entry.value === params.get('type'))?.value ?? 'ship') as CompareKind;
  const pool = cards[kind];
  const selected = useMemo(
    () => (params.get('cards') ?? '').split(',').map((key) => pool.find((card) => card.key === key)).filter(Boolean) as CompareCard[],
    [params, pool],
  );
  const [query, setQuery] = useState('');

  const update = (nextKind: CompareKind, keys: string[]) => {
    const search = new URLSearchParams();
    if (nextKind !== 'ship') search.set('type', nextKind);
    if (keys.length) search.set('cards', keys.join(','));
    router.replace(`${pathname}${search.size ? `?${search}` : ''}`, { scroll: false });
  };

  const matches = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    return pool
      .filter((card) => !selected.includes(card))
      .filter((card) => words.every((word) => `${card.name} ${card.subtitle ?? ''}`.toLowerCase().includes(word)))
      .slice(0, 8);
  }, [pool, query, selected]);

  const add = (card: CompareCard) => {
    update(kind, [...selected.map((entry) => entry.key), card.key].slice(0, MAX));
    setQuery('');
  };
  const remove = (key: string) => update(kind, selected.filter((card) => card.key !== key).map((card) => card.key));

  const labels = selected[0]?.values.map((value) => value.label) ?? [];
  // Highlight the highest number in a row, except points where it means nothing better.
  const best = (label: string) => {
    if (label === 'Points' || selected.length < 2) return undefined;
    const numbers = selected.map((card) => card.values.find((value) => value.label === label)?.number).filter((value): value is number => value !== undefined);
    const top = Math.max(...numbers);
    return numbers.filter((value) => value === top).length === numbers.length ? undefined : top;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Card kind" className="inline-flex rounded-full border border-rulebook-accent/20 bg-white/60 p-0.5 text-sm">
          {KINDS.map((entry) => (
            <button
              key={entry.value}
              type="button"
              aria-pressed={kind === entry.value}
              onClick={() => update(entry.value, [])}
              className={cn('rounded-full px-4 py-1.5', kind === entry.value ? 'bg-rulebook-accent text-white' : 'hover:bg-rulebook-accent/10')}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 basis-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rulebook-muted" aria-hidden />
          <input
            type="search"
            value={query}
            disabled={selected.length >= MAX}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && matches[0]) add(matches[0]);
            }}
            placeholder={selected.length >= MAX ? 'Remove a card to add another' : `Add a ${kind} by name`}
            aria-label={`Add a ${kind}`}
            className="h-10 w-full rounded-md border border-rulebook-accent/20 bg-white/70 pl-9 pr-3 text-[15px] placeholder:text-rulebook-muted focus:border-rulebook-accent/50 focus:outline-none disabled:opacity-60"
          />
          {matches.length > 0 && (
            <ul className="absolute inset-x-0 top-11 z-20 overflow-hidden rounded-md border border-rulebook-accent/20 bg-rulebook-sheet shadow-lg">
              {matches.map((card) => (
                <li key={card.key}>
                  <button type="button" onClick={() => add(card)} className="flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-rulebook-accent/10">
                    {card.image && <img src={card.image} alt="" loading="lazy" className="h-10 w-7 rounded-[2px] object-cover object-top" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{card.name}</span>
                      {card.subtitle && <span className="block truncate text-xs text-rulebook-muted">{card.subtitle}</span>}
                    </span>
                    <Plus className="size-4 text-rulebook-accent" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selected.length === 0 ? (
        <p className="py-20 text-center italic text-rulebook-muted">Add a card to start comparing. Card pages also have a Compare button.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-0 text-[15px]">
            <colgroup>
              <col className="w-36" />
              {selected.map((card) => <col key={card.key} />)}
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="sr-only">Stat</th>
                {selected.map((card) => (
                  <th key={card.key} scope="col" className="px-2 pb-4 text-left align-bottom font-normal">
                    <div className="relative">
                      <Link href={card.href} className="group block">
                        {card.image && <img src={card.image} alt="" loading="lazy" className="wiki-card-face mb-2 h-auto w-full max-w-[180px]" />}
                        <span className="block font-bold leading-tight group-hover:text-rulebook-accent">{card.name}</span>
                        {card.subtitle && <span className="block text-[13px] text-rulebook-muted">{card.subtitle}</span>}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(card.key)}
                        aria-label={`Remove ${card.name}`}
                        className="absolute right-0 top-0 flex size-7 items-center justify-center rounded-full bg-rulebook-sheet/90 text-rulebook-muted shadow hover:text-rulebook-accent"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((label) => {
                const top = best(label);
                return (
                  <tr key={label}>
                    <th scope="row" className="border-t border-rulebook-accent/10 py-2 pr-2 text-left font-aero text-[11px] font-bold uppercase tracking-[0.12em] text-rulebook-accent">
                      {label}
                    </th>
                    {selected.map((card) => {
                      const value = card.values.find((entry) => entry.label === label);
                      return (
                        <td key={card.key} className={cn('border-t border-rulebook-accent/10 px-2 py-2 align-top', top !== undefined && value?.number === top && 'font-bold text-rulebook-accent')}>
                          {value?.dice ? <Dice dice={value.dice} /> : value?.text}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {selected.some((card) => card.text) && (
                <tr>
                  <th scope="row" className="border-t border-rulebook-accent/10 py-2 pr-2 text-left align-top font-aero text-[11px] font-bold uppercase tracking-[0.12em] text-rulebook-accent">
                    Card text
                  </th>
                  {selected.map((card) => (
                    <td key={card.key} className="whitespace-pre-line border-t border-rulebook-accent/10 px-2 py-2 align-top text-sm italic">
                      {card.text ? plainText(card.text) : ''}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
