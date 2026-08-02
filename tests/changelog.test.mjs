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

test('describes defense-token and squadron-keyword changes naturally', () => {
  const community = emptySource();
  community.squadrons['test-pilot-errata-community'] = {
    type: 'squadron',
    faction: 'rebel',
    name: 'Test Squadron',
    'ace-name': 'Test Pilot',
    points: 18,
    tokens: { def_brace: 1, def_scatter: 1 },
    abilities: { escort: false, rogue: true },
  };

  const core = emptySource();
  core.squadrons['test-pilot'] = {
    type: 'squadron',
    faction: 'rebel',
    name: 'Test Squadron',
    'ace-name': 'Test Pilot',
    points: 18,
    tokens: { def_brace: 2, def_scatter: 0 },
    abilities: { escort: true, rogue: false },
  };

  const changelog = buildCommunityChangelog({
    community,
    core,
    arc: emptySource(),
    legacy: emptySource(),
  });
  const summaries = allEntries(changelog)[0].changes.map((change) => change.summary);

  assert.ok(summaries.includes('Loses 1 brace token.'));
  assert.ok(summaries.includes('Gains 1 scatter token.'));
  assert.ok(summaries.includes('Loses Escort Keyword.'));
  assert.ok(summaries.includes('Gains Rogue Keyword.'));
});

test('describes modification, objective scoring, and full card-text replacements', () => {
  const oldCardText = 'This is the original card wording with several clauses and timing instructions. '.repeat(4).trim();
  const newCardText = 'This is the complete replacement card wording with all of its new clauses and timing instructions. '.repeat(4).trim();
  const community = emptySource();
  community.upgrades['test-upgrade-errata-community'] = {
    type: 'offensive-retro',
    faction: [''],
    name: 'Test Upgrade',
    points: 3,
    modification: false,
    ability: newCardText,
  };
  community.objectives['test-objective-errata-community'] = {
    type: 'assault',
    name: 'Test Objective',
    victory_tokens: true,
  };

  const core = emptySource();
  core.upgrades['test-upgrade'] = {
    type: 'offensive-retro',
    faction: [''],
    name: 'Test Upgrade',
    points: 3,
    modification: true,
    ability: oldCardText,
  };
  core.objectives['test-objective'] = {
    type: 'assault',
    name: 'Test Objective',
    victory_tokens: false,
  };

  const changelog = buildCommunityChangelog({
    community,
    core,
    arc: emptySource(),
    legacy: emptySource(),
  });
  const changes = allEntries(changelog).flatMap((entry) => entry.changes);

  assert.equal(changes.find((change) => change.path === 'modification')?.summary, 'Loses Modification.');
  assert.equal(
    changes.find((change) => change.path === 'victory_tokens')?.summary,
    'Objective gains victory token scoring.'
  );
  assert.equal(
    changes.find((change) => change.path === 'ability')?.summary,
    `Updated card text: “${newCardText}”`
  );
});

test('summarizes newly added Community entities by type', () => {
  const community = emptySource();
  community.upgrades['new-upgrade-community'] = {
    type: 'officer',
    faction: ['rebel'],
    name: 'New Upgrade',
    points: 4,
    ability: 'Exhaust this card to resolve its **complete effect**.',
  };
  community.squadrons['new-squadron-community'] = {
    type: 'squadron',
    faction: 'rebel',
    name: 'New Squadron',
    points: 12,
    abilities: { bomber: true, counter: 2, rogue: false, 'ai-battery': 0 },
  };
  community.ships['new-chassis'] = {
    type: 'chassis',
    size: 'large',
    models: {
      'new-ship-community': {
        type: 'ship',
        faction: 'rebel',
        name: 'New Ship',
        points: 70,
      },
    },
  };

  const changelog = buildCommunityChangelog({
    community,
    core: emptySource(),
    arc: emptySource(),
    legacy: emptySource(),
  });
  const entries = allEntries(changelog);

  assert.deepEqual(
    entries.find((entry) => entry.name === 'New Upgrade')?.additionDetails,
    ['Card text: “Exhaust this card to resolve its complete effect.”']
  );
  assert.deepEqual(
    entries.find((entry) => entry.name === 'New Squadron')?.additionDetails,
    ['Keywords: Bomber, Counter 2.']
  );
  assert.deepEqual(
    entries.find((entry) => entry.name === 'New Ship')?.additionDetails,
    ['Ship size: Large.']
  );
});
