/* eslint-disable @next/next/no-img-element */
import type { ContentSource } from '@/utils/cardSources';

// Lives under components/ (not utils/) so Tailwind's content scan picks up these classes.
const SOURCE_BADGE_CLASSES: Record<ContentSource, string> = {
  Core: 'bg-slate-500 text-white',
  Community: 'bg-emerald-700 text-white',
  Nexus: 'bg-blue-500 text-white',
};

// Get source badge color classes
export function getSourceBadgeClasses(source: string): string {
  return SOURCE_BADGE_CLASSES[source as ContentSource] || 'bg-primary text-primary-foreground';
}

// Badge contents for a content source; Community cards carry the community mark, matching
// the changelog. Place inside an inline-flex container (Badge already is).
export function SourceLabel({ source }: { source: string }) {
  return (
    <>
      {source === 'Community' && (
        <img src="/community-logo.svg" alt="" aria-hidden="true" className="h-[1.1em] w-auto shrink-0" />
      )}
      {source}
    </>
  );
}
