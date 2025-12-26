'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BugReportDialog } from '@/components/BugReportDialog';
import { Home } from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
}

export function Header({ showBackButton = false }: HeaderProps) {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back/Home button */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            )}
          </div>

          {/* Right side - Bug report and theme toggle */}
          <div className="flex items-center gap-2">
            <BugReportDialog />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
