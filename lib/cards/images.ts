import { sanitizeImageUrl } from '@/utils/dataFetcher';
import type { CardImageStyles, NewCardKind } from './catalog';

/** A card face ready to render: the new design when one exists, else the original. */
export interface CardFace {
  src: string;
  /** The original printing, when the new design replaced it. */
  originalSrc?: string;
  width: number;
  height: number;
  /** Set when `src` is a new design whose points must be drawn on (see CardPointsBox). */
  pointsKind?: PointsKind;
}

export type PointsKind = 'ship' | 'huge' | 'squadron' | 'upgrade';

// Pixel sizes of the published faces, used for width/height so the grid doesn't shift.
const NEW_SIZE: Record<NewCardKind, [number, number]> = {
  ship: [825, 1425],
  huge: [1628, 1300],
  squadron: [750, 1050],
  upgrade: [750, 1050],
  objective: [750, 1050],
  damage: [750, 1050],
};
const ORIGINAL_SIZE: Record<'ship' | 'poker', [number, number]> = {
  ship: [629, 1078],
  poker: [609, 865],
};

const CATALOG_HOSTS = new Set(['images.swarmada.wiki', 'api.swarmada.wiki', 'api-backup.swarmada.wiki']);

/**
 * Picks the face for a card image URL. Only hosted catalog faces are swapped, never
 * blueprints, silhouettes or bases. Original faces have their cost printed on them; the
 * new designs leave the points field empty for the current value.
 */
export function cardFace(cardimage: string | undefined, styles: CardImageStyles, fallback: 'ship' | 'poker'): CardFace | undefined {
  const original = sanitizeImageUrl(cardimage);
  if (!original) return undefined;
  const [width, height] = ORIGINAL_SIZE[fallback];
  try {
    const url = new URL(original);
    const match = url.pathname.match(/^\/images\/([^/]+\.webp)$/i);
    const style = match && CATALOG_HOSTS.has(url.hostname) && !/-(base|blueprint|silhouette)\.webp$/i.test(match[1])
      ? styles[match[1]]
      : undefined;
    if (!style) return { src: original, width, height };
    url.pathname = `/images/${style.filename}`;
    url.search = `?v=${style.version}`;
    const [newWidth, newHeight] = NEW_SIZE[style.kind];
    const pointsKind = style.kind === 'objective' || style.kind === 'damage' ? undefined : style.kind;
    return { src: url.href, originalSrc: original, width: newWidth, height: newHeight, pointsKind };
  } catch {
    return { src: original, width, height };
  }
}
