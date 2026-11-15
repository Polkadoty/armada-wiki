import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addRulebookClarifications,
  applyCommunityLayer,
  baselineKey,
  buildCardLinkIndex,
  buildCardSections,
  buildRulingCards,
  normalizeRules,
  sameRuling,
} from '../lib/rulings/build.ts';

const empty = { upgrades: {}, squadrons: {}, objectives: {} };

function input({ core = {}, community = {}, nexus = {} } = {}) {
  return {
    core: { ...empty, damageCards: {}, ...core },
    community: { ...empty, ...community },
    nexus: { upgrades: {}, squadrons: {}, ...nexus },
  };
}

const rule = (text, type = 'clarification') => ({ type, text });

test('baselineKey strips the community suffix and then an errata marker', () => {
  assert.equal(baselineKey('admiral-screed-commander-errata-community'), 'admiral-screed-commander');
  assert.equal(baselineKey('admiral-coburn-commander-community'), 'admiral-coburn-commander');
  assert.equal(baselineKey('hera-syndulla-commander-nexus'), 'hera-syndulla-commander');
});

test('a Community erratum replaces its core card instead of appearing beside it', () => {
  const cards = buildRulingCards(input({
    core: {
      upgrades: {
        upgrades: {
          'admiral-screed-commander': { name: 'Admiral Screed', type: 'commander', faction: ['empire'], points: 24, rules: [rule('Core ruling.')] },
        },
      },
    },
    community: {
      upgrades: {
        upgrades: {
          'admiral-screed-commander-errata-community': { name: 'Admiral Screed', type: 'commander', faction: ['empire'], points: 26, rules: [rule('Community ruling.')] },
          'admiral-coburn-commander-community': { name: 'Admiral Coburn', type: 'commander', faction: ['republic'], points: 20 },
        },
      },
    },
  }));

  const screeds = cards.filter((card) => card.name === 'Admiral Screed');
  assert.equal(screeds.length, 1);
  assert.equal(screeds[0].source, 'community');
  assert.equal(screeds[0].points, 26);
  assert.deepEqual(screeds[0].rules.map((r) => r.text), ['Community ruling.']);
  assert.equal(screeds[0].anchorId, 'admiral-screed-commander', 'anchors stay those of the card name, not the API key');

  const coburn = cards.find((card) => card.name === 'Admiral Coburn');
  assert.equal(coburn.source, 'community');
});

test('a Community erratum without rulings of its own inherits its core card’s', () => {
  const core = buildRulingCards(input({
    core: { upgrades: { upgrades: { 'nav-team': { name: 'Nav Team', type: 'support-team', rules: [rule('Kept ruling.')] } } } },
  }));
  const community = buildRulingCards(input({
    core: { upgrades: { upgrades: { 'nav-team-errata-community': { name: 'Nav Team', type: 'support-team' } } } },
  })).map((card) => ({ ...card, source: 'community' }));

  const [merged] = applyCommunityLayer(core, community);
  assert.equal(merged.source, 'community');
  assert.deepEqual(merged.rules.map((r) => r.text), ['Kept ruling.']);
});

test('same-named cards of different types or chassis are all kept', () => {
  const cards = buildRulingCards(input({
    core: {
      upgrades: {
        upgrades: {
          'leia-organa-commander': { name: 'Leia Organa', type: 'commander', faction: ['rebel'] },
          'leia-organa-officer': { name: 'Leia Organa', type: 'officer', faction: ['rebel'] },
        },
      },
      squadrons: {
        squadrons: {
          'darth-vader-tie-advanced-squadron': { 'ace-name': 'Darth Vader', ace: true, faction: 'empire' },
          'darth-vader-tie-defender-squadron': { 'ace-name': 'Darth Vader', ace: true, faction: 'empire' },
          'tie-fighter-squadron': { name: 'TIE Fighter Squadron', ace: false, faction: 'empire' },
        },
      },
    },
  }));

  assert.deepEqual(
    cards.map((card) => card.anchorId).sort(),
    ['darth-vader-squadron', 'darth-vader-squadron-2', 'leia-organa-commander', 'leia-organa-officer'],
  );
});

test('nexus cards stay in their own categories and keep their plain anchors', () => {
  const cards = buildRulingCards(input({
    core: { upgrades: { upgrades: { 'hera-syndulla-commander': { name: 'Hera Syndulla', type: 'commander' } } } },
    nexus: { upgrades: { upgrades: { 'hera-syndulla-commander-nexus': { name: 'Hera Syndulla', type: 'commander' } } } },
  }));
  assert.deepEqual(cards.map((card) => [card.category, card.anchorId]), [
    ['upgrades', 'hera-syndulla-commander'],
    ['nexus-upgrades', 'hera-syndulla-commander'],
  ]);

  const index = buildCardLinkIndex(cards, (card) => (card.source === 'nexus' ? '/rulings/nexus-upgrades' : '/rulings/upgrades'));
  assert.equal(index.get('hera syndulla (commander)').href, '/rulings/upgrades#hera-syndulla-commander');
});

test('rules group by section, drop exact repeats, and fall back to plain clarifications', () => {
  const rules = normalizeRules([
    rule('Timing text.', 'timing'),
    rule('First.'),
    rule('First.'),
    { type: 'upgrade', text: 'Works with Foresight.' },
  ]);
  assert.deepEqual(rules.map((r) => [r.section, r.text]), [
    ['timing', 'Timing text.'],
    ['clarifications', 'First.'],
    ['upgrade_interactions', 'Works with Foresight.'],
  ]);
  assert.deepEqual(normalizeRules(undefined, 'Legacy text.').map((r) => r.section), ['clarifications']);
});

test('card sections share footnotes per source and letter explanations', () => {
  const sections = buildCardSections({
    cardText: 'Card text.',
    rules: [
      { section: 'timing', text: 'When.', source: 'ACE', date: '2025-07-11', version: 'ARM 1.03', defunct: false, explanation: '' },
      { section: 'clarifications', text: 'A.', source: 'ACE', date: '2025-07-11', version: 'ARM 1.03', defunct: false, explanation: 'Why.' },
      { section: 'clarifications', text: 'B.', source: '', date: '', version: '', defunct: true, explanation: 'Superseded.' },
    ],
  });
  assert.equal(sections.cardText, 'Card text.');
  assert.equal(sections.timing[0].footnote, 1);
  assert.deepEqual(sections.footnotes, ['ACE | 2025-07-11 | ARM 1.03']);
  assert.deepEqual(sections.notes, ['Why.'], 'defunct rulings explain themselves inline, not as notes');
  assert.deepEqual(sections.sections.map((s) => s.label), ['Clarifications']);
});

test('only unambiguous multi-word names link bare; every card links by "Name (Type)"', () => {
  const cards = buildRulingCards(input({
    core: {
      upgrades: {
        upgrades: {
          'leia-organa-commander': { name: 'Leia Organa', type: 'commander' },
          'leia-organa-officer': { name: 'Leia Organa', type: 'officer' },
          'engine-techs': { name: 'Engine Techs', type: 'support-team' },
          'resolve': { name: 'Resolve', type: 'title' },
        },
      },
    },
  }));
  const index = buildCardLinkIndex(cards, () => '/rulings/upgrades', { 'Engine Tech': 'Engine Techs' });

  assert.equal(index.has('leia organa'), false);
  assert.equal(index.get('leia organa (officer)').href, '/rulings/upgrades#leia-organa-officer');
  assert.equal(index.get('engine techs').href, '/rulings/upgrades#engine-techs-support-team');
  assert.equal(index.get('engine tech').href, '/rulings/upgrades#engine-techs-support-team');
  assert.equal(index.has('resolve'), false);
  assert.ok(index.has('resolve (title)'));
});

const RRG = { source: 'Rules Reference', date: '2025-01-10', version: '1.6.0' };

test('rulebook clarifications are added to the card they name, with the Rules Reference as their source', () => {
  const cards = buildRulingCards(input({
    core: {
      upgrades: {
        upgrades: {
          'admiral-ozzel-commander': { name: 'Admiral Ozzel', type: 'commander', faction: ['empire'], rules: [] },
          'admiral-ozzel-officer': { name: 'Admiral Ozzel', type: 'officer', faction: ['empire'], rules: [] },
          'chart-officer': { name: 'Chart Officer', type: 'officer', faction: ['empire'], rules: [rule('If a ship with this upgrade card overlaps more than one obstacle, it can ignore the effects of each obstacle.')] },
        },
      },
      squadrons: { squadrons: { 'whisper-tie-phantom': { 'ace-name': '"Whisper"', ace: true, faction: 'empire', rules: [] } } },
    },
  }));
  const { cards: merged, unmatched } = addRulebookClarifications(cards, [
    { group: 'Upgrade Cards', title: 'Admiral Ozzel', rules: [{ section: 'clarifications', text: 'Ozzel ruling.' }] },
    { group: 'Upgrade Cards', title: 'Chart Officer', rules: [
      { section: 'clarifications', text: 'If a ship with this card equipped overlaps more than one obstacle, it can ignore the effects of each obstacle.' },
      { section: 'clarifications', text: 'A new Chart Officer ruling.' },
    ] },
    { group: 'Squadron Cards', title: 'Whisper', rules: [{ section: 'clarifications', text: 'Whisper ruling.' }] },
    { group: 'Upgrade Cards', title: 'Strategic Adviser', rules: [{ section: 'clarifications', text: 'Gone.' }] },
  ], RRG);
  const byKey = new Map(merged.map((card) => [card.key, card]));
  assert.deepEqual(byKey.get('admiral-ozzel-commander').rules.map((r) => r.text), ['Ozzel ruling.']);
  assert.equal(byKey.get('admiral-ozzel-officer').rules.length, 0);
  // The first Chart Officer clarification is already in its rulings, worded for the ARM.
  assert.deepEqual(byKey.get('chart-officer').rules.map((r) => r.text).slice(1), ['A new Chart Officer ruling.']);
  assert.equal(byKey.get('chart-officer').rules[1].source, 'Rules Reference');
  assert.equal(byKey.get('whisper-tie-phantom').rules[0].version, '1.6.0');
  assert.deepEqual(unmatched, ['Strategic Adviser']);
});

test('sameRuling ignores the card name and generic card words but not a changed rule', () => {
  assert.ok(sameRuling('Defense tokens recovered by Walex Blissex are readied.', 'Defense tokens recovered by this upgrade card are readied.', 'Walex Blissex'));
  assert.ok(!sameRuling('Grav well tokens remain in play until the end of the game.', 'Grav well tokens may be placed anywhere in the play area.', 'G7-X Grav Well Projector'));
});
