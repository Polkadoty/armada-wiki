'use client';

import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Heart, Code, Users } from 'lucide-react';

export default function AboutPage() {
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About Armada Wiki</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg text-muted-foreground">
              Armada Wiki is a community-driven reference for Star Wars: Armada and Armada Legacy.
              Our goal is to provide comprehensive, up-to-date information about every ship, squadron,
              upgrade, and objective in the game.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-6 not-prose">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built by fans, for fans. Our data comes from the community and is regularly
                  updated to include new content, rulings, and errata.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Open Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Card data is provided by the Swarmada API, making it easy for other tools
                  and applications to access the same information.
                </p>
              </CardContent>
            </Card>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Sources</h2>
            <p className="text-muted-foreground mb-4">
              The wiki pulls data from the following sources:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Core</strong> - Official Star Wars: Armada content from Fantasy Flight Games</li>
              <li><strong>Legacy</strong> - Armada Legacy community expansion content</li>
              <li><strong>Nexus</strong> - Crossover content including ships from other universes</li>
              <li><strong>ARC</strong> - Additional community-created content</li>
              <li><strong>Legends</strong> - Extended universe content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Related Projects</h2>
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              <a
                href="https://star-forge.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    Star Forge Fleet Builder
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Build and share your Armada fleets
                  </p>
                </div>
              </a>

              <a
                href="https://t5.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    T5 Tools
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tournament organization and tracking
                  </p>
                </div>
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contributing</h2>
            <p className="text-muted-foreground mb-4">
              Found an error or have a suggestion? We welcome contributions from the community!
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use the bug report button in the header to report issues</li>
              <li>Leave comments on card pages with corrections or clarifications</li>
              <li>Join the Armada Legacy Discord to discuss content updates</li>
            </ul>
          </section>

          <section className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-faction-rebel" />
              Made with love by the Armada community
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
