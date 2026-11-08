import { cn } from '@/lib/utils';

const DIE_STYLES = [
  { label: 'red', className: 'bg-[#c0392b]' },
  { label: 'blue', className: 'bg-[#2e5fa8]' },
  { label: 'black', className: 'bg-[#1d1d1f]' },
];

/** A `[red, blue, black]` dice count as coloured dice. */
export function Dice({ dice }: { dice?: number[] }) {
  const counts = (dice ?? []).slice(0, 3);
  const total = counts.reduce((sum, count) => sum + (count || 0), 0);
  if (total === 0) return <span className="text-rulebook-muted">None</span>;
  const label = counts.map((count, index) => (count ? `${count} ${DIE_STYLES[index].label}` : '')).filter(Boolean).join(', ');
  return (
    <span className="inline-flex flex-wrap items-center gap-1" role="img" aria-label={label}>
      {counts.flatMap((count, index) =>
        Array.from({ length: count || 0 }, (_, n) => (
          <span key={`${index}-${n}`} className={cn('inline-block size-3.5 rotate-45 rounded-[2px] shadow-sm ring-1 ring-black/10', DIE_STYLES[index].className)} />
        )),
      )}
    </span>
  );
}
