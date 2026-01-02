'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Anchor, Plane, Wrench, Target, ChevronRight, Lightbulb, BookOpen, Gamepad2 } from 'lucide-react';

export default function GuidePage() {
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Getting Started</h1>
        <p className="text-lg text-muted-foreground mb-8">
          New to Star Wars: Armada? Here&apos;s everything you need to know.
        </p>

        <div className="space-y-8">
          {/* What is Armada */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">What is Star Wars: Armada?</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Star Wars: Armada is a miniatures game of epic fleet battles set in the Star Wars universe.
              Players command massive capital ships, squadrons of starfighters, and legendary heroes
              to battle for control of the galaxy.
            </p>
            <p className="text-muted-foreground">
              The game was originally produced by Fantasy Flight Games and has since been continued
              by the community through the Armada Legacy project, which adds new ships, squadrons,
              and game modes.
            </p>
          </section>

          {/* Card Types */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Understanding Card Types</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/ships">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Anchor className="w-5 h-5 text-faction-empire" />
                      Ships
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Capital ships are the backbone of your fleet. From nimble corvettes to
                      massive Star Destroyers, each ship has unique capabilities, upgrade slots,
                      and tactical roles.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/squadrons">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="w-5 h-5 text-faction-rebel" />
                      Squadrons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Starfighter squadrons provide tactical flexibility. They can screen your
                      ships, hunt enemy bombers, or deliver devastating bombing runs against
                      capital ships.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/upgrades">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-faction-republic" />
                      Upgrades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Upgrades customize your ships with commanders, officers, weapons, and
                      modifications. Each ship has specific upgrade slots that determine what
                      can be equipped.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/objectives">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-faction-separatist" />
                      Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Objectives define the victory conditions for each game. They add strategic
                      depth and ensure every battle is different, rewarding different fleet
                      compositions and tactics.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* Using the Wiki */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Using the Wiki</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Search Across All Cards</h3>
                <p className="text-sm text-muted-foreground">
                  Press <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">/</kbd> anywhere
                  to open global search and find any card by name or ability text.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Filter by Faction & Content</h3>
                <p className="text-sm text-muted-foreground">
                  Use the filter buttons on browse pages to narrow down cards by faction (Rebel,
                  Empire, Republic, etc.) or content pack (Core, Legacy, Nexus).
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Sort Your Results</h3>
                <p className="text-sm text-muted-foreground">
                  Sort cards by name, points cost, faction, or other attributes to find exactly
                  what you&apos;re looking for.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Compare Cards</h3>
                <p className="text-sm text-muted-foreground">
                  Use the <Link href="/compare" className="text-primary hover:underline">Compare</Link> tool
                  to see side-by-side comparisons of ships, squadrons, or upgrades.
                </p>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="pt-4">
            <h2 className="text-2xl font-semibold mb-4">Ready to Explore?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/ships"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                Browse Ships
              </Link>
              <Link
                href="/squadrons"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                Browse Squadrons
              </Link>
              <Link
                href="/upgrades"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                Browse Upgrades
              </Link>
              <Link
                href="/objectives"
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                Browse Objectives
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
