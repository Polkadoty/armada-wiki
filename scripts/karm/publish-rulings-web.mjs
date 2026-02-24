#!/usr/bin/env node

import { spawn } from 'node:child_process';

const shouldRun = process.env.VERCEL === '1' || process.env.GENERATE_RULINGS_WEB === '1';

if (!shouldRun) {
  process.stdout.write('[karm-web] Skipping rulings web publish (set GENERATE_RULINGS_WEB=1 to force).\n');
  process.exit(0);
}

const cmd = process.execPath;
const args = [
  'scripts/karm/generate-karm-rulings-book.mjs',
  '--dry-run',
  '--config=scripts/karm/config.web.json',
];

process.stdout.write('[karm-web] Generating /public/rulings/index.html from live API data...\n');
const child = spawn(cmd, args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 1));
