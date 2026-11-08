/* eslint-disable @next/next/no-img-element -- card faces come from the card API's image hosts */
import type { CardFace, PointsKind } from '@/lib/cards/images';
import { cn } from '@/lib/utils';

// Where the new designs leave room for the points field, in each card kind's own
// coordinates. Matches Star Forge's CARD_POINTS_LAYOUT, which follows the generator.
const POINTS_LAYOUT: Record<PointsKind, { width: number; height: number; x: number; y: number; boxWidth: number; boxHeight: number }> = {
  ship: { width: 874, height: 1457, x: 740, y: 1361, boxWidth: 100, boxHeight: 66 },
  huge: { width: 1628, height: 1300, x: 1480, y: 1226, boxWidth: 120, boxHeight: 62 },
  squadron: { width: 750, height: 1050, x: 628, y: 978, boxWidth: 100, boxHeight: 58 },
  upgrade: { width: 750, height: 1050, x: 628, y: 984, boxWidth: 100, boxHeight: 58 },
};

/** The dark points field from the card generator, drawn over the reserved footer slot. */
export function CardPointsBox({ kind, points }: { kind: PointsKind; points: number }) {
  if (!Number.isInteger(points) || points < 0 || points > 9999) return null;
  const layout = POINTS_LAYOUT[kind];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <svg x={layout.x} y={layout.y} width={layout.boxWidth} height={layout.boxHeight} viewBox="0 0 142 96" preserveAspectRatio="none">
        <path d="M10 1H132L141 10V86L132 95H10L1 86V10Z" fill="#25282B" stroke="#B8BEC2" strokeWidth="2" />
        <text x="71" y="72" textAnchor="middle" fill="#FFFFFF" fontFamily="CardRevenger, sans-serif" fontSize={points > 999 ? 53 : points > 99 ? 63 : 72}>
          {points}
        </text>
      </svg>
    </svg>
  );
}

interface CardFaceImageProps {
  face?: CardFace;
  alt: string;
  points?: number;
  /** Use the original printing even when a new design exists. */
  original?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function CardFaceImage({ face, alt, points, original, priority, className }: CardFaceImageProps) {
  if (!face) {
    return (
      <div className={cn('wiki-card-face flex aspect-[5/7] items-center justify-center text-sm italic text-rulebook-muted', className)}>
        No image yet
      </div>
    );
  }
  const useOriginal = original && face.originalSrc;
  const src = useOriginal ? face.originalSrc! : face.src;
  return (
    <div className={cn('wiki-card-face relative', className)}>
      <img
        src={src}
        alt={alt}
        width={face.width}
        height={face.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className="block h-auto w-full"
      />
      {!useOriginal && face.pointsKind && points !== undefined && <CardPointsBox kind={face.pointsKind} points={points} />}
    </div>
  );
}
