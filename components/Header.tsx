'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BugReportDialog } from '@/components/BugReportDialog';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Home,
  Menu,
  Search,
  Anchor,
  Plane,
  Wrench,
  Target,
  Heart,
  GitCompare,
  BookOpen,
  Info,
} from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
  onSearchClick?: () => void;
}

const navItems = [
  { href: '/ships', label: 'Ships', icon: Anchor },
  { href: '/squadrons', label: 'Squadrons', icon: Plane },
  { href: '/upgrades', label: 'Upgrades', icon: Wrench },
  { href: '/objectives', label: 'Objectives', icon: Target },
];

const mobileNavItems = [
  { href: '/', label: 'Home', icon: Home },
  ...navItems,
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/guide', label: 'Guide', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info },
];

export function Header({ onSearchClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-border/80 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and nav */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 font-semibold text-sm">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary via-faction-separatist to-faction-rebel flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/25">
                SW
              </div>
              <span className="hidden sm:inline text-sm tracking-[0.14em] uppercase">Armada Wiki</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/70 bg-card/50 px-2 py-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - Search, actions, theme */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground w-52 justify-start rounded-full border-border/70 bg-card/60"
              onClick={onSearchClick}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                /
              </kbd>
            </Button>

            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={onSearchClick}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Bug report */}
            <div className="hidden sm:block">
              <BugReportDialog />
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              />
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-4 pt-4 border-t">
                  <BugReportDialog />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
