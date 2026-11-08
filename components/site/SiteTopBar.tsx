'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Heart, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RulingsNav } from '@/components/rulings/RulingsNav';
import { cn } from '@/lib/utils';
import { useOpenSearch } from './SearchProvider';
import { CARD_LINKS, MORE_LINKS, REFERENCE_LINKS } from './links';

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

export function SiteTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openSearch = useOpenSearch();
  const pathname = usePathname();
  const close = () => setMenuOpen(false);

  return (
    <header data-print-hide className="sticky top-0 z-30 border-b border-rulebook-accent/15 bg-rulebook-sheet/90 backdrop-blur supports-[backdrop-filter]:bg-rulebook-sheet/75">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-2 sm:gap-4 sm:px-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="text-rulebook-accent hover:bg-rulebook-accent/10 lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          {/* Portalled outside the rulebook surface, so it needs its own light scope. */}
          <SheetContent side="left" className="force-light w-72 overflow-y-auto bg-rulebook-sheet p-4 font-body text-rulebook-ink">
            <SheetHeader className="p-0">
              <SheetTitle className="font-logo text-lg font-bold uppercase tracking-[0.06em] text-rulebook-accent">Armada Wiki</SheetTitle>
            </SheetHeader>
            <nav aria-label="Site" className="flex flex-col gap-0.5">
              <div className="wiki-nav-heading">Cards</div>
              {CARD_LINKS.map((link) => <NavLink key={link.href} {...link} block onNavigate={close} />)}
              <div className="wiki-nav-heading">Reference</div>
              {REFERENCE_LINKS.map((link) => <NavLink key={link.href} {...link} block onNavigate={close} />)}
              <div className="wiki-nav-heading">More</div>
              {MORE_LINKS.map((link) => <NavLink key={link.href} {...link} block onNavigate={close} />)}
            </nav>
            {/* On a rulings page the menu also lists the rulings sections. */}
            {pathname.startsWith('/rulings') && (
              <div className="mt-4 border-t border-rulebook-accent/15 pt-1">
                <RulingsNav onNavigate={close} />
              </div>
            )}
          </SheetContent>
        </Sheet>

        <Link href="/" className="whitespace-nowrap font-logo text-base font-bold uppercase tracking-[0.06em] text-rulebook-accent sm:text-lg">
          Armada Wiki
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 whitespace-nowrap text-sm lg:flex">
          {CARD_LINKS.map((link) => <NavLink key={link.href} {...link} />)}
          <span aria-hidden className="mx-1 h-5 w-px bg-rulebook-accent/20" />
          {REFERENCE_LINKS.map((link) => <NavLink key={link.href} {...link} />)}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={openSearch}
            className="flex h-9 items-center gap-2 rounded-md border border-rulebook-accent/20 bg-white/60 px-3 text-sm text-rulebook-muted transition-colors hover:border-rulebook-accent/40 hover:text-rulebook-ink"
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">Search cards</span>
            <span className="sr-only sm:hidden">Search cards</span>
            <kbd className="ml-2 hidden rounded border border-rulebook-accent/20 px-1.5 text-xs xl:inline">/</kbd>
          </button>
          <Link
            href="/favorites"
            aria-label="Favorites"
            title="Favorites"
            className={cn(
              'flex size-9 items-center justify-center rounded-md text-rulebook-accent transition-colors hover:bg-rulebook-accent/10',
              pathname === '/favorites' && 'bg-rulebook-accent/10',
            )}
          >
            <Heart className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
