import type { ReactNode } from 'react';

/** A plain reading page: one narrow parchment sheet with a rulebook title. */
export function ProseSheet({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <article className="wiki-sheet mx-auto max-w-[920px] sm:!px-12 sm:!py-12">
      <header className="mb-8 text-center">
        <h1 className="wiki-page-title">{title}</h1>
        {intro && <p className="mt-3 text-[16px] text-rulebook-muted">{intro}</p>}
      </header>
      <div className="wiki-prose">{children}</div>
    </article>
  );
}
