#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const src = process.argv[2] || '/Users/andrew/Documents/GitHub/armada-list-builder/src/constants/icons.ts';
const out = path.resolve(repoRoot, 'scripts/karm/icon-map.json');

const raw = await readFile(src, 'utf8');
const iconMap = {};
for (const m of raw.matchAll(/([a-zA-Z0-9_]+)\s*:\s*'\\u([0-9A-Fa-f]{4})'/g)) {
  iconMap[m[1].toLowerCase()] = String.fromCharCode(parseInt(m[2], 16));
}

await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(iconMap, null, 2) + '\n', 'utf8');
process.stdout.write(`[karm-pdf] Synced ${Object.keys(iconMap).length} icons to ${out}\n`);
