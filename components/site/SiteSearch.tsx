'use client';

/* eslint-disable @next/next/no-img-element -- card faces come from the card API's image hosts */
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { SearchRow } from '@/lib/cards/search';
import { cn } from '@/lib/utils';

const KIND_LABELS: Record<SearchRow['k'], string> = {
  page: 'Pages',
  ship: 'Ships',
  squadron: 'Squadrons',
  upgrade: 'Upgrades',
  objective: 'Objectives',
};
const KIND_ORDER: SearchRow['k'][] = ['ship', 'squadron', 'upgrade', 'objective', 'page'];

// One download per visit, shared by every search box and the favorites page.
let indexRequest: Promise<SearchRow[]> | undefined;
export function loadSearchIndex(): Promise<SearchRow[]> {
  indexRequest ??= fetch('/search-index.json')
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
    .catch((error) => {
      indexRequest = undefined;
      throw error;
    });
  return indexRequest;
}

/** Name matches rank above subtitle matches, which rank above card text. */
function score(row: SearchRow, words: string[]): number {
  const name = row.n.toLowerCase();
  const subtitle = (row.s ?? '').toLowerCase();
  const text = row.t ?? '';
  let total = 0;
  for (const word of words) {
    if (name.startsWith(word) || name.includes(` ${word}`)) total += 6;
    else if (name.includes(word)) total += 4;
    else if (subtitle.includes(word)) total += 2;
    else if (text.includes(word)) total += 1;
    else return 0;
  }
  return total + (name === words.join(' ') ? 10 : 0);
}

export function SiteSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [index, setIndex] = useState<SearchRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    loadSearchIndex().then(setIndex, () => setFailed(true));
  }, [open]);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!index || words.length === 0) return [];
    return index
      .map((row) => ({ row, score: score(row, words) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.row.n.localeCompare(b.row.n))
      .slice(0, 40)
      .map((entry) => entry.row);
  }, [index, query]);

  // Grouped for display; `flat` keeps the arrow-key order the same as the screen order.
  const groups = KIND_ORDER.map((kind) => ({ kind, rows: results.filter((row) => row.k === kind) })).filter((group) => group.rows.length > 0);
  const flat = groups.flatMap((group) => group.rows);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (row: SearchRow | undefined) => {
    if (!row) return;
    onOpenChange(false);
    router.push(row.h);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="force-light top-[12vh] translate-y-0 gap-0 overflow-hidden border-rulebook-accent/20 bg-rulebook-sheet p-0 font-body text-rulebook-ink sm:max-w-2xl">
        <DialogTitle className="sr-only">Search the wiki</DialogTitle>
        <div className="flex items-center gap-3 border-b border-rulebook-accent/15 px-4">
          <Search className="size-5 shrink-0 text-rulebook-accent" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, flat.length - 1));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              } else if (event.key === 'Enter') {
                event.preventDefault();
                go(flat[active]);
              }
            }}
            placeholder="Search ships, squadrons, upgrades, objectives and rulings"
            aria-label="Search the wiki"
            className="h-14 min-w-0 flex-1 bg-transparent text-[17px] placeholder:text-rulebook-muted focus:outline-none"
          />
          <kbd className="hidden rounded border border-rulebook-accent/20 px-1.5 text-xs text-rulebook-muted sm:inline">Esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2" role="listbox" aria-label="Results">
          {!query && (
            <p className="px-3 py-8 text-center text-sm text-rulebook-muted">
              Type a card name, a keyword such as <span className="font-aero font-bold">BOMBER</span>, or words from a card&apos;s text.
            </p>
          )}
          {query && !index && !failed && <p className="px-3 py-8 text-center text-sm text-rulebook-muted">Loading cards</p>}
          {failed && <p className="px-3 py-8 text-center text-sm text-rulebook-muted">Search is unavailable right now. Try again in a moment.</p>}
          {query && index && flat.length === 0 && <p className="px-3 py-8 text-center text-sm text-rulebook-muted">No cards match &quot;{query}&quot;.</p>}

          {groups.map((group) => (
            <div key={group.kind} className="mb-2">
              <div className="wiki-nav-heading mx-2 mt-2">{KIND_LABELS[group.kind]}</div>
              {group.rows.map((row) => {
                const position = flat.indexOf(row);
                return (
                  <button
                    key={row.h}
                    type="button"
                    role="option"
                    aria-selected={position === active}
                    data-index={position}
                    onMouseMove={() => setActive(position)}
                    onClick={() => go(row)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left',
                      position === active ? 'bg-rulebook-accent/10' : undefined,
                    )}
                  >
                    {row.i ? (
                      <img src={row.i} alt="" loading="lazy" className="h-12 w-9 shrink-0 rounded-[3px] object-cover object-top shadow-sm" />
                    ) : (
                      <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-[3px] bg-rulebook-accent/10 text-rulebook-accent">
                        <BookOpen className="size-4" aria-hidden />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{row.n}</span>
                      {row.s && <span className="block truncate text-[13px] text-rulebook-muted">{row.s}</span>}
                    </span>
                    {row.c && <span className="text-[11px] font-bold uppercase tracking-wider text-rulebook-muted">{row.c}</span>}
                    {row.p !== undefined && <span className="w-8 text-right text-sm tabular-nums text-rulebook-muted">{row.p}</span>}
                    <ArrowRight className={cn('size-4 text-rulebook-accent', position === active ? 'opacity-100' : 'opacity-0')} aria-hidden />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Opens search on "/" anywhere outside a text field. */
export function useSearchShortcut(open: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return;
      if (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        open();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
}
