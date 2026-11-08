import type { Metadata } from 'next';
import { RulebookNav, type RulebookNavItem } from '@/components/rulebook/RulebookNav';
import { getCampaignGuides, getRulebook, RULEBOOK_DESCRIPTION, RULEBOOK_TITLE, sectionHref } from '@/lib/rulebook';

export const metadata: Metadata = {
  title: { default: `${RULEBOOK_TITLE} | Armada Wiki`, template: `%s | ${RULEBOOK_TITLE}` },
  description: RULEBOOK_DESCRIPTION,
};

export default async function RulebookLayout({ children }: { children: React.ReactNode }) {
  const [book, guides] = await Promise.all([getRulebook().catch(() => undefined), getCampaignGuides().catch(() => [])]);
  const sections = (book?.sections ?? []).filter((section) => section.id !== 'introduction');
  const items: RulebookNavItem[] = [
    { heading: 'Rules reference' },
    { href: '/rulebook', label: 'Contents' },
    ...sections.map((section) => ({ href: sectionHref(section), label: section.title, count: section.entries.length || undefined })),
    ...(guides.length > 0 ? [{ heading: 'Campaign guides' }] : []),
    ...guides.map(({ spec }) => ({ href: `/rulebook/${spec.slug}`, label: spec.title })),
  ];
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-0 py-6 sm:px-4 sm:py-10">
      <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-60 shrink-0 self-start overflow-y-auto rounded-lg border border-rulebook-accent/10 bg-rulebook-sheet/90 p-3 shadow-sm lg:block">
        <RulebookNav items={items} />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
