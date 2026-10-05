import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RulingsPage } from '@/components/rulings/RulingsPage';
import { findRulingsPage, RULINGS_PAGES } from '@/lib/rulings/pages';

// Static until the card data changes: /api/revalidate invalidates the catalog tag
// these pages' data is cached under (see lib/cardApi.ts).
export const revalidate = false;

const SECTION_PAGES = RULINGS_PAGES.filter((page) => page.href.split('/').length === 3 && page.href !== '/rulings/upgrades');

export function generateStaticParams() {
  return SECTION_PAGES.map((page) => ({ section: page.href.split('/')[2] }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const spec = findRulingsPage(`/rulings/${section}`);
  return spec ? { title: spec.title, description: spec.description } : {};
}

export default async function RulingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const spec = findRulingsPage(`/rulings/${section}`);
  if (!spec) notFound();
  return <RulingsPage spec={spec} />;
}
