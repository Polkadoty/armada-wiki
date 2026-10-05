'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Search and faction filtering for a rulings page. The cards are server-rendered, so
// rather than re-rendering ~500 entries through React state, this toggles `hidden` on
// the existing elements — the same work the old static pages did, without the markup
// leaving the server.

const FACTIONS = [
  { key: 'empire', label: 'Empire', glyph: '\\' },
  { key: 'rebel', label: 'Rebel', glyph: '[' },
  { key: 'republic', label: 'Republic', glyph: '|' },
  { key: 'separatist', label: 'Separatist', glyph: '}' },
  { key: 'scum', label: 'Scum', glyph: '{' },
  { key: 'new-republic', label: 'New Republic' },
  { key: 'neutral', label: 'Neutral' },
] as const;

type FactionKey = (typeof FACTIONS)[number]['key'];

export function RulingsToolbar({ total }: { total: number }) {
  const [query, setQuery] = useState('');
  const [factions, setFactions] = useState<Set<FactionKey>>(new Set());
  const [visible, setVisible] = useState(total);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtering = query.trim() !== '' || factions.size > 0;

  useEffect(() => {
    const needle = query.trim().toLowerCase();
    const root = document.getElementById('rulings-cards');
    if (!root) return;
    let shown = 0;

    for (const group of root.querySelectorAll<HTMLElement>('[data-ruling-group]')) {
      let shownInGroup = 0;
      for (const card of group.querySelectorAll<HTMLElement>('[data-ruling-card]')) {
        const cardFactions = (card.dataset.factions || 'neutral').split(',');
        const match = (!needle || (card.dataset.name || '').includes(needle))
          && (factions.size === 0 || cardFactions.some((f) => factions.has(f as FactionKey)));
        card.hidden = !match;
        // Dividers sit before each card but the first; hide the one leading a hidden card.
        const divider = card.previousElementSibling;
        if (divider instanceof HTMLElement && divider.hasAttribute('data-ruling-divider')) divider.hidden = !match;
        if (match) shownInGroup += 1;
      }
      group.hidden = shownInGroup === 0;
      // With earlier cards hidden, the first visible card would otherwise lead with a rule.
      const firstVisible = group.querySelector<HTMLElement>('[data-ruling-card]:not([hidden])');
      const lead = firstVisible?.previousElementSibling;
      if (lead instanceof HTMLElement && lead.hasAttribute('data-ruling-divider')) lead.hidden = true;
      shown += shownInGroup;
    }
    setVisible(shown);
  }, [query, factions]);

  // "/" focuses search, as on the rest of the wiki; copy-link anchors copy their URL.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[data-copy-link]');
      if (!link || !navigator.clipboard) return;
      event.preventDefault();
      const url = new URL(link.getAttribute('href') || '', window.location.href).toString();
      history.replaceState(null, '', url);
      navigator.clipboard.writeText(url).then(() => setToast('Link copied'), () => setToast('Could not copy link'));
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const summary = useMemo(
    () => (filtering ? `${visible} of ${total} card${total === 1 ? '' : 's'}` : `${total} card${total === 1 ? '' : 's'}`),
    [filtering, visible, total],
  );

  const toggleFaction = (key: FactionKey) => {
    setFactions((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
    <div className="z-20 -mx-2 mb-10 md:sticky md:top-14 rounded-lg border border-rulebook-accent/15 bg-rulebook-sheet/95 px-3 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-rulebook-sheet/80">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-rulebook-muted" aria-hidden />
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setQuery('');
            }}
            placeholder="Search cards on this page…  ( / )"
            aria-label="Search cards on this page"
            className="h-9 border-rulebook-accent/25 bg-white/70 pl-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by faction">
          {FACTIONS.map((faction) => {
            const active = factions.has(faction.key);
            return (
              <button
                key={faction.key}
                type="button"
                onClick={() => toggleFaction(faction.key)}
                aria-pressed={active}
                title={faction.label}
                className={cn(
                  'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition-colors',
                  active
                    ? 'border-rulebook-accent bg-rulebook-accent text-white'
                    : 'border-rulebook-accent/25 bg-white/60 text-rulebook-accent hover:bg-rulebook-accent/10',
                )}
              >
                {'glyph' in faction ? (
                  <span className="font-icons text-lg leading-none" aria-hidden>{faction.glyph}</span>
                ) : faction.key === 'new-republic' ? (
                  <span aria-hidden className="inline-block size-[1.1em] bg-current [mask:url(/images/nr-logo.svg)_center/contain_no-repeat]" />
                ) : (
                  <span aria-hidden>★</span>
                )}
                <span className="sr-only">{faction.label}</span>
              </button>
            );
          })}
          {factions.size > 0 && (
            <button
              type="button"
              onClick={() => setFactions(new Set())}
              className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-rulebook-muted hover:text-rulebook-ink"
            >
              <X className="size-3.5" aria-hidden /> Clear
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-rulebook-muted" aria-live="polite">
        {summary}
        {filtering && visible === 0 && ' — no cards match.'}
      </p>
    </div>
    {/* Outside the toolbar: its backdrop-filter would make it the toast's containing block. */}
    {toast && (
      <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-rulebook-ink px-4 py-2 text-sm text-white shadow-lg">
        {toast}
      </div>
    )}
    </>
  );
}
