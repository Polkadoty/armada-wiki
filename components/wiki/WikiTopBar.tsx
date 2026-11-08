'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';

export const CARD_SECTIONS = [
  { href: '/ships', label: 'Ships' },
  { href: '/squadrons', label: 'Squadrons' },
  { href: '/upgrades', label: 'Upgrades' },
  { href: '/objectives', label: 'Objectives' },
];

const REFERENCE_LINKS = [
  { href: '/rulings', label: 'Rulings' },
  { href: '/changelog', label: 'Changelog' },
];

function NavLink({ href, label, onNavigate, block }: { href: string; label: string; onNavigate?: () => void; block?: boolean }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'rounded-md px-3 py-1.5 transition-colors hover:bg-rulebook-accent/10',
        block && 'block text-[15px]',
        current ? 'bg-rulebook-accent/10 font-bold text-rulebook-accent' : 'text-rulebook-ink',
      )}
    >
      {label}
    </Link>
  );
}

export function WikiTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const search = useGlobalSearch();

  return (
    <header className="sticky top-0 z-30 border-b border-rulebook-accent/15 bg-rulebook-sheet/90 backdrop-blur supports-[backdrop-filter]:bg-rulebook-sheet/75">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-2 sm:gap-4 sm:px-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="text-rulebook-accent hover:bg-rulebook-accent/10 md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          {/* Portalled outside the rulebook surface, so it needs its own light scope. */}
          <SheetContent side="left" className="force-light w-72 bg-rulebook-sheet p-4 font-body text-rulebook-ink">
            <SheetHeader className="p-0">
              <SheetTitle className="font-logo text-lg font-bold uppercase tracking-[0.06em] text-rulebook-accent">Armada Wiki</SheetTitle>
            </SheetHeader>
            <nav aria-label="Site" className="mt-2 flex flex-col gap-0.5">
              <div className="wiki-nav-heading">Cards</div>
              {CARD_SECTIONS.map((link) => <NavLink key={link.href} {...link} block onNavigate={() => setMenuOpen(false)} />)}
              <div className="wiki-nav-heading">Reference</div>
              {REFERENCE_LINKS.map((link) => <NavLink key={link.href} {...link} block onNavigate={() => setMenuOpen(false)} />)}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/ships" className="whitespace-nowrap font-logo text-base font-bold uppercase tracking-[0.06em] text-rulebook-accent sm:text-lg">
          Armada Wiki
        </Link>

        <nav aria-label="Cards" className="ml-4 hidden items-center gap-1 whitespace-nowrap text-sm md:flex">
          {CARD_SECTIONS.map((link) => <NavLink key={link.href} {...link} />)}
          <span aria-hidden className="mx-1 h-5 w-px bg-rulebook-accent/20" />
          {REFERENCE_LINKS.map((link) => <NavLink key={link.href} {...link} />)}
        </nav>

        <button
          type="button"
          onClick={search.openSearch}
          className="ml-auto flex h-9 items-center gap-2 rounded-md border border-rulebook-accent/20 bg-white/60 px-3 text-sm text-rulebook-muted transition-colors hover:border-rulebook-accent/40 hover:text-rulebook-ink"
        >
          <Search className="size-4" aria-hidden />
          <span className="hidden sm:inline">Search cards</span>
          <span className="sr-only sm:hidden">Search cards</span>
          <kbd className="ml-2 hidden rounded border border-rulebook-accent/20 px-1.5 text-xs lg:inline">/</kbd>
        </button>
      </div>
      <GlobalSearch open={search.isOpen} onOpenChange={search.setIsOpen} />
    </header>
  );
}
