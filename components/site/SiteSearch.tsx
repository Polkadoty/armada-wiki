'use client';

/* eslint-disable @next/next/no-img-element -- card faces come from the card API's image hosts */
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Clock, FileText, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { SearchRow } from '@/lib/cards/search';
import { cn } from '@/lib/utils';

export type SearchScope = 'all' | 'cards' | 'rules' | 'pages';

const SCOPES: Array<{ id: SearchScope; label: string; placeholder: string }> = [
  { id: 'all', label: 'All', placeholder: 'Search cards, rules and rulings' },
  { id: 'cards', label: 'Cards', placeholder: 'Search ships, squadrons, upgrades and objectives' },
  { id: 'rules', label: 'Rulebook', placeholder: 'Search the rulebook, FAQ and tournament rules' },
  { id: 'pages', label: 'Pages', placeholder: 'Search pages' },
];

const CARD_KINDS = new Set<SearchRow['k']>(['ship', 'squadron', 'upgrade', 'objective']);

function inScope(row: SearchRow, scope: SearchScope): boolean {
  if (scope === 'cards') return CARD_KINDS.has(row.k);
  // Rulebook pages, such as the glossary, count as rulebook results.
  if (scope === 'rules') return row.k === 'rule' || (row.k === 'page' && row.h.startsWith('/rulebook'));
  if (scope === 'pages') return row.k === 'page';
  return true;
}

const KIND_LABELS: Record<SearchRow['k'], string> = {
  page: 'Pages',
  ship: 'Ships',
  squadron: 'Squadrons',
  upgrade: 'Upgrades',
  objective: 'Objectives',
  rule: 'Rulebook',
};
// Breaks ties between groups whose best results score the same.
const KIND_ORDER: SearchRow['k'][] = ['ship', 'squadron', 'upgrade', 'objective', 'rule', 'page'];

// Shown before anything is typed.
const SUGGESTED = ['/rulebook', '/rulebook/glossary', '/rulings', '/rulebook/tournament-regulations', '/changelog', '/compare'];

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

// The last few results a reader opened, kept in this browser only.
const RECENT_KEY = 'armada-wiki:recent-search';
function readRecent(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
function rememberRecent(href: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([href, ...readRecent().filter((item) => item !== href)].slice(0, 6)));
  } catch {
    // Storage can be blocked; search works without it.
  }
}

/** Name matches rank above subtitle matches, which rank above card or rule text. */
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

function RowIcon({ row, recent }: { row: SearchRow; recent?: boolean }) {
  if (row.i) return <img src={row.i} alt="" loading="lazy" className="h-12 w-9 shrink-0 rounded-[3px] object-cover object-top shadow-sm" />;
  const Icon = recent ? Clock : row.k === 'rule' ? BookOpen : FileText;
  return (
    <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-[3px] bg-rulebook-accent/10 text-rulebook-accent">
      <Icon className="size-4" aria-hidden />
    </span>
  );
}

export function SiteSearch({ open, onOpenChange, initialScope = 'all' }: { open: boolean; onOpenChange: (open: boolean) => void; initialScope?: SearchScope }) {
  const router = useRouter();
  const [index, setIndex] = useState<SearchRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>(initialScope);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    setScope(initialScope);
    setRecent(readRecent());
    loadSearchIndex().then(setIndex, () => setFailed(true));
  }, [open, initialScope]);

  const byHref = useMemo(() => new Map((index ?? []).map((row) => [row.h, row])), [index]);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!index || words.length === 0) return [];
    return index
      .filter((row) => inScope(row, scope))
      .map((row) => ({ row, score: score(row, words) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.row.n.localeCompare(b.row.n))
      .slice(0, 50);
  }, [index, query, scope]);

  // With nothing typed: recent picks, then suggestions for the scope.
  const idle = useMemo(() => {
    if (!index || query) return [];
    const recentRows = recent.map((href) => byHref.get(href)).filter((row): row is SearchRow => !!row && inScope(row, scope));
    const seen = new Set(recentRows.map((row) => row.h));
    const suggested = (
      scope === 'rules'
        ? index.filter((row) => row.k === 'page' && row.h.startsWith('/rulebook'))
        : scope === 'pages'
          ? index.filter((row) => row.k === 'page' && !row.h.startsWith('/rulings/'))
          : scope === 'cards'
            ? []
            : SUGGESTED.map((href) => byHref.get(href)).filter((row): row is SearchRow => !!row)
    ).filter((row) => !seen.has(row.h));
    return [
      ...(recentRows.length ? [{ key: 'recent', label: 'Recent', rows: recentRows.slice(0, 5), recent: true }] : []),
      ...(suggested.length ? [{ key: 'suggested', label: scope === 'rules' ? 'Rulebook' : 'Go to', rows: suggested, recent: false }] : []),
    ];
  }, [index, query, recent, byHref, scope]);

  // Grouped for display, the group with the best match first; `flat` keeps the
  // arrow-key order the same as the screen order.
  const groups = query
    ? KIND_ORDER.map((kind) => {
        const matches = results.filter((entry) => entry.row.k === kind);
        return { key: kind, label: KIND_LABELS[kind], rows: matches.map((entry) => entry.row), best: matches[0]?.score ?? 0, recent: false };
      })
        .filter((group) => group.rows.length > 0)
        .sort((a, b) => b.best - a.best || KIND_ORDER.indexOf(a.key) - KIND_ORDER.indexOf(b.key))
    : idle;
  const flat = groups.flatMap((group) => group.rows);

  useEffect(() => setActive(0), [query, scope]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (row: SearchRow | undefined) => {
    if (!row) return;
    rememberRecent(row.h);
    onOpenChange(false);
    router.push(row.h);
  };

  const scopeInfo = SCOPES.find((item) => item.id === scope)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="force-light top-[8vh] translate-y-0 gap-0 overflow-hidden border-rulebook-accent/20 bg-rulebook-sheet p-0 font-body text-rulebook-ink sm:top-[12vh] sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">Search the wiki</DialogTitle>
        <div className="flex items-center gap-3 border-b border-rulebook-accent/15 px-4">
          <Search className="size-5 shrink-0 text-rulebook-accent" aria-hidden />
          <input
            ref={inputRef}
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
            placeholder={scopeInfo.placeholder}
            aria-label="Search the wiki"
            enterKeyHint="go"
            className="h-14 min-w-0 flex-1 bg-transparent text-[17px] placeholder:text-rulebook-muted focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="rounded p-1 text-rulebook-muted hover:bg-rulebook-accent/10 hover:text-rulebook-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded border border-rulebook-accent/20 px-1.5 text-xs text-rulebook-muted hover:bg-rulebook-accent/10"
            >
              <span className="hidden sm:inline">Esc</span>
              <span className="sm:hidden">Close</span>
            </button>
          )}
        </div>

        <div role="tablist" aria-label="Search in" className="flex gap-1.5 overflow-x-auto border-b border-rulebook-accent/10 px-3 py-2">
          {SCOPES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={scope === item.id}
              onClick={() => {
                setScope(item.id);
                inputRef.current?.focus();
              }}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-[13px] transition-colors',
                scope === item.id
                  ? 'border-rulebook-accent bg-rulebook-accent font-bold text-white'
                  : 'border-rulebook-accent/20 bg-white/50 text-rulebook-ink hover:border-rulebook-accent/45',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div ref={listRef} className="max-h-[min(60vh,560px)] overflow-y-auto p-2" role="listbox" aria-label="Results">
          {!query && index && groups.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-rulebook-muted">
              Type a card name, a keyword such as <span className="font-aero font-bold">BOMBER</span>, or words from a card&apos;s text.
            </p>
          )}
          {!index && !failed && <p className="px-3 py-8 text-center text-sm text-rulebook-muted">Loading the search index</p>}
          {failed && <p className="px-3 py-8 text-center text-sm text-rulebook-muted">Search is unavailable right now. Try again in a moment.</p>}
          {query && index && flat.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-rulebook-muted">
              Nothing matches &quot;{query}&quot;
              {scope !== 'all' && (
                <>
                  {' '}in {scopeInfo.label.toLowerCase()}.{' '}
                  <button type="button" onClick={() => setScope('all')} className="text-rulebook-accent underline underline-offset-2">
                    Search everything
                  </button>
                </>
              )}
              {scope === 'all' && '.'}
            </p>
          )}

          {groups.map((group) => (
            <div key={group.key} className="mb-2">
              <div className="wiki-nav-heading mx-2 mt-2">{group.label}</div>
              {group.rows.map((row) => {
                const position = flat.indexOf(row);
                return (
                  <button
                    key={`${group.key}-${row.h}`}
                    type="button"
                    role="option"
                    aria-selected={position === active}
                    data-index={position}
                    onMouseMove={() => setActive(position)}
                    onClick={() => go(row)}
                    className={cn('flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left', position === active ? 'bg-rulebook-accent/10' : undefined)}
                  >
                    <RowIcon row={row} recent={group.recent} />
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

        <div className="hidden items-center gap-4 border-t border-rulebook-accent/10 px-4 py-2 text-xs text-rulebook-muted sm:flex">
          <span><kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd> to move</span>
          <span><kbd className="font-sans">Enter</kbd> to open</span>
          <span className="ml-auto"><kbd className="font-sans">/</kbd> opens search anywhere</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Opens search on "/" or Ctrl/⌘ K anywhere outside a text field. */
export function useSearchShortcut(open: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        open();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
}
