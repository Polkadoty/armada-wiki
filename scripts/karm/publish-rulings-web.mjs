#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const shouldRun = process.env.VERCEL === '1' || process.env.GENERATE_RULINGS_WEB === '1';

if (!shouldRun) {
  process.stdout.write('[karm-web] Skipping rulings web publish (set GENERATE_RULINGS_WEB=1 to force).\n');
  process.exit(0);
}

const listBuilderFontsRoot = '/Users/andrew/Documents/GitHub/armada-list-builder/public/fonts';
const targetFontsRoot = path.resolve(repoRoot, 'public/rulings/fonts');
const targetAssetsRoot = path.resolve(repoRoot, 'public/rulings/assets');
const fontCopies = [
  ['icons.woff', 'icons.woff'],
  ['optima.woff', 'optima.woff'],
  ['TeutonFett.woff', 'TeutonFett.woff'],
  ['RevengerLiteBB.woff', 'RevengerLiteBB.woff'],
  ['fighter-keyword.woff', 'fighter-keyword.woff'],
  ['optima-bold.woff', 'optima-bold.woff'],
  ['optima-italic.woff', 'optima-italic.woff'],
];

await mkdir(targetFontsRoot, { recursive: true });
await mkdir(targetAssetsRoot, { recursive: true });
for (const [srcName, dstName] of fontCopies) {
  const src = path.join(listBuilderFontsRoot, srcName);
  const dst = path.join(targetFontsRoot, dstName);
  try {
    await copyFile(src, dst);
    process.stdout.write(`[karm-web] Copied font ${srcName}\n`);
  } catch (error) {
    process.stdout.write(`[karm-web] Missing optional font ${srcName}: ${error.message}\n`);
  }
}

const backgroundCandidates = [
  path.resolve(repoRoot, 'scripts/karm/assets/rulebook-background.webp'),
  '/Users/andrew/Documents/GitHub/armada-list-builder/public/images/rulebook-background.webp',
];
const backgroundTarget = path.join(targetAssetsRoot, 'rulebook-background.webp');
let copiedBackground = false;
for (const candidate of backgroundCandidates) {
  try {
    await copyFile(candidate, backgroundTarget);
    process.stdout.write(`[karm-web] Copied background ${candidate}\n`);
    copiedBackground = true;
    break;
  } catch {
    // try next candidate
  }
}
if (!copiedBackground) {
  process.stdout.write('[karm-web] Background image not found; rulings pages will use solid background.\n');
}

const upgradeTypes = [
  'weapons-team-offensive-retro',
  'commander',
  'officer',
  'weapons-team',
  'offensive-retro',
  'defensive-retro',
  'turbolaser',
  'ion-cannon',
  'ordnance',
  'fleet-support',
  'support-team',
  'experimental-retro',
  'fleet-command',
  'title',
  'superweapon',
];

const jobs = [
  { label: 'all', out: 'public/rulings/index.html', log: 'public/rulings/compile.log', categories: '' },
  { label: 'objectives', out: 'public/rulings/objectives.html', log: 'public/rulings/objectives.log', categories: 'objectives' },
  { label: 'damage-cards', out: 'public/rulings/damage-cards.html', log: 'public/rulings/damage-cards.log', categories: 'damage-cards' },
  { label: 'upgrades', out: 'public/rulings/upgrades.html', log: 'public/rulings/upgrades.log', categories: 'upgrades' },
  { label: 'squadrons', out: 'public/rulings/squadrons.html', log: 'public/rulings/squadrons.log', categories: 'ace-squadrons' },
  ...upgradeTypes.map((type) => ({
    label: `upgrades:${type}`,
    out: `public/rulings/upgrades/${type}.html`,
    log: `public/rulings/upgrades/${type}.log`,
    categories: 'upgrades',
    upgradeTypes: type,
  })),
];

for (const job of jobs) {
  process.stdout.write(`[karm-web] Generating ${job.label} -> ${job.out}\n`);
  await runGenerator(job);
}

async function runGenerator(job) {
  const cmd = process.execPath;
  const args = [
    'scripts/karm/generate-karm-rulings-book.mjs',
    '--dry-run',
    '--config=scripts/karm/config.web.json',
    `--output-html=${job.out}`,
    `--compile-log=${job.log}`,
  ];

  if (job.categories) args.push(`--include-categories=${job.categories}`);
  if (job.upgradeTypes) args.push(`--include-upgrade-types=${job.upgradeTypes}`);

  await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('exit', (code) => {
      if ((code ?? 1) === 0) resolve();
      else reject(new Error(`Generator failed for ${job.label} (exit ${code})`));
    });
  });
}
