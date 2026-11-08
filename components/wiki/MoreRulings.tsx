'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/** Hides every ruling marked `ruling-extra` until the reader asks for them. Print shows them all. */
export function MoreRulings({ hidden, children, footer }: { hidden: number; children: ReactNode; footer?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4" data-rulings-collapsed={open ? undefined : ''}>
      {children}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="more-rulings inline-flex items-center gap-1.5 rounded-md border border-rulebook-accent/25 bg-white/60 px-3 py-1 text-sm text-rulebook-accent hover:border-rulebook-accent/50"
        >
          <ChevronDown className={open ? 'size-4 rotate-180' : 'size-4'} aria-hidden />
          {open ? 'Show fewer rulings' : `Show ${hidden} more ${hidden === 1 ? 'ruling' : 'rulings'}`}
        </button>
      )}
      {footer}
    </div>
  );
}
