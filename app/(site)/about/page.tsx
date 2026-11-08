import type { Metadata } from 'next';
import Link from 'next/link';
import { ProseSheet } from '@/components/wiki/ProseSheet';

export const metadata: Metadata = {
  title: 'About',
  description: 'Where the Armada Wiki gets its card data and rulings, and how to report a problem.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <ProseSheet title="About" intro="A community reference for Star Wars: Armada.">
      <p>
        The Armada Wiki lists every ship, squadron, upgrade and objective with its points, stats and rulings. Players build it, and it is not
        affiliated with Fantasy Flight Games or Atomic Mass Games.
      </p>

      <h2>Card data</h2>
      <p>Card data comes from the Swarmada API, the same source Star Forge uses. The wiki covers three sets of cards:</p>
      <ul>
        <li><strong>Core.</strong> The official Star Wars: Armada cards.</li>
        <li><strong>Community.</strong> The Community Edition. Its errata replace the core cards they change, and it adds new cards.</li>
        <li><strong>Nexus.</strong> A community expansion with new ships, squadrons and upgrades.</li>
      </ul>
      <p>
        Card pages show the new card designs where they exist. Each card page can switch back to the original printing.
      </p>

      <h2>Rulings</h2>
      <p>
        <Link href="/rulings">Rulings</Link> collects the clarifications for each card and follows the Armada Reference Manual. The{' '}
        <Link href="/changelog/arm">Reference Manual changelog</Link> lists every ARM revision.
      </p>

      <h2>Related tools</h2>
      <ul>
        <li><a href="https://star-forge.tools">Star Forge</a> builds, saves, prints and shares fleets.</li>
        <li><a href="https://t5.tools">T5 Tools</a> runs tournaments: pairings, scoring and results.</li>
      </ul>

      <h2>Report a problem</h2>
      <p>
        Use <strong>Report a bug</strong> at the bottom of any page for wrong card data or a broken page. For a card, you can also leave a comment
        on its page.
      </p>
    </ProseSheet>
  );
}
