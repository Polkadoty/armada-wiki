'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RULINGS_NAV } from '@/lib/rulings/pages';
import { cn } from '@/lib/utils';

export function RulingsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Rulings sections" className="flex flex-col">
      {RULINGS_NAV.map((entry) => {
        if ('section' in entry) {
          return (
            <div
              key={entry.section}
              className="mb-1 mt-5 flex items-center gap-3 font-aero text-xs font-bold uppercase tracking-[0.15em] text-rulebook-accent after:h-px after:flex-1 after:bg-rulebook-accent/15"
            >
              {entry.section}
            </div>
          );
        }
        const current = pathname === entry.href;
        return (
          <Link
            key={entry.href}
            href={entry.href}
            onClick={onNavigate}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-1.5 text-[15px] transition-colors hover:bg-rulebook-accent/10',
              entry.sub && 'pl-5',
              current ? 'bg-rulebook-accent/10 font-bold text-rulebook-accent' : 'text-rulebook-ink',
            )}
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
