'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';

/**
 * Prints the rulebook from the reader's browser. Card images load lazily on screen, so
 * they are all requested first; a browser prints a lazy image that never loaded as blank.
 */
export function RulebookToolbar({ cardCount }: { cardCount: number }) {
  const [images, setImages] = useState(true);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);

  const toggleImages = (value: boolean) => {
    setImages(value);
    document.documentElement.toggleAttribute('data-book-no-images', !value);
  };

  const print = async () => {
    if (images) {
      const pending = [...document.querySelectorAll<HTMLImageElement>('.rulebook-document img')];
      let loaded = 0;
      setProgress({ loaded, total: pending.length });
      await Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              const done = () => {
                loaded += 1;
                setProgress({ loaded, total: pending.length });
                resolve();
              };
              if (img.complete && img.naturalWidth > 0) return done();
              img.addEventListener('load', done, { once: true });
              // A missing image prints as its frame; it should not hold up the rest.
              img.addEventListener('error', done, { once: true });
              img.loading = 'eager';
            }),
        ),
      );
      setProgress(null);
    }
    window.print();
  };

  const busy = progress !== null;

  return (
    <div data-print-hide className="mb-4 rounded-lg border border-rulebook-accent/15 bg-rulebook-sheet/95 px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={print}
          disabled={busy}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-rulebook-accent px-4 text-[15px] font-bold text-white hover:bg-rulebook-accent/90 disabled:opacity-70"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FileDown className="size-4" aria-hidden />}
          {busy ? `Loading card images, ${progress.loaded} of ${progress.total}` : 'Save as PDF'}
        </button>
        <label className="flex items-center gap-2 text-[15px]">
          <input type="checkbox" checked={images} onChange={(event) => toggleImages(event.target.checked)} className="size-4 accent-[#24408f]" />
          Include card images
        </label>
        <span className="text-sm text-rulebook-muted">{cardCount} cards</span>
      </div>
      <p className="mt-3 text-sm text-rulebook-muted">
        Your browser makes the PDF. In the print dialog, set the destination to <strong>Save as PDF</strong>. Chrome and Edge give the best
        result and add page numbers. With card images the PDF is about 50 MB and 560 pages. Without them it is about 7 MB and 420 pages.
      </p>
    </div>
  );
}
