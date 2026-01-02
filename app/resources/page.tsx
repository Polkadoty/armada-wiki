'use client';

import { Header } from '@/components/Header';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, ShoppingCart, Users, Printer, Youtube, BookOpen, MessageCircle } from 'lucide-react';

const resources = {
  community: [
    {
      name: 'Armada Legacy Discord',
      description: 'The main community hub for Armada Legacy discussion, fleet building, and finding games',
      url: 'https://discord.gg/armadalegacy',
      icon: MessageCircle,
    },
    {
      name: 'r/StarWarsArmada',
      description: 'Reddit community for Star Wars: Armada players',
      url: 'https://reddit.com/r/StarWarsArmada',
      icon: Users,
    },
    {
      name: 'Armada YouTube',
      description: 'Battle reports, tutorials, and strategy content',
      url: 'https://www.youtube.com/results?search_query=star+wars+armada',
      icon: Youtube,
    },
  ],
  tools: [
    {
      name: 'Star Forge Fleet Builder',
      description: 'Build, save, and share your Armada fleets online',
      url: 'https://star-forge.tools',
      icon: BookOpen,
    },
    {
      name: 'T5 Tools',
      description: 'Tournament organization, pairings, and results tracking',
      url: 'https://t5.tools',
      icon: Users,
    },
  ],
  purchasing: [
    {
      name: 'Fantasy Flight Games',
      description: 'Official store for Star Wars: Armada products',
      url: 'https://www.fantasyflightgames.com/en/products/star-wars-armada/',
      icon: ShoppingCart,
    },
    {
      name: 'Amazon',
      description: 'Find new and used Armada products',
      url: 'https://www.amazon.com/s?k=star+wars+armada',
      icon: ShoppingCart,
    },
    {
      name: 'Miniature Market',
      description: 'Specialty retailer for miniatures games',
      url: 'https://www.miniaturemarket.com/searchresults?q=star+wars+armada',
      icon: ShoppingCart,
    },
  ],
  printing: [
    {
      name: 'Armada Legacy Print Files',
      description: 'Official print-ready files for Legacy expansion cards',
      url: 'https://armadalegacy.com/print',
      icon: Printer,
    },
    {
      name: 'MakePlayingCards',
      description: 'High-quality custom card printing service',
      url: 'https://www.makeplayingcards.com/',
      icon: Printer,
    },
  ],
  rules: [
    {
      name: 'Official Rules Reference',
      description: 'Complete rules reference for Star Wars: Armada',
      url: 'https://images-cdn.fantasyflightgames.com/filer_public/53/41/53414ea1-3a70-4774-a2f3-e5e02a97478e/swm_rules_reference_14.pdf',
      icon: BookOpen,
    },
    {
      name: 'Armada Legacy Rules',
      description: 'Rules and FAQ for Armada Legacy content',
      url: 'https://armadalegacy.com/rules',
      icon: BookOpen,
    },
  ],
};

export default function ResourcesPage() {
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();

  return (
    <div className="min-h-screen">
      <Header showBackButton={true} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Resources</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Helpful links for the Armada community
        </p>

        <div className="space-y-8">
          {/* Community */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Community</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.community.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="w-4 h-4" />
                          {resource.name}
                          <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Tools */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Tools</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.tools.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="w-4 h-4" />
                          {resource.name}
                          <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Rules */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Rules & Documentation</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.rules.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="w-4 h-4" />
                          {resource.name}
                          <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Purchasing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Where to Buy</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {resources.purchasing.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="w-4 h-4" />
                          {resource.name}
                          <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Printing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Printing Custom Cards</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.printing.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="w-4 h-4" />
                          {resource.name}
                          <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
