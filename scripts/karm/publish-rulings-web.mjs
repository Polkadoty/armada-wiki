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

const repoFontsRoot = path.resolve(repoRoot, 'scripts/karm/fonts');
const listBuilderFontsRoot = '/Users/andrew/Documents/GitHub/armada-list-builder/public/fonts';
const targetFontsRoot = path.resolve(repoRoot, 'public/rulings/fonts');
const targetAssetsRoot = path.resolve(repoRoot, 'public/rulings/assets');
const fontFiles = [
  'icons.woff',
  'optima.woff',
  'TeutonFett.woff',
  'RevengerLiteBB.woff',
  'fighter-keyword.woff',
  'optima-bold.woff',
  'optima-italic.woff',
  'aero-matics-display-regular.woff',
];

await mkdir(targetFontsRoot, { recursive: true });
await mkdir(targetAssetsRoot, { recursive: true });
for (const name of fontFiles) {
  const dst = path.join(targetFontsRoot, name);
  const candidates = [
    path.join(repoFontsRoot, name),
    path.join(listBuilderFontsRoot, name),
  ];
  let copied = false;
  for (const src of candidates) {
    try {
      await copyFile(src, dst);
      process.stdout.write(`[karm-web] Copied font ${name} from ${src}\n`);
      copied = true;
      break;
    } catch {
      // try next candidate
    }
  }
  if (!copied) {
    process.stdout.write(`[karm-web] WARNING: Font ${name} not found in any source\n`);
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

const cardIndexPath = 'public/rulings/card-index.json';

const jobs = [
  { label: 'all', out: 'public/rulings/index.html', log: 'public/rulings/compile.log', categories: '', writeCardIndex: cardIndexPath },
  { label: 'objectives', out: 'public/rulings/objectives.html', log: 'public/rulings/objectives.log', categories: 'objectives', objectiveTypes: 'assault,defense,navigation,skirmish', loadCardIndex: cardIndexPath },
  { label: 'campaign', out: 'public/rulings/campaign.html', log: 'public/rulings/campaign.log', categories: 'objectives', objectiveTypes: 'campaign', loadCardIndex: cardIndexPath },
  { label: 'damage-cards', out: 'public/rulings/damage-cards.html', log: 'public/rulings/damage-cards.log', categories: 'damage-cards', loadCardIndex: cardIndexPath },
  { label: 'upgrades', out: 'public/rulings/upgrades.html', log: 'public/rulings/upgrades.log', categories: 'upgrades', splitUpgradesDir: 'public/rulings/upgrades', loadCardIndex: cardIndexPath },
  { label: 'squadrons', out: 'public/rulings/squadrons.html', log: 'public/rulings/squadrons.log', categories: 'ace-squadrons', loadCardIndex: cardIndexPath },
  { label: 'nexus-upgrades', out: 'public/rulings/nexus-upgrades.html', log: 'public/rulings/nexus-upgrades.log', categories: 'upgrades', nexusOnly: true, loadCardIndex: cardIndexPath },
  { label: 'nexus-squadrons', out: 'public/rulings/nexus-squadrons.html', log: 'public/rulings/nexus-squadrons.log', categories: 'ace-squadrons', nexusOnly: true, loadCardIndex: cardIndexPath },
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
  if (job.objectiveTypes) args.push(`--include-objective-types=${job.objectiveTypes}`);
  if (job.nexusOnly) args.push('--nexus-only');
  if (job.splitUpgradesDir) args.push(`--split-upgrades-dir=${job.splitUpgradesDir}`);
  if (job.writeCardIndex) args.push(`--write-card-index=${job.writeCardIndex}`);
  if (job.loadCardIndex) args.push(`--load-card-index=${job.loadCardIndex}`);

  await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('exit', (code) => {
      if ((code ?? 1) === 0) resolve();
      else reject(new Error(`Generator failed for ${job.label} (exit ${code})`));
    });
  });
}
