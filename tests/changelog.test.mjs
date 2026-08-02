import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCommunityChangelog } from '../lib/changelog.ts';

const emptySource = () => ({ ships: {}, squadrons: {}, upgrades: {}, objectives: {} });

function allEntries(changelog) {
  return changelog.sections.flatMap((section) =>
    section.categories.flatMap((category) => category.entries)
  );
}

test('renders only Community entities while inheriting missing ARC rulings', () => {
  const community = emptySource();
  community.upgrades['admiral-example-commander-errata-community'] = {
    type: 'commander',
    faction: ['empire'],
    name: 'Admiral Example',
    points: 22,
    ability: 'New card text.',
    rules: [{ type: 'timing', source: 'ARC', date: '2026-01-01', version: '1.0', text: 'Existing ruling.' }],
  };

  const core = emptySource();
  core.upgrades['admiral-example-commander'] = {
    type: 'commander',
    faction: ['empire'],
    name: 'Admiral Example',
    points: 25,
    ability: 'Old card text.',
  };

  const arc = emptySource();
  arc.upgrades['admiral-example-commander-errata-arc'] = {
    type: 'commander',
    faction: ['empire'],
    name: 'Admiral Example',
    points: 22,
    ability: 'New card text.',
    rules: [
      { type: 'timing', source: 'ARC', date: '2026-01-01', version: '1.0', text: 'Existing ruling.' },
      { type: 'clarification', source: 'ARC', date: '2026-02-01', version: '1.1', text: 'Recovered ruling.' },
    ],
  };

  const changelog = buildCommunityChangelog({
    community,
    core,
    arc,
    legacy: emptySource(),
  });
  const entries = allEntries(changelog);

  assert.equal(entries.length, 1, 'ARC records must never become rendered entries');
  assert.equal(entries[0].id, 'admiral-example-commander-errata-community');
  assert.deepEqual(entries[0].pointChange, { before: 25, after: 22, direction: 'decrease' });
  assert.equal(entries[0].changes.find((change) => change.path === 'ability')?.after, 'New card text.');
  assert.equal(entries[0].inheritedRulingCount, 1);
  assert.equal(entries[0].rulingCount, 2);
  assert.equal(changelog.summary.inheritedRulings, 1);
});

test('uses a non-errata Legacy record as a baseline without rendering it', () => {
  const community = emptySource();
  community.upgrades['jedi-example-commander-errata-community'] = {
    type: 'commander',
    faction: ['republic'],
    name: 'Jedi Example',
    points: 27,
    ability: 'Same ability.',
  };

  const legacy = emptySource();
  legacy.upgrades['jedi-example-commander-legacy'] = {
    type: 'commander',
    faction: ['republic'],
    name: 'Jedi Example',
    points: 30,
    ability: 'Same ability.',
  };

  const changelog = buildCommunityChangelog({
    community,
    core: emptySource(),
    arc: emptySource(),
    legacy,
  });
  const entries = allEntries(changelog);

  assert.equal(entries.length, 1);
  assert.equal(entries[0].baselineFound, true);
  assert.deepEqual(entries[0].pointChange, { before: 30, after: 27, direction: 'decrease' });
  assert.equal(changelog.summary.missingBaselines, 0);
});

test('groups additions by faction and sends universal upgrades to Upgrade Cards', () => {
  const community = emptySource();
  community.squadrons['new-ace-community'] = {
    type: 'squadron',
    faction: 'rebel',
    name: 'X-wing Squadron',
    'ace-name': 'New Ace',
    points: 18,
  };
  community.upgrades['universal-upgrade-community'] = {
    type: 'support-team',
    faction: [''],
    name: 'Universal Upgrade',
    points: 3,
  };

  const changelog = buildCommunityChangelog({
    community,
    core: emptySource(),
    arc: emptySource(),
    legacy: emptySource(),
  });

  assert.equal(changelog.sections.find((section) => section.id === 'rebel')?.categories[0].entries[0].name, 'New Ace');
  assert.equal(changelog.sections.find((section) => section.id === 'upgrade-cards')?.categories[0].entries[0].name, 'Universal Upgrade');
  assert.equal(changelog.summary.added, 2);
});
