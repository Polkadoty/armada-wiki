'use client';

import { Search } from 'lucide-react';
import { useOpenSearch } from '@/components/site/SearchProvider';
import { cn } from '@/lib/utils';

/** Opens the site search with results limited to the rulebook. */
export function RulebookSearchButton({ className }: { className?: string }) {
  const openSearch = useOpenSearch();
  return (
    <button
      type="button"
      onClick={() => openSearch({ scope: 'rules' })}
      className={cn(
        'flex h-10 items-center gap-2 rounded-md border border-rulebook-accent/25 bg-white/70 px-3 text-left text-sm text-rulebook-muted shadow-sm transition-colors hover:border-rulebook-accent/50 hover:text-rulebook-ink',
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-rulebook-accent" aria-hidden />
      <span className="flex-1 truncate">Search the rulebook</span>
    </button>
  );
}
