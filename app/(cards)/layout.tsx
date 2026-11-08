import Link from 'next/link';
import { WikiTopBar } from '@/components/wiki/WikiTopBar';

// Every card page shares the Rules & Rulings look: parchment sheets over the rulebook
// background, in the light palette whatever the site theme.
export default function CardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-rulebook
      className="force-light min-h-screen bg-[#444] bg-[url(/images/rulebook-background.webp)] bg-cover bg-fixed bg-top font-body text-rulebook-ink"
    >
      <WikiTopBar />
      <main className="mx-auto max-w-7xl px-0 py-6 sm:px-4 sm:py-10">{children}</main>
      <footer className="mx-auto max-w-4xl px-4 pb-10">
        <p className="rounded-md bg-rulebook-sheet/85 px-4 py-2 text-center text-xs text-rulebook-muted">
          Card data from the <Link href="/about" className="underline underline-offset-2">Star Wars Armada API</Link>. Rulings follow the
          Armada Reference Manual. Star Wars: Armada is a trademark of Fantasy Flight Games. This is an unofficial fan project.
        </p>
      </footer>
    </div>
  );
}
