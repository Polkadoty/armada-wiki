#!/usr/bin/env node

// Re-applies presentation-only generator changes to the already-published rulings pages.
//
// `generate-karm-rulings-book.mjs` inlines `template.css` and emits the card markup, so
// a styling change would normally require a full regeneration — and that means eight
// jobs against the live, rate-limited card API. For changes that touch presentation
// only, this script rewrites the built pages in place instead. Ruling content, ordering
// and anchors are never touched.
//
// It applies exactly what the generator now produces:
//   1. the current `template.css`, in place of the inlined stylesheet
//   2. `loading="lazy" decoding="async"` on card images (web output only)
//
// The next real generator run reproduces the same bytes from the same sources.
//
//   node scripts/karm/sync-built-pages.mjs [--check]

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const rulingsRoot = path.join(repoRoot, 'public', 'rulings');
const checkOnly = process.argv.includes('--check');

// The inlined stylesheet always starts at template.css's own `:root` block and runs to
// the end of the <style> element. The `--page-background` and @font-face rules emitted
// above it are per-build values, so they must survive untouched.
const CSS_START = ':root {\n  --page-width:';
const CSS_END = '\n    </style>';

const css = (await readFile(path.join(__dirname, 'template.css'), 'utf8')).trim();

function applyCss(html, rel) {
  const start = html.indexOf(CSS_START);
  const end = html.indexOf(CSS_END, start);
  if (start === -1 || end === -1) {
    throw new Error(`${rel}: could not locate the inlined stylesheet`);
  }
  return `${html.slice(0, start)}${css}\n${html.slice(end + 1)}`;
}

// Mirrors the generator's `loadAttrs`: inserted after alt="…" and before any data-*.
function applyImageLoading(html) {
  return html.replace(
    /(<img class="card-image" src="[^"]*" alt="[^"]*")(?! loading=)/g,
    '$1 loading="lazy" decoding="async"'
  );
}

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = (await htmlFiles(rulingsRoot)).sort();
if (files.length === 0) {
  process.stderr.write('[sync] No generated pages found under public/rulings.\n');
  process.exit(1);
}

let changed = 0;
let current = 0;

for (const file of files) {
  const rel = path.relative(repoRoot, file);
  const html = await readFile(file, 'utf8');

  let next;
  try {
    next = applyImageLoading(applyCss(html, rel));
  } catch (error) {
    process.stderr.write(`[sync] FAIL ${error.message}\n`);
    process.exit(1);
  }

  if (next === html) {
    current++;
    continue;
  }

  if (!checkOnly) await writeFile(file, next);
  changed++;
  process.stdout.write(`[sync] ${checkOnly ? 'STALE' : 'updated'} ${rel}\n`);
}

process.stdout.write(
  `[sync] ${changed} ${checkOnly ? 'stale' : 'updated'}, ${current} already current, ${files.length} total.\n`
);

if (checkOnly && changed > 0) process.exit(1);
