import { cn } from '@/lib/utils';

/** A glyph from the Armada icon font, with a text alternative for screen readers. */
export function ArmadaIcon({ glyph, label, className }: { glyph: string; label?: string; className?: string }) {
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
