import type { Metadata } from 'next';
import {
  fetchCommunityChangelog,
  type ChangelogEntry,
  type ChangelogSection,
} from '@/lib/changelog';
import styles from './changelog.module.css';

export const metadata: Metadata = {
  title: 'Community Change Log | Armada Wiki',
  description: 'A text-based record of additions and errata in the consolidated Armada Community card set.',
};

function formatDate(value?: string): string {
  if (!value) return 'Current Edition';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function CommunityMark() {
  return (
    <span title="Community content">
      <span className={styles.communityMark} aria-hidden="true" />
      <span className="sr-only">Community content</span>
    </span>
  );
}

function PointText({ entry }: { entry: ChangelogEntry }) {
  if (entry.pointChange) {
    const color = entry.pointChange.direction === 'increase' ? '#ef3e36' : '#1680aa';
    return (
      <span className="whitespace-nowrap">
        Points {entry.pointChange.before} to{' '}
        <span style={{ color }}>{entry.pointChange.after}</span>
      </span>
    );
  }
  if (entry.points !== undefined) return <span className="whitespace-nowrap">Points {entry.points}</span>;
  if (entry.status === 'changed') return <span className="whitespace-nowrap text-[#24408f]">Errata</span>;
  return null;
}

function ChangeEntry({ entry }: { entry: ChangelogEntry }) {
  const details = entry.changes.map((change) => change.summary);
  if (entry.status === 'added') details.unshift('Added to the Community set.');
  if (!entry.baselineFound) details.push('Original version unavailable for comparison.');

  return (
    <article className={styles.entry}>
      <div className={styles.entryLine}>
        <span className="min-w-0">
          {entry.name} <CommunityMark />
        </span>
        <span className={styles.leader} aria-hidden="true" />
        <PointText entry={entry} />
      </div>
      {details.length > 0 && (
        <ul className={styles.details}>
          {details.map((detail, index) => <li key={`${entry.id}-${index}`}>{detail}</li>)}
        </ul>
      )}
    </article>
  );
}

function ChangeSection({ section }: { section: ChangelogSection }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{section.title}</h2>
      {section.categories.map((category) => (
        <div key={category.id} className={styles.category}>
          <h3 className={styles.categoryTitle}>{category.title}</h3>
          {category.entries.map((entry) => (
            <ChangeEntry key={`${entry.entityType}-${entry.id}`} entry={entry} />
          ))}
        </div>
      ))}
    </section>
  );
}

export default async function ChangelogPage() {
  const changelog = await fetchCommunityChangelog();
  const sectionPages: ChangelogSection[][] = [];
  for (let index = 0; index < changelog.sections.length; index += 2) {
    sectionPages.push(changelog.sections.slice(index, index + 2));
  }

  return (
    <main className={styles.root}>
      <div className={styles.pages}>
        {changelog.summary.total > 0 ? sectionPages.map((sections, pageIndex) => (
          <article key={pageIndex} className={styles.page} aria-label={`Changelog page ${pageIndex + 1}`}>
            {pageIndex === 0 && (
              <header className={styles.masthead}>
                <div className={styles.starWars}>STAR WARS</div>
                <div className={styles.armada}>ARMADA</div>
                <h1 className={styles.title}>Community Errata Change Log</h1>
                <p className={styles.version}>Updated {formatDate(changelog.lastModified)}</p>
              </header>
            )}
            <div className={`${styles.pageColumns} ${pageIndex === 0 ? styles.firstPageColumns : ''}`}>
              {sections.map((section) => (
                <ChangeSection key={section.id} section={section} />
              ))}
            </div>
            <span className={styles.pageNumber} aria-hidden="true">{pageIndex + 1}</span>
          </article>
        )) : (
          <article className={styles.page}>
            <p className="px-10 py-24 text-center">Community data is temporarily unavailable.</p>
          </article>
        )}
      </div>
    </main>
  );
}
