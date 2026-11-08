import type { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import { ProseSheet } from '@/components/wiki/ProseSheet';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Links for Star Wars: Armada players: community hubs, fleet and tournament tools, rules, printing and where to buy.',
  alternates: { canonical: '/resources' },
};

const resources = {
  community: [
    {
      name: 'Armada Legacy Discord',
      description: 'The main community hub for Armada Legacy discussion, fleet building, and finding games',
      url: 'https://discord.gg/armadalegacy',
    },
    {
      name: 'r/StarWarsArmada',
      description: 'Reddit community for Star Wars: Armada players',
      url: 'https://reddit.com/r/StarWarsArmada',
    },
    {
      name: 'Armada YouTube',
      description: 'Battle reports, tutorials, and strategy content',
      url: 'https://www.youtube.com/results?search_query=star+wars+armada',
    },
  ],
  tools: [
    {
      name: 'Star Forge Fleet Builder',
      description: 'Build, save, and share your Armada fleets online',
      url: 'https://star-forge.tools',
    },
    {
      name: 'T5 Tools',
      description: 'Tournament organization, pairings, and results tracking',
      url: 'https://t5.tools',
    },
  ],
  purchasing: [
    {
      name: 'Fantasy Flight Games',
      description: 'Official store for Star Wars: Armada products',
      url: 'https://www.fantasyflightgames.com/en/products/star-wars-armada/',
    },
    {
      name: 'Amazon',
      description: 'Find new and used Armada products',
      url: 'https://www.amazon.com/s?k=star+wars+armada',
    },
    {
      name: 'Miniature Market',
      description: 'Specialty retailer for miniatures games',
      url: 'https://www.miniaturemarket.com/searchresults?q=star+wars+armada',
    },
  ],
  printing: [
    {
      name: 'Armada Legacy Print Files',
      description: 'Official print-ready files for Legacy expansion cards',
      url: 'https://armadalegacy.com/print',
    },
    {
      name: 'MakePlayingCards',
      description: 'High-quality custom card printing service',
      url: 'https://www.makeplayingcards.com/',
    },
  ],
  rules: [
    {
      name: 'Armada Reference Manual',
      description: 'The full rules reference the wiki\'s rulings follow (PDF)',
      url: 'https://d2j4aq9mja0i3a.cloudfront.net/armada-reference-manual/ARM%20v1.1.pdf',
    },
    {
      name: 'Armada Legacy Rules',
      description: 'Rules and FAQ for Armada Legacy content',
      url: 'https://armadalegacy.com/rules',
    },
  ],
};

const SECTIONS: Array<{ title: string; items: Array<{ name: string; description: string; url: string }> }> = [
  { title: 'Community', items: resources.community },
  { title: 'Tools', items: resources.tools },
  { title: 'Rules', items: resources.rules },
  { title: 'Where to buy', items: resources.purchasing },
  { title: 'Printing cards', items: resources.printing },
];

export default function ResourcesPage() {
  return (
    <ProseSheet title="Resources" intro="Links for Armada players.">
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <ul className="not-prose grid gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-md border border-rulebook-accent/15 bg-white/50 px-4 py-3 transition-colors hover:border-rulebook-accent/40"
                >
                  <span className="flex items-center gap-2 font-bold text-rulebook-ink group-hover:text-rulebook-accent">
                    {item.name}
                    <ExternalLink className="size-3.5 text-rulebook-muted" aria-hidden />
                  </span>
                  <span className="mt-0.5 text-sm text-rulebook-muted">{item.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </ProseSheet>
  );
}
