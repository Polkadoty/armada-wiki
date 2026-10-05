'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RULINGS_TITLE } from '@/lib/rulings/pages';
import { RulingsNav } from './RulingsNav';

const LINKS = [
  { href: '/changelog', label: 'Changelog' },
  { href: '/ships', label: 'Card Wiki' },
];

export function RulingsTopBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-rulebook-accent/15 bg-rulebook-sheet/90 backdrop-blur supports-[backdrop-filter]:bg-rulebook-sheet/75">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-2 sm:gap-4 sm:px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="text-rulebook-accent hover:bg-rulebook-accent/10 lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open rulings sections</span>
              </Button>
            }
          />
          {/* Portalled outside the rulebook surface, so it needs its own light scope. */}
          <SheetContent side="left" className="force-light w-72 overflow-y-auto bg-rulebook-sheet p-4 font-body text-rulebook-ink">
            <SheetHeader className="p-0">
              <SheetTitle className="font-logo text-lg font-bold uppercase tracking-[0.06em] text-rulebook-accent">
                {RULINGS_TITLE}
              </SheetTitle>
            </SheetHeader>
            <RulingsNav onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link href="/rulings" className="whitespace-nowrap font-logo text-base font-bold uppercase tracking-[0.06em] text-rulebook-accent sm:text-lg">
          {RULINGS_TITLE}
        </Link>

        <nav aria-label="Site" className="ml-auto flex items-center gap-1 whitespace-nowrap text-sm">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-2 py-1.5 text-rulebook-ink transition-colors hover:bg-rulebook-accent/10 sm:px-3">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
