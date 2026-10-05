// Server-side access to the card API, shared by every page that renders card data at
// build time.
//
// The API publishes a manifest (`/lastModified`) listing a SHA-256 hash per dataset,
// and serves each dataset version at an immutable `/catalog/<dataset>.<hash>.json`
// URL (see the-isb-api docs/catalog-caching.md). Pages read the manifest through
// Next's data cache under CARD_CATALOG_TAG and never expire it on a timer; the snapshot
// bodies are immutable, so they're cached outright. Pages are therefore rebuilt only
// when /api/revalidate sees a watched dataset's hash change and invalidates the tag.

export type JsonObject = Record<string, unknown>;

export const CARD_CATALOG_TAG = 'card-catalog';

export interface CatalogFile {
  lastModified?: string;
  hash?: string;
  url?: string;
  endpoint?: string;
}

export interface CatalogManifest {
  globalLastModified?: string;
  files: Record<string, CatalogFile>;
}

export function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function apiHosts(): string[] {
  const primary = process.env.NEXT_PUBLIC_PRIMARY_API_URL || 'https://api.swarmada.wiki';
  const backup = process.env.NEXT_PUBLIC_BACKUP_API_URL || 'https://api-backup.swarmada.wiki';
  return [...new Set([primary, backup].map((base) => base.replace(/\/$/, '')))];
}

async function fetchJson(path: string, init: RequestInit): Promise<{ data: JsonObject; warning?: string }> {
  let lastError = 'unknown error';
  for (const base of apiHosts()) {
    try {
      const response = await fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(12_000) });
      if (!response.ok) {
        lastError = `${response.status} ${response.statusText}`;
        continue;
      }
      return { data: asObject(await response.json()) };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  return { data: {}, warning: `${path}: ${lastError}` };
}

function toManifest(data: JsonObject): CatalogManifest {
  const files = asObject(data.files) as Record<string, CatalogFile>;
  if (Object.keys(files).length === 0) throw new Error('Card API manifest has no files');
  return { globalLastModified: typeof data.globalLastModified === 'string' ? data.globalLastModified : undefined, files };
}

/** The manifest the current pages were built from (cached until CARD_CATALOG_TAG is invalidated). */
export async function getCatalogManifest(): Promise<CatalogManifest> {
  const { data, warning } = await fetchJson('/lastModified', { cache: 'force-cache', next: { tags: [CARD_CATALOG_TAG] } });
  if (warning) throw new Error(`Card API manifest unavailable (${warning})`);
  return toManifest(data);
}

/** The manifest the API is serving right now, bypassing every cache. */
export async function getLiveCatalogManifest(): Promise<CatalogManifest> {
  const { data, warning } = await fetchJson('/lastModified', { cache: 'no-store' });
  if (warning) throw new Error(`Card API manifest unavailable (${warning})`);
  return toManifest(data);
}

/** A watched dataset's identity: its content hash, or its timestamp from a pre-hash manifest. */
export function datasetFingerprint(file: CatalogFile | undefined): string {
  return file?.hash ?? file?.lastModified ?? 'missing';
}

/**
 * One dataset, at the version the cached manifest names. Hashed snapshots are fetched
 * by their immutable URL; a manifest entry without one falls back to the dataset's
 * endpoint, tagged so it is refreshed together with the manifest.
 */
export async function fetchCatalogDataset(key: string): Promise<{ data: JsonObject; warning?: string }> {
  const manifest = await getCatalogManifest();
  const file = manifest.files[key];
  if (file?.url && file.hash) return fetchJson(file.url, { cache: 'force-cache' });
  if (file?.endpoint) return fetchJson(file.endpoint, { cache: 'force-cache', next: { tags: [CARD_CATALOG_TAG] } });
  return { data: {}, warning: `${key}: not in the card API manifest` };
}
