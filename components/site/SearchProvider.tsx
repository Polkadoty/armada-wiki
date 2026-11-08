'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { SiteSearch, useSearchShortcut } from './SiteSearch';

const Context = createContext<() => void>(() => {});

/** One search dialog for the whole site; any button can open it with `useOpenSearch()`. */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  useSearchShortcut(openSearch);
  return (
    <Context.Provider value={openSearch}>
      {children}
      <SiteSearch open={open} onOpenChange={setOpen} />
    </Context.Provider>
  );
}

export const useOpenSearch = () => useContext(Context);

export function SearchButton({ className, children }: { className?: string; children: ReactNode }) {
  const openSearch = useOpenSearch();
  return (
    <button type="button" onClick={openSearch} className={className}>
      {children}
    </button>
  );
}
