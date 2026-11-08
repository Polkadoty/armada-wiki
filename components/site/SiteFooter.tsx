import Link from 'next/link';
import { BugReportDialog } from '@/components/BugReportDialog';
import { CARD_LINKS, MORE_LINKS } from './links';

const COLUMNS = [
  { title: 'Cards', links: CARD_LINKS },
  {
    title: 'Reference',
    links: [
      { href: '/rulings', label: 'Rulings' },
      { href: '/rulebook', label: 'Rulebook' },
      { href: '/changelog', label: 'Community changelog' },
      { href: '/changelog/arm', label: 'Reference Manual changelog' },
      { href: '/rulings-pdf', label: 'Rulings PDF' },
    ],
  },
  { title: 'More', links: MORE_LINKS },
];

export function SiteFooter() {
  return (
    <footer data-print-hide className="mx-auto mt-10 max-w-7xl px-0 pb-10 sm:px-4">
      <div className="wiki-sheet !py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-logo text-lg font-bold uppercase tracking-[0.06em] text-rulebook-accent">Armada Wiki</Link>
            <p className="mt-2 text-sm text-rulebook-muted">
              Cards and rulings for Star Wars: Armada, with the Community Edition errata and Nexus. Card data comes from the Swarmada API.
            </p>
            <div className="-ml-3 mt-3">
              <BugReportDialog />
            </div>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="wiki-section-title !mb-2">{column.title}</h2>
              <ul className="space-y-1 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-rulebook-ink hover:text-rulebook-accent hover:underline">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-8 border-t border-rulebook-accent/10 pt-4 text-xs text-rulebook-muted">
          Star Wars: Armada is a trademark of Fantasy Flight Games. This is an unofficial fan project. Rulings follow the Armada Reference Manual.
        </p>
      </div>
    </footer>
  );
}
