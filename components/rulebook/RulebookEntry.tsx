/* eslint-disable @next/next/no-img-element -- diagrams come from the card image host */
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { Link2 } from 'lucide-react';
import { renderInline, type RulingTextContext } from '@/components/rulings/RulingText';
import { RULEBOOK_IMAGE_BASE, type RulebookBlock, type RulebookEntry as Entry } from '@/lib/rulebook';
import { cn } from '@/lib/utils';

type ListBlock = Extract<RulebookBlock, { type: 'bullet' | 'step' }>;
interface ListNode {
  block: ListBlock;
  /** Further paragraphs of the same item. */
  more: ListBlock[];
  children: ListNode[];
}

// Bullets carry the PDF's marker depth (• then ◊ then +) and numbered steps sit at
// depth 1, so a run of list blocks folds into a tree by depth.
const depthOf = (block: ListBlock) => (block.type === 'step' ? 1 : block.level);

function buildTree(blocks: ListBlock[]): ListNode[] {
  const roots: ListNode[] = [];
  const stack: ListNode[] = [];
  for (const block of blocks) {
    const owner = block.continued ? [...stack].reverse().find((node) => depthOf(node.block) === depthOf(block)) : undefined;
    if (owner) {
      owner.more.push(block);
      continue;
    }
    const node: ListNode = { block, more: [], children: [] };
    while (stack.length && depthOf(stack[stack.length - 1].block) >= depthOf(block)) stack.pop();
    (stack.length ? stack[stack.length - 1].children : roots).push(node);
    stack.push(node);
  }
  return roots;
}

/** Text new in this version of the rules reference is printed in blue; here it gets a rule in the margin. */
function changedProps(changed?: boolean) {
  return changed ? { 'data-changed': '', title: 'New or changed in this version' } : {};
}

/** Marks text an erratum replaced; `source` names the erratum. */
function ErrataTag({ source }: { source?: string }) {
  if (!source) return null;
  return <span className="rulebook-errata" title={source}>Errata</span>;
}

function Table({ block, ctx, keyPrefix }: { block: Extract<RulebookBlock, { type: 'table' }>; ctx: RulingTextContext; keyPrefix: string }) {
  return (
    <div className="overflow-x-auto rounded-md border border-rulebook-accent/15 bg-white/40">
      <table className="w-full text-left text-[15px]">
        <thead>
          <tr className="border-b border-rulebook-accent/15 font-aero text-[11px] uppercase tracking-[0.12em] text-rulebook-accent">
            {block.header.map((cell, index) => <th key={index} scope="col" className="px-3 py-2">{renderInline(cell, ctx, `${keyPrefix}h${index}`)}</th>)}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-rulebook-accent/10 align-top last:border-0">
              {row.map((cell, index) => (
                <td key={index} className="px-3 py-2">
                  {cell.split('\n').map((line, part) => (
                    <Fragment key={part}>
                      {part > 0 && <br />}
                      {renderInline(line, ctx, `${keyPrefix}r${rowIndex}c${index}p${part}`)}
                    </Fragment>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {block.errata && <p className="px-3 py-1.5 text-xs text-rulebook-muted"><ErrataTag source={block.errata} /> {block.errata}</p>}
    </div>
  );
}

// Spelled out so Tailwind keeps these component classes.
const BULLET_CLASSES = ['rulebook-bullets-1', 'rulebook-bullets-2', 'rulebook-bullets-3'];

/** Numbered steps and bullets at the same depth become separate lists, such as the notes after an attack's steps. */
function Lists({ nodes, ctx, keyPrefix }: { nodes: ListNode[]; ctx: RulingTextContext; keyPrefix: string }) {
  const runs: ListNode[][] = [];
  for (const node of nodes) {
    const last = runs.at(-1);
    if (last && last[0].block.type === node.block.type) last.push(node);
    else runs.push([node]);
  }
  return <>{runs.map((run, index) => <List key={index} nodes={run} ctx={ctx} keyPrefix={`${keyPrefix}r${index}`} />)}</>;
}

function List({ nodes, ctx, keyPrefix }: { nodes: ListNode[]; ctx: RulingTextContext; keyPrefix: string }) {
  const ordered = nodes[0]?.block.type === 'step';
  const depth = depthOf(nodes[0].block);
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={cn('rulebook-list', ordered ? 'rulebook-steps' : BULLET_CLASSES[Math.min(depth, 3) - 1])}>
      {nodes.map((node, index) => (
        <li
          key={index}
          value={node.block.type === 'step' ? node.block.number : undefined}
          {...changedProps(node.block.changed)}
        >
          {renderInline(node.block.text, ctx, `${keyPrefix}-${index}`)}
          <ErrataTag source={node.block.errata} />
          {node.more.map((block, more) => (
            <p key={more} className="mt-1.5" {...changedProps(block.changed)}>{renderInline(block.text, ctx, `${keyPrefix}-${index}m${more}`)}</p>
          ))}
          {node.children.length > 0 && <Lists nodes={node.children} ctx={ctx} keyPrefix={`${keyPrefix}-${index}`} />}
        </li>
      ))}
    </Tag>
  );
}

function Figure({ block, ctx, keyPrefix }: { block: Extract<RulebookBlock, { type: 'figure' }>; ctx: RulingTextContext; keyPrefix: string }) {
  return (
    <figure className="rounded-md border border-rulebook-accent/15 bg-white/40 p-3">
      <figcaption className="mb-2 font-heading text-xl" style={{ fontVariant: 'small-caps' }}>{block.title}</figcaption>
      {block.image && (
        <a href={`${RULEBOOK_IMAGE_BASE}${block.image}`} target="_blank" rel="noreferrer" title="Open the full-size diagram">
          <img
            src={`${RULEBOOK_IMAGE_BASE}${block.image}`}
            alt={`${block.title} diagram`}
            width={block.width}
            height={block.height}
            loading="lazy"
            decoding="async"
            className="mx-auto h-auto max-h-[720px] w-auto max-w-full rounded"
          />
        </a>
      )}
      {block.caption.length > 0 && (
        <details className="mt-2 text-[15px] text-rulebook-muted">
          <summary className="cursor-pointer text-sm text-rulebook-accent">Diagram text</summary>
          <div className="rulebook-prose mt-1">
            {block.caption.map((line, index) => <p key={index}>{renderInline(line, ctx, `${keyPrefix}-c${index}`)}</p>)}
          </div>
        </details>
      )}
    </figure>
  );
}

export function RulebookBlocks({ blocks, ctx, keyPrefix = 'b' }: { blocks: RulebookBlock[]; ctx: RulingTextContext; keyPrefix?: string }) {
  const out: ReactNode[] = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    const key = `${keyPrefix}${index}`;
    if (block.type === 'bullet' || block.type === 'step') {
      const run: ListBlock[] = [];
      while (index < blocks.length && (blocks[index].type === 'bullet' || blocks[index].type === 'step')) run.push(blocks[index++] as ListBlock);
      index--;
      out.push(<Lists key={key} nodes={buildTree(run)} ctx={ctx} keyPrefix={key} />);
    } else if (block.type === 'heading') {
      out.push(<h4 key={key} className="ruling-label !mt-4">{block.text}</h4>);
    } else if (block.type === 'figure') {
      out.push(<Figure key={key} block={block} ctx={ctx} keyPrefix={key} />);
    } else if (block.type === 'table') {
      out.push(<Table key={key} block={block} ctx={ctx} keyPrefix={key} />);
    } else if (block.type === 'question' || block.type === 'answer') {
      out.push(
        <p key={key} className={cn(block.type === 'question' ? 'rulebook-question' : 'rulebook-answer')} {...changedProps(block.changed)}>
          {renderInline(block.text.replace(/^(\*\*)?([QA]):(\*\*)?\s*/, ''), ctx, key)}
          <ErrataTag source={block.errata} />
        </p>,
      );
    } else {
      out.push(<p key={key} {...changedProps(block.changed)}>{renderInline(block.text, ctx, key)}<ErrataTag source={block.errata} /></p>);
    }
  }
  return <div className="rulebook-prose rulebook-blocks">{out}</div>;
}

export function RulebookEntry({
  entry,
  ctx,
  topicHref,
}: {
  entry: Entry;
  ctx: RulingTextContext;
  /** Link for a "Related Topics" name, when it names a glossary entry. */
  topicHref: (title: string) => string | undefined;
}) {
  return (
    <article id={entry.id} className={cn('group/card scroll-mt-20', entry.sidebar && 'rulebook-sidebar')}>
      <h3 className="ruling-card-title">
        <span>{entry.title}</span>
        <a href={`#${entry.id}`} aria-label={`Link to ${entry.title}`} title="Link to this entry" className="ruling-copy-link">
          <Link2 className="size-4" aria-hidden />
        </a>
      </h3>
      <div className="mt-3">
        <RulebookBlocks blocks={entry.blocks} ctx={ctx} keyPrefix={entry.id} />
      </div>
      {entry.related && entry.related.length > 0 && (
        <p className="mt-3 text-[15px]">
          <span className="font-bold">Related Topics: </span>
          {entry.related.map((topic, index) => {
            const href = topicHref(topic);
            return (
              <Fragment key={topic}>
                {index > 0 && ', '}
                {href ? <Link href={href} className="card-ref">{topic}</Link> : topic}
              </Fragment>
            );
          })}
        </p>
      )}
    </article>
  );
}
