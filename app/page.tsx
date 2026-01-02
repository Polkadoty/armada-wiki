'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { Anchor, Plane, Wrench, Target, ChevronRight, Sparkles } from "lucide-react";
import { fetchCardData } from "@/utils/dataFetcher";

interface CardCounts {
  ships: number;
  squadrons: number;
  upgrades: number;
  objectives: number;
}

const navCards = [
  {
    href: "/ships",
    title: "Ships",
    description: "Capital ships from Star Destroyers to Mon Calamari Cruisers",
    icon: Anchor,
    gradient: "from-faction-empire to-faction-empire/70",
    hoverGlow: "hover:shadow-[0_0_30px_hsl(var(--faction-empire)/0.3)]",
  },
  {
    href: "/squadrons",
    title: "Squadrons",
    description: "Fighters, bombers, and ace pilots across all factions",
    icon: Plane,
    gradient: "from-faction-rebel to-faction-rebel/70",
    hoverGlow: "hover:shadow-[0_0_30px_hsl(var(--faction-rebel)/0.3)]",
  },
  {
    href: "/upgrades",
    title: "Upgrades",
    description: "Commanders, officers, weapons, and modifications",
    icon: Wrench,
    gradient: "from-faction-republic to-faction-republic/70",
    hoverGlow: "hover:shadow-[0_0_30px_hsl(var(--faction-republic)/0.3)]",
  },
  {
    href: "/objectives",
    title: "Objectives",
    description: "Assault, defense, navigation, and special objectives",
    icon: Target,
    gradient: "from-faction-separatist to-faction-separatist/70",
    hoverGlow: "hover:shadow-[0_0_30px_hsl(var(--faction-separatist)/0.3)]",
  },
];

export default function Home() {
  const [counts, setCounts] = useState<CardCounts | null>(null);
  const { isOpen, setIsOpen, openSearch } = useGlobalSearch();

  useEffect(() => {
    async function loadCounts() {
      await fetchCardData();

      // Count items from localStorage
      const countItems = (keys: string[]) => {
        let total = 0;
        keys.forEach(key => {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              if (parsed.ships) {
                // Ships have nested models
                Object.values(parsed.ships).forEach((ship: unknown) => {
                  const s = ship as { models?: Record<string, unknown> };
                  if (s.models) {
                    total += Object.keys(s.models).length;
                  }
                });
              } else if (parsed.squadrons) {
                total += Object.keys(parsed.squadrons).length;
              } else if (parsed.upgrades) {
                total += Object.keys(parsed.upgrades).length;
              } else if (parsed.objectives) {
                total += Object.keys(parsed.objectives).length;
              }
            }
          } catch {
            // Ignore errors
          }
        });
        return total;
      };

      const shipKeys = ['ships', 'legacyShips', 'legacyBetaShips', 'nexusShips', 'arcShips', 'nabooShips'];
      const squadronKeys = ['squadrons', 'legacySquadrons', 'legacyBetaSquadrons', 'nexusSquadrons', 'arcSquadrons', 'nabooSquadrons'];
      const upgradeKeys = ['upgrades', 'legacyUpgrades', 'legacyBetaUpgrades', 'nexusUpgrades', 'arcUpgrades', 'nabooUpgrades', 'legendsUpgrades'];
      const objectiveKeys = ['objectives', 'legacyObjectives', 'legacyBetaObjectives', 'nexusObjectives', 'arcObjectives', 'nabooObjectives'];

      setCounts({
        ships: countItems(shipKeys),
        squadrons: countItems(squadronKeys),
        upgrades: countItems(upgradeKeys),
        objectives: countItems(objectiveKeys),
      });
    }

    loadCounts();
  }, []);

  return (
    <div className="min-h-screen">
      <Header showBackButton={false} onSearchClick={openSearch} />
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-faction-empire/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-faction-rebel/10 via-transparent to-transparent" />

        {/* Stars effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute top-32 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-100" />
          <div className="absolute top-16 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-200" />
          <div className="absolute top-40 left-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-300" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Community-Driven Database
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                Armada Wiki
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive reference for{" "}
              <span className="text-foreground font-medium">Star Wars: Armada</span>{" "}
              and <span className="text-foreground font-medium">Armada Legacy</span>
            </p>

            {/* Quick stats */}
            {counts && (
              <div className="flex flex-wrap justify-center gap-6 md:gap-10 pt-6">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{counts.ships}</div>
                  <div className="text-sm text-muted-foreground">Ships</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-faction-rebel">{counts.squadrons}</div>
                  <div className="text-sm text-muted-foreground">Squadrons</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-faction-republic">{counts.upgrades}</div>
                  <div className="text-sm text-muted-foreground">Upgrades</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-faction-separatist">{counts.objectives}</div>
                  <div className="text-sm text-muted-foreground">Objectives</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`
                  group relative overflow-hidden rounded-xl border bg-card p-6
                  transition-all duration-300
                  hover:scale-[1.02] hover:-translate-y-1
                  ${card.hoverGlow}
                `}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{card.title}</h2>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-xl border bg-card/50 p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/compare"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              Compare Cards
            </Link>
            <Link
              href="/favorites"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              Favorites
            </Link>
            <Link
              href="/guide"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              Getting Started
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              About
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
