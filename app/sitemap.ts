import type { MetadataRoute } from 'next';
import { getCardCatalog } from '@/lib/cards/catalog';
import { objectiveEntries, shipEntries, squadronEntries, upgradeEntries } from '@/lib/cards/entries';
import { RULINGS_PAGES } from '@/lib/rulings/pages';
import { SITE_URL } from '@/lib/site';

// Rebuilt with the card pages: /api/revalidate expires the catalog tag this reads.
export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ['/ships', '/squadrons', '/upgrades', '/objectives', '/rulings', '/changelog', '/changelog/arm', '/about', '/guide', '/resources'];
  const pages: MetadataRoute.Sitemap = [
    ...fixed.map((path) => ({ url: `${SITE_URL}${path}`, priority: path === '/rulings' || path === '/ships' ? 1 : 0.8 })),
    ...RULINGS_PAGES.filter((page) => !fixed.includes(page.href)).map((page) => ({ url: `${SITE_URL}${page.href}`, priority: 0.7 })),
  ];
  try {
    const catalog = await getCardCatalog();
    const cards = [...shipEntries(catalog), ...squadronEntries(catalog), ...upgradeEntries(catalog), ...objectiveEntries(catalog)];
    pages.push(...cards.map((card) => ({ url: `${SITE_URL}${card.href}`, priority: 0.6 })));
  } catch {
    // Without the card API the sitemap still lists the section pages.
  }
  return pages;
}
