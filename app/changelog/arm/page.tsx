import type { Metadata } from 'next';
import { Fragment, type ReactNode } from 'react';
import {
  ARM_CHANGELOG_SOURCE,
  ARM_RELEASES,
  type ArmBlock,
  type ArmOutlineItem,
  type ArmRelease,
} from '@/lib/armChangelog';
import { ChangelogTabs } from '../ChangelogTabs';
import styles from './arm-changelog.module.css';

export const metadata: Metadata = {
  title: 'Reference Manual Changelog | Armada Wiki',
  description: 'Every published revision of the Armada Reference Manual (ARM), with added and removed text marked.',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

// Earliest match wins; ties go to the first pattern listed. Every pattern but the
// footnote and email wraps inner text that is itself parsed again, so markup nests.
const INLINE_PATTERNS = [
  { kind: 'added', re: /\{\+([\s\S]+?)\+\}/ },
  { kind: 'removed', re: /\{-([\s\S]+?)-\}/ },
  { kind: 'bold', re: /\*\*([\s\S]+?)\*\*/ },
  { kind: 'italic', re: /_([^_]+?)_/ },
  { kind: 'footnote', re: /\^\[(\d+)\]/ },
  { kind: 'email', re: /([\w.+-]+@[\w-]+\.[\w.]+[a-z])/ },
] as const;

function renderInline(text: string, release: ArmRelease, key = 'i'): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let index = 0;

  while (rest) {
    let best: { kind: (typeof INLINE_PATTERNS)[number]['kind']; match: RegExpExecArray } | null = null;
    for (const pattern of INLINE_PATTERNS) {
      const match = pattern.re.exec(rest);
      if (match && (!best || match.index < best.match.index)) best = { kind: pattern.kind, match };
    }
    if (!best) {
      nodes.push(rest);
      break;
    }

    const { kind, match } = best;
    if (match.index > 0) nodes.push(rest.slice(0, match.index));
    const childKey = `${key}-${index++}`;
    const inner = match[1];

    if (kind === 'added') {
      nodes.push(<ins key={childKey} className={styles.added}>{renderInline(inner, release, childKey)}</ins>);
    } else if (kind === 'removed') {
      nodes.push(<del key={childKey} className={styles.removed}>{renderInline(inner, release, childKey)}</del>);
    } else if (kind === 'bold') {
      nodes.push(<strong key={childKey}>{renderInline(inner, release, childKey)}</strong>);
    } else if (kind === 'italic') {
      nodes.push(<em key={childKey}>{renderInline(inner, release, childKey)}</em>);
    } else if (kind === 'footnote') {
      nodes.push(
        <sup key={childKey} className={styles.footnoteRef}>
          <a href={`#${release.id}-fn-${inner}`} id={`${release.id}-fnref-${inner}`} aria-label={`Footnote ${inner}`}>
            {inner}
          </a>
        </sup>,
      );
    } else {
      nodes.push(<a key={childKey} href={`mailto:${inner}`}>{inner}</a>);
    }

    rest = rest.slice(match.index + match[0].length);
  }

  return nodes;
}

function Outline({ items, release }: { items: ArmOutlineItem[]; release: ArmRelease }) {
  return (
    <ol className={styles.outline}>
      {items.map((item, index) => (
        <li key={index}>
          <span className={styles.outlineMarker}>{renderInline(item.marker, release)}</span>
          <div>
            {item.text && <p>{renderInline(item.text, release)}</p>}
            {item.children && <Outline items={item.children} release={release} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Block({ block, release }: { block: ArmBlock; release: ArmRelease }) {
  switch (block.kind) {
    case 'heading':
      return <h3 className={styles.blockHeading}>{block.text}</h3>;
    case 'paragraph':
      return <p className={styles.paragraph}>{renderInline(block.text, release)}</p>;
    case 'bullets':
      return (
        <ul className={styles.bullets}>
          {block.items.map((item, index) => <li key={index}>{renderInline(item, release)}</li>)}
        </ul>
      );
    case 'outline':
      return <Outline items={block.items} release={release} />;
    case 'card':
      return (
        <section className={styles.card}>
          <h4 className={styles.cardName}>{block.name}</h4>
          {block.sections.map((section, index) => (
            <div key={index} className={styles.cardSection}>
              <h5 className={styles.cardLabel}>{renderInline(section.label, release)}</h5>
              {section.paragraphs?.map((text, paragraphIndex) => (
                <p key={paragraphIndex} className={section.label === 'Card Text' ? styles.cardText : undefined}>
                  {renderInline(text, release)}
                </p>
              ))}
              {section.bullets && (
                <ul className={styles.bullets}>
                  {section.bullets.map((item, bulletIndex) => <li key={bulletIndex}>{renderInline(item, release)}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      );
  }
}

function Release({ release }: { release: ArmRelease }) {
  return (
    <article className={styles.release} id={release.id} aria-labelledby={`${release.id}-title`}>
      <header className={styles.releaseHeader}>
        <h2 id={`${release.id}-title`} className={styles.releaseTitle}>
          {release.from} <span aria-label="to">→</span> {release.to}
        </h2>
        <p className={styles.releaseDate}>
          <time dateTime={release.date}>{formatDate(release.date)}</time>
        </p>
      </header>

      {release.intro?.map((block, index) => <Block key={`intro-${index}`} block={block} release={release} />)}
      {release.blocks?.map((block, index) => <Block key={`block-${index}`} block={block} release={release} />)}

      {release.entries && (
        <ol className={styles.entries}>
          {release.entries.map((entry) => (
            <li key={entry.numeral} className={styles.entry} id={`${release.id}-${entry.numeral.toLowerCase()}`}>
              <span className={styles.numeral}>{entry.numeral}.</span>
              <div className={styles.entryBody}>
                <p className={styles.paragraph}>{renderInline(entry.summary, release)}</p>
                {entry.blocks?.map((block, index) => <Block key={index} block={block} release={release} />)}
              </div>
            </li>
          ))}
        </ol>
      )}

      {release.footnotes && (
        <footer className={styles.footnotes}>
          <ol>
            {release.footnotes.map((note) => (
              <li key={note.id} id={`${release.id}-fn-${note.id}`} value={note.id}>
                {renderInline(note.text, release)}{' '}
                <a href={`#${release.id}-fnref-${note.id}`} className={styles.backref} aria-label={`Back to reference ${note.id}`}>
                  ↩
                </a>
              </li>
            ))}
          </ol>
        </footer>
      )}
    </article>
  );
}

export default function ArmChangelogPage() {
  return (
    <main className={styles.root}>
      <div className={styles.sheet}>
        <header className={styles.masthead}>
          <p className={styles.kicker}>Armada</p>
          <h1 className={styles.title}>{ARM_CHANGELOG_SOURCE.title}</h1>
          <p className={styles.subtitle}>Changelog</p>
          <ChangelogTabs active="arm" />
        </header>

        <div className={styles.toolbar}>
          <p className={styles.legend}>
            <ins className={styles.added}>Added text</ins>
            <del className={styles.removed}>Removed text</del>
          </p>
          <nav className={styles.releaseNav} aria-label="Revisions">
            {ARM_RELEASES.map((release) => (
              <a key={release.id} href={`#${release.id}`}>{release.to}</a>
            ))}
            <a href={ARM_CHANGELOG_SOURCE.fullDocumentUrl} target="_blank" rel="noreferrer">
              Full ARM {ARM_CHANGELOG_SOURCE.currentVersion} (PDF)
            </a>
          </nav>
        </div>

        {ARM_RELEASES.map((release, index) => (
          <Fragment key={release.id}>
            {index > 0 && <hr className={styles.divider} />}
            <Release release={release} />
          </Fragment>
        ))}
      </div>
    </main>
  );
}
