import type { Metadata } from 'next';
import { RulingsNav } from '@/components/rulings/RulingsNav';
import { RulingsTopBar } from '@/components/rulings/RulingsTopBar';
import { RULINGS_DESCRIPTION, RULINGS_TITLE } from '@/lib/rulings/pages';

export const metadata: Metadata = {
  title: { default: `${RULINGS_TITLE} | Armada Wiki`, template: `%s | ${RULINGS_TITLE}` },
  description: RULINGS_DESCRIPTION,
};

export default function RulingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-rulebook
      className="force-light min-h-screen bg-[#444] bg-[url(/images/rulebook-background.webp)] bg-cover bg-fixed bg-top font-body text-rulebook-ink"
    >
      <RulingsTopBar />
      <div className="mx-auto flex max-w-7xl gap-8 px-0 py-6 sm:px-4 sm:py-10">
        <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-60 shrink-0 self-start overflow-y-auto rounded-lg border border-rulebook-accent/10 bg-rulebook-sheet/90 p-3 shadow-sm lg:block">
          <RulingsNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
