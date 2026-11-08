'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface RulebookNavItem {
  href: string;
  label: string;
  count?: number;
}

export function RulebookNav({ items, onNavigate }: { items: RulebookNavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Rulebook sections" className="flex flex-col">
      <div className="mb-1 mt-1 flex items-center gap-3 font-aero text-xs font-bold uppercase tracking-[0.15em] text-rulebook-accent after:h-px after:flex-1 after:bg-rulebook-accent/15">
        Rules reference
      </div>
      {items.map((item) => {
        const current = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex items-baseline gap-2 rounded-md px-3 py-1.5 text-[15px] transition-colors hover:bg-rulebook-accent/10',
              current ? 'bg-rulebook-accent/10 font-bold text-rulebook-accent' : 'text-rulebook-ink',
            )}
          >
            <span className="flex-1">{item.label}</span>
            {item.count !== undefined && <span className="text-xs font-normal tabular-nums text-rulebook-muted">{item.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
