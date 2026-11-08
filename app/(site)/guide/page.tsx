import type { Metadata } from 'next';
import Link from 'next/link';
import { ProseSheet } from '@/components/wiki/ProseSheet';

export const metadata: Metadata = {
  title: 'Getting started',
  description: 'New to Star Wars: Armada? What ships, squadrons, upgrades and objectives do, and how to find cards on the wiki.',
  alternates: { canonical: '/guide' },
};

export default function GuidePage() {
  return (
    <ProseSheet title="Getting started" intro="New to Star Wars: Armada? Start here.">
      <p>
        Star Wars: Armada is a miniatures game of fleet battles. Each player brings a fleet of capital ships and starfighter squadrons, built to a
        points limit, and plays to the victory conditions of an objective card.
      </p>

      <h2>The four kinds of cards</h2>
      <ul>
        <li>
          <Link href="/ships">Ships</Link> are the core of a fleet. A ship card gives its hull, shields, dice in each hull zone, navigation chart,
          command value and the upgrade slots it can fill.
        </li>
        <li>
          <Link href="/squadrons">Squadrons</Link> are starfighters. Keywords such as BOMBER, ESCORT and SWARM set what each one is good at. Aces are
          unique squadrons with their own ability.
        </li>
        <li>
          <Link href="/upgrades">Upgrades</Link> go in a ship&apos;s slots: a commander for the fleet, officers, weapons, retrofits and titles. A ship
          can only take upgrades for the slots printed on its card.
        </li>
        <li>
          <Link href="/objectives">Objectives</Link> set up the battle. Each fleet brings three, and the first player chooses one of the second
          player&apos;s objectives. It changes setup and scoring for that game.
        </li>
      </ul>

      <h2>Finding cards</h2>
      <ul>
        <li>Press <kbd>/</kbd> on any page to search every card by name, keyword or card text.</li>
        <li>On a browse page, filter by faction, slot, keyword or content, and sort by points. The filters stay in the address bar, so you can share a filtered list.</li>
        <li>Each card page lists the card&apos;s rulings and links to other versions of the card, such as its Community erratum.</li>
        <li><Link href="/compare">Compare</Link> shows the stats of up to four cards side by side.</li>
        <li>Use the heart on a card page to save it to your <Link href="/favorites">favorites</Link> in this browser.</li>
      </ul>

      <h2>Building a fleet</h2>
      <p>
        When you are ready to build a list, <a href="https://star-forge.tools">Star Forge</a> checks points and fleet rules for you, and can print
        your cards.
      </p>
    </ProseSheet>
  );
}
