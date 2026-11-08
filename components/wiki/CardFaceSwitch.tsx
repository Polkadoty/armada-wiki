'use client';

import { useEffect, useState } from 'react';
import type { CardFace } from '@/lib/cards/images';
import { cn } from '@/lib/utils';
import { CardFaceImage } from './CardFaceImage';

const STORAGE_KEY = 'armada-wiki:card-face';

/** The card's face with a switch between the new design and the original printing. */
export function CardFaceSwitch({ face, alt, points }: { face?: CardFace; alt: string; points?: number }) {
  const [original, setOriginal] = useState(false);

  useEffect(() => {
    try {
      setOriginal(localStorage.getItem(STORAGE_KEY) === 'original');
    } catch {
      // Storage can be blocked; the new design stays the default.
    }
  }, []);

  const choose = (value: boolean) => {
    setOriginal(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'original' : 'new');
    } catch {
      // Keep the choice for this page only.
    }
  };

  return (
    <div>
      <CardFaceImage face={face} alt={alt} points={points} original={original} priority />
      {face?.originalSrc && (
        <div role="group" aria-label="Card design" className="mt-3 flex justify-center">
          <div className="inline-flex rounded-full border border-rulebook-accent/20 bg-white/60 p-0.5 text-[13px]">
            {[
              { value: false, label: 'New design' },
              { value: true, label: 'Original printing' },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={original === option.value}
                onClick={() => choose(option.value)}
                className={cn(
                  'rounded-full px-3 py-1 transition-colors',
                  original === option.value ? 'bg-rulebook-accent text-white' : 'text-rulebook-ink hover:bg-rulebook-accent/10',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
