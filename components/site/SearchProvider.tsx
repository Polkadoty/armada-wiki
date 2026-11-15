'use client';

import { createContext, useCallback, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import { SiteSearch, useSearchShortcut, type SearchScope } from './SiteSearch';

export interface OpenSearchOptions {
  /** Start with results limited to one kind, such as the rulebook. */
  scope?: SearchScope;
}

const Context = createContext<(options?: OpenSearchOptions) => void>(() => {});

/** One search dialog for the whole site; any button can open it with `useOpenSearch()`. */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<SearchScope>('all');
  const openSearch = useCallback((options?: OpenSearchOptions) => {
    setScope(options?.scope ?? 'all');
    setOpen(true);
  }, []);
  const openFromShortcut = useCallback(() => openSearch(), [openSearch]);
  useSearchShortcut(openFromShortcut);
  return (
    <Context.Provider value={openSearch}>
      {children}
      <SiteSearch open={open} onOpenChange={setOpen} initialScope={scope} />
    </Context.Provider>
  );
}

export const useOpenSearch = () => useContext(Context);

export function SearchButton({ className, children, scope }: { className?: string; children: ReactNode; scope?: SearchScope }) {
  const openSearch = useOpenSearch();
  return (
    <button type="button" onClick={() => openSearch({ scope })} className={className}>
      {children}
    </button>
  );
}

const noSubscribe = () => () => {};

/** "⌘K" on Apple devices and "Ctrl K" elsewhere; empty in server markup, filled in on the client. */
export function useShortcutLabel(): string {
  return useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K'),
    () => '',
  );
}
