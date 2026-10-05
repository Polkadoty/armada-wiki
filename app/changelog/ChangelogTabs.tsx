import Link from 'next/link';
import styles from './changelog-tabs.module.css';

const TABS = [
  { href: '/changelog', key: 'community', label: 'Community Edition' },
  { href: '/changelog/arm', key: 'arm', label: 'Reference Manual' },
] as const;

export function ChangelogTabs({ active }: { active: (typeof TABS)[number]['key'] }) {
  return (
    <nav className={styles.tabs} aria-label="Changelogs">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`${styles.tab} ${tab.key === active ? styles.active : ''}`}
          aria-current={tab.key === active ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
