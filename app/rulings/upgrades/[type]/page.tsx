import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RulingsPage } from '@/components/rulings/RulingsPage';
import { UPGRADE_TYPE_ORDER } from '@/lib/rulings/build';
import { findRulingsPage } from '@/lib/rulings/pages';

export const revalidate = false;

export function generateStaticParams() {
  return UPGRADE_TYPE_ORDER.map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const spec = findRulingsPage(`/rulings/upgrades/${type}`);
  return spec ? { title: spec.title, description: spec.description } : {};
}

export default async function UpgradeTypeRulingsPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const spec = findRulingsPage(`/rulings/upgrades/${type}`);
  if (!spec) notFound();
  return <RulingsPage spec={spec} />;
}
