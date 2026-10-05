import { Fragment, type ReactNode } from 'react';
import type { CardLinkTarget } from '@/lib/rulings/build';
import { iconGlyph } from '@/lib/rulings/data';
import { ArmadaIcon } from './ArmadaIcon';

// Renders the API's markdown-ish rulings text: paragraphs, `-` bullets and `>` quotes;
// inline **bold**, *italic* / _italic_, `code`, :icon: shortcodes; squadron keywords
// written in capitals; and links to any other card named in the text.

export interface RulingTextContext {
  linkIndex: Map<string, CardLinkTarget>;
  /** Key of the card being rendered, which never links to itself. */
  selfKey?: string;
}

const KEYWORDS = [
  'AI: ANTI-SQUADRON', 'AI: BATTERY',
  'ADEPT', 'AI', 'ASSAULT', 'BOMBER', 'CLOAK', 'COUNTER', 'DODGE', 'ESCORT', 'GRIT', 'HEAVY',
  'INTEL', 'RELAY', 'ROGUE', 'SCOUT', 'SCREEN', 'SNIPE', 'STRATEGIC', 'SWARM', 'BOOST', 'HUNT',
  'SHIP', 'CREW',
];
const KEYWORD_RE = new RegExp(`\\b(${KEYWORDS.map(escapeRegExp).join('|')})\\b`, 'g');

const INLINE_PATTERNS = [
  { kind: 'strong', re: /\*\*(.+?)\*\*/ },
  { kind: 'em', re: /\*([^*]+)\*/ },
  { kind: 'icon', re: /:([a-z0-9_-]+):/i },
  { kind: 'em', re: /_([^_]+)_/ },
  { kind: 'code', re: /`([^`]+)`/ },
] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const linkPatterns = new WeakMap<Map<string, CardLinkTarget>, RegExp | null>();

/** One alternation of every linkable name, longest first so the most specific wins. */
function linkPattern(index: Map<string, CardLinkTarget>): RegExp | null {
  if (!linkPatterns.has(index)) {
    const names = [...index.keys()].sort((a, b) => b.length - a.length).map(escapeRegExp);
    linkPatterns.set(index, names.length ? new RegExp(`\\b(${names.join('|')})(?!\\w)`, 'gi') : null);
  }
  return linkPatterns.get(index) ?? null;
}

function titleCaseKeyword(keyword: string): string {
  return keyword.split(/(\s+|-)/).map((part) => (/[A-Z]/.test(part) ? part[0] + part.slice(1).toLowerCase() : part)).join('');
}

function renderLinks(text: string, ctx: RulingTextContext, key: string): ReactNode[] {
  const pattern = linkPattern(ctx.linkIndex);
  if (!pattern) return [text];
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const matched = match[0];
    const target = ctx.linkIndex.get(matched.toLowerCase());
    // Lower-case mentions are usually the game term rather than the card
    // ("proximity mines" tokens vs. the Proximity Mines upgrade).
    if (!target || target.key === ctx.selfKey || matched[0] !== matched[0].toUpperCase()) continue;
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <a key={`${key}-l${match.index}`} href={target.href} className="card-ref">
        <em>{matched}</em>
      </a>,
    );
    last = match.index + matched.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderPlain(text: string, ctx: RulingTextContext, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(KEYWORD_RE)) {
    if (match.index > last) nodes.push(...renderLinks(text.slice(last, match.index), ctx, `${key}-${last}`));
    nodes.push(<span key={`${key}-k${match.index}`} className="keyword-name">{titleCaseKeyword(match[0])}</span>);
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(...renderLinks(text.slice(last), ctx, `${key}-${last}`));
  return nodes;
}

export function renderInline(text: string, ctx: RulingTextContext, key = 'i'): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let step = 0;

  while (rest) {
    let best: { kind: (typeof INLINE_PATTERNS)[number]['kind']; match: RegExpExecArray } | null = null;
    for (const pattern of INLINE_PATTERNS) {
      const match = pattern.re.exec(rest);
      if (match && (!best || match.index < best.match.index)) best = { kind: pattern.kind, match };
    }
    if (!best) {
      nodes.push(...renderPlain(rest, ctx, `${key}-${step}`));
      break;
    }

    const { kind, match } = best;
    const childKey = `${key}-${step++}`;
    if (match.index > 0) nodes.push(...renderPlain(rest.slice(0, match.index), ctx, `${childKey}p`));
    const inner = match[1];

    if (kind === 'strong') nodes.push(<strong key={childKey}>{renderInline(inner, ctx, childKey)}</strong>);
    else if (kind === 'em') nodes.push(<em key={childKey}>{renderInline(inner, ctx, childKey)}</em>);
    else if (kind === 'code') nodes.push(<code key={childKey}>{inner}</code>);
    else {
      const glyph = iconGlyph(inner);
      nodes.push(glyph ? <ArmadaIcon key={childKey} glyph={glyph} label={inner.replace(/_/g, ' ')} /> : match[0]);
    }

    rest = rest.slice(match.index + match[0].length);
  }

  return nodes;
}

type Block = { kind: 'p' | 'li' | 'quote'; text: string };

function parseBlocks(text: string): Block[][] {
  // Consecutive lines of the same kind form one group: a list, a quote or a run of
  // paragraphs. A blank line always closes the current group.
  const groups: Block[][] = [];
  let current: Block[] = [];
  const flush = () => {
    if (current.length) groups.push(current);
    current = [];
  };

  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const block: Block = line.startsWith('>')
      ? { kind: 'quote', text: line.replace(/^>\s?/, '') }
      : /^[-*]\s+/.test(line)
        ? { kind: 'li', text: line.replace(/^[-*]\s+/, '') }
        : { kind: 'p', text: line };
    if (current.length && (current[0].kind !== block.kind || block.kind === 'p')) flush();
    current.push(block);
  }
  flush();
  return groups;
}

export function RulingText({ text, ctx }: { text: string; ctx: RulingTextContext }) {
  return (
    <>
      {parseBlocks(text).map((group, index) => {
        const key = `b${index}`;
        if (group[0].kind === 'li') {
          return (
            <ul key={key} className="ruling-list">
              {group.map((block, item) => <li key={item}>{renderInline(block.text, ctx, `${key}-${item}`)}</li>)}
            </ul>
          );
        }
        if (group[0].kind === 'quote') {
          return (
            <blockquote key={key}>
              {group.map((block, item) => <p key={item}>{renderInline(block.text, ctx, `${key}-${item}`)}</p>)}
            </blockquote>
          );
        }
        return (
          <Fragment key={key}>
            {group.map((block, item) => <p key={item}>{renderInline(block.text, ctx, `${key}-${item}`)}</p>)}
          </Fragment>
        );
      })}
    </>
  );
}
