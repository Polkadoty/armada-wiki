import type { Metadata } from 'next';
import { RulingsPage } from '@/components/rulings/RulingsPage';
import { findRulingsPage } from '@/lib/rulings/pages';

export const revalidate = false;

const spec = findRulingsPage('/rulings/upgrades')!;

export const metadata: Metadata = { title: spec.title, description: spec.description };

export default function AllUpgradesRulingsPage() {
  return <RulingsPage spec={spec} />;
}
