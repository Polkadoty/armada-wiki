import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import {
  CARD_CATALOG_TAG,
  datasetFingerprint,
  getCatalogManifest,
  getLiveCatalogManifest,
} from '@/lib/cardApi';
import { RULINGS_DATASETS } from '@/lib/rulings/data';

// Rebuilds the server-rendered card pages (rulings, changelog) only when the card API's
// data has actually changed. Called by the-isb-api after it deploys (POST) and by a
// daily Vercel cron as a backstop (GET); both are no-ops unless a watched dataset's
// content hash differs from the one the current pages were built from.

export const dynamic = 'force-dynamic';

/** Datasets rendered on the server. The browse pages load card data in the browser. */
const WATCHED_DATASETS = [
  ...Object.values(RULINGS_DATASETS),
  // The Community changelog compares Community cards with their core/ARC/Legacy forms.
  'ships', 'community-ships',
  'arc-ships', 'arc-squadrons', 'arc-upgrades', 'arc-objectives',
  'legacy-ships', 'legacy-squadrons', 'legacy-upgrades',
];

function authorized(request: Request): boolean {
  const secrets = [process.env.REVALIDATE_SECRET, process.env.CRON_SECRET].filter(Boolean);
  const header = request.headers.get('authorization') ?? '';
  return secrets.some((secret) => header === `Bearer ${secret}`);
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let built, live;
  try {
    [built, live] = await Promise.all([getCatalogManifest(), getLiveCatalogManifest()]);
  } catch (error) {
    // Leave the current pages in place; the caller can retry.
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 });
  }

  const changed = WATCHED_DATASETS.filter(
    (key) => datasetFingerprint(built.files[key]) !== datasetFingerprint(live.files[key]),
  );
  if (changed.length > 0) {
    // Expire immediately: the next visit to each page renders it from the new data.
    revalidateTag(CARD_CATALOG_TAG, { expire: 0 });
  }

  return NextResponse.json({
    revalidated: changed.length > 0,
    changed,
    builtFrom: built.globalLastModified ?? null,
    live: live.globalLastModified ?? null,
  });
}

export const GET = handle;
export const POST = handle;
