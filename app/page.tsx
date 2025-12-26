'use client';

import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header showBackButton={false} />

      <main className="max-w-7xl mx-auto p-8">
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold mb-4">Armada Wiki</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your comprehensive resource for Star Wars Armada cards and game content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Link
            href="/ships"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card block"
          >
            <h2 className="text-2xl font-semibold mb-2">Ships</h2>
            <p className="text-muted-foreground">
              Browse all ship cards across all formats
            </p>
          </Link>

          <Link
            href="/squadrons"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card block"
          >
            <h2 className="text-2xl font-semibold mb-2">Squadrons</h2>
            <p className="text-muted-foreground">
              Explore squadron cards and aces
            </p>
          </Link>

          <Link
            href="/upgrades"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card block"
          >
            <h2 className="text-2xl font-semibold mb-2">Upgrades</h2>
            <p className="text-muted-foreground">
              Search upgrade cards by type
            </p>
          </Link>

          <Link
            href="/objectives"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card block"
          >
            <h2 className="text-2xl font-semibold mb-2">Objectives</h2>
            <p className="text-muted-foreground">
              View objective cards
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
