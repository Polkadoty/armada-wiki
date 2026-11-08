import { cn } from '@/lib/utils';

/** Marks a glyph that is an SVG in public/images/icons rather than a character of the icon font. */
export const SVG_GLYPH_PREFIX = 'svg:';

/** A glyph from the Armada icon font, with a text alternative for screen readers. */
export function ArmadaIcon({ glyph, label, className }: { glyph: string; label?: string; className?: string }) {
  if (glyph.startsWith(SVG_GLYPH_PREFIX)) {
    const name = glyph.slice(SVG_GLYPH_PREFIX.length);
    return (
      <span
        className={cn('inline-block size-[1em] bg-current align-[-0.125em]', className)}
        style={{ mask: `url(/images/icons/${name}.svg) center / contain no-repeat`, WebkitMask: `url(/images/icons/${name}.svg) center / contain no-repeat` }}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      />
    );
  }
  return (
    <span
      className={cn('font-icons not-italic leading-none', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {glyph}
    </span>
  );
}

/** The New Republic emblem has no icon-font glyph, so it is drawn as a mask in currentColor. */
export function NewRepublicIcon({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="New Republic"
      className={cn('inline-block size-[1em] bg-current align-[-0.125em] [mask:url(/images/nr-logo.svg)_center/contain_no-repeat]', className)}
    />
  );
}
