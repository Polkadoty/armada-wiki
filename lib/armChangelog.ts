// The Armada Reference Manual (ARM) changelog, as published alongside the ARM on the
// Armada Community site (`ARM Changelog.pdf`). Transcribed verbatim, including the
// original's own wording. The only departures: PDF extraction artifacts are corrected,
// a bullet the original ran into its neighbour is split out, and the card name leading
// each short entry is bolded so the list scans.
//
// Inline markup, rendered by `app/changelog/arm/page.tsx`:
//   {+text+}  text added in this revision (blue in the original)
//   {-text-}  text removed in this revision (struck through in the original)
//   **text**  bold
//   _text_    italic
//   ^[n]      reference to footnote n of the same release

export type ArmCardSection = {
  label: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type ArmOutlineItem = {
  marker: string;
  text?: string;
  children?: ArmOutlineItem[];
};

export type ArmBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'outline'; items: ArmOutlineItem[] }
  | { kind: 'card'; name: string; sections: ArmCardSection[] };

export type ArmEntry = {
  numeral: string;
  summary: string;
  blocks?: ArmBlock[];
};

export type ArmRelease = {
  id: string;
  from: string;
  to: string;
  date: string;
  intro?: ArmBlock[];
  blocks?: ArmBlock[];
  entries?: ArmEntry[];
  footnotes?: { id: number; text: string }[];
};

export const ARM_CHANGELOG_SOURCE = {
  title: 'Armada Reference Manual',
  shortTitle: 'ARM',
  currentVersion: 'v1.1',
  fullDocumentUrl: 'https://d2j4aq9mja0i3a.cloudfront.net/armada-reference-manual/ARM%20v1.1.pdf',
  feedbackEmail: 'stewbucket96@gmail.com',
};

export const ARM_RELEASES: ArmRelease[] = [
  {
    id: 'v1-1',
    from: 'v1.03',
    to: 'v1.1',
    date: '2025-07-07',
    intro: [
      {
        kind: 'paragraph',
        text: 'The ARM is a living document. It will be updated with new rulings as they arise, new clarifications as they become necessary, and text updates to cards as the ARC team prudently makes changes to upgrade card text for the purposes of balancing the game. On an ongoing basis, the ARM changelog will be published once a month, with the ARM on the ARC website updated with the changes.',
      },
      {
        kind: 'paragraph',
        text: 'The purpose of this monthly change is twofold: first, to catch errors such as typos, unclear text, or missing sections; and second, to answer frequently asked questions or make new rulings that may arise.',
      },
      {
        kind: 'paragraph',
        text: 'If, in the course of consulting the ARM, you find an unanswered question or a missed error, please email stewbucket96@gmail.com and the relevant text will be updated in the following month’s update. Your email may not be answered directly, especially if the answer to your question is already found in the ARM. In the interim period between ARM updates, if your question is urgent, we recommend consulting one of the many Rules Discussions forums found on the various armada discords, or via consultation with an experienced player in your area.',
      },
      {
        kind: 'paragraph',
        text: 'The following is the first major changelog for the ARM since its original publication. Each entry is marked with a Roman numeral, and textual changes to the upgrade cards themselves are highlighted or struck through, as appropriate.',
      },
    ],
    entries: [
      {
        numeral: 'I',
        summary:
          'The text of the TF-1726 (commander) upgrade card was modified as follows. No changes have been made to the cards function and no new rulings have been made. This card’s original text, on its face, may have been misconstrued to be a mandatory action, which was neither the intent of the developers, nor consistent with how the card was played, nor with any prior rulings). The text of the upgrade card has been modified to bring it in-line with how the playerbase already understands it to function, and to make it consistent with all prior official AMG rulings.',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: 'The original card’s text:',
                children: [
                  {
                    marker: '1.',
                    text: 'Once per activation, while a friendly ship is attacking a ship, the attacker adds 1 black die to its attack pool for each raid token the defender has, to a maximum of 2 additional dice.',
                  },
                ],
              },
              {
                marker: 'B.',
                text: 'Now reads as',
                children: [
                  {
                    marker: '1.',
                    text: 'Once per activation, while a friendly ship is attacking a ship, the attacker {+may add+} 1 black die to its attack pool for each raid token {+assigned to the defender+}, to a maximum of 2.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'II',
        summary:
          'The text of the Mon Mothma (Commander) upgrade card was modified as follows, with additional clarity to the relevant prior rulings and new rulings added regarding her new text. Mon Mothma now grants an ECM-like effect for all her ships’ Evade tokens.',
        blocks: [
          {
            kind: 'card',
            name: 'Mon Mothma',
            sections: [
              {
                label: 'Card Text',
                paragraphs: [
                  '“When a friendly ship resolves the **Evade** defense token effect, it can cancel 1 die at medium range or reroll 1 additional die at close range or distance 1.',
                  '{+While a friendly ship is defending, it may spend an Evade token that the attacker has targeted with an Accuracy result.”+}^[1]',
                ],
              },
              {
                label: 'Timing',
                paragraphs: ['This Upgrade Card’s effect is used during a ship’s “Spend Defense Tokens” step during an attack.'],
              },
              {
                label: 'Clarifications',
                bullets: [
                  '{+This upgrade card provides a modification to the Evade defense token effect. Provided the range conditions are met, the Evade defense token effect can cancel one die at medium range or reroll an additional die at close range or distance 1.+}',
                  '{+This modified Evade defense token effect can combine with other effects that trigger on resolving the Evade defense token effect. While defending against a ship of a larger size class, the defender may use Mon Mothma’s ability to cancel two dice at medium range (or reroll three dice at close range) should it discard the Evade defense token.+}',
                  '{+This upgrade card does not grant the defender the ability to spend two tokens of the same type.+}',
                  '{+This upgrade card does not grant the defender the ability to spend an Evade defense token while at speed 0.+}',
                ],
              },
              {
                label: 'Upgrade Card Interactions',
                bullets: [
                  'This Upgrade Card’s effect works alongside **Foresight** to affect an additional die when a ship resolves the **Evade** defense effect.',
                  '{+The second part of this upgrade card’s effect has no interaction with Electronic Countermeasures. While defending, the defender can choose to use either Electronic Countermeasures or Mon Mothma’s effect to spend an Evade token targeted by an accuracy result.+}',
                  '{+Because the same defense token may only be spent once during each attack, the defender cannot use this upgrade card’s ability to spend a defense token which has already been spent by Admiral Sloane’s ability.+}^[2]',
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'III',
        summary:
          'The text of the General Draven (commander) upgrade card was modified as follows, with new rulings applicable to his text. The ability allowing a player to peek at his opponent’s command dials was removed. The player no longer adds command tokens piecemeal throughout the game; instead, the player must choose all six of General Draven’s command tokens at deployment. Additionally, General Draven now grants a reroll to squadrons at distance 1-2 of enemy ships with raid tokens.',
        blocks: [
          {
            kind: 'card',
            name: 'General Draven',
            sections: [
              {
                label: 'Card Text',
                paragraphs: [
                  'After an enemy ship resolves a command, you may discard a matching command token from this card. If you do, that enemy ship gains 1 matching raid token.',
                  '{+While a friendly squadron is attacking, if it is at distance 1-2 of an enemy ship with at least 1 raid token, it may reroll 1 die.”+}',
                ],
              },
              {
                label: '{+Timing+}',
                paragraphs: [
                  '{+This upgrade card triggers once at deployment, when command tokens are chosen for the card. It may also trigger again after an enemy ship has completed resolution of a given command. It may also trigger again while a friendly squadron is attacking.+}',
                ],
              },
              {
                label: '{+Clarifications+}',
                bullets: [
                  '{+“After an enemy ship resolves a command” is a timing window that may occur several times throughout a ship’s activation, as ships may resolve more than one command per activation. There is no limitation on the number of times during a ship’s activation that this upgrade card may trigger.+}',
                  '{+This upgrade card may trigger while a friendly squadron is making a Counter attack.+}',
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'IV',
        summary:
          'The Text of the Admiral Screed (commander) upgrade card was modified as follows, with additional clarity on his old rulings and new rulings applicable to his new text. His modified die can no longer be rerolled.',
        blocks: [
          {
            kind: 'card',
            name: 'Admiral Screed',
            sections: [
              {
                label: 'Card Text',
                paragraphs: [
                  '“Once per activation, when a friendly ship is attacking, it may spend 1 die to change a die to a face with a Critical icon. {+That die cannot be rerolled.+}”',
                ],
              },
              {
                label: 'Timing',
                paragraphs: ['This ability is resolved in the “Resolve Attack Effects” step.'],
              },
              {
                label: 'Clarifications',
                bullets: [
                  'This Upgrade Card {+can resolve only+} once per activation, {+while+} a friendly ship is attacking during the “Resolve Attack Effects” step.',
                  'On your activation, if attacking squadrons, you may only use this Upgrade Card’s ability on one squadron.',
                  'You may spend a die to change any other die in your attack pool to a face with a critical icon, {+including+} a hit/critical icon.',
                  'This card’s effect can resolve once during any ship or squadron’s activation, {+including+} an opponent’s.',
                  '{+This upgrade card may resolve while a friendly ship is performing a **Salvo** or **Counter** attack against a squadron.+}^[3]',
                  '{+A die set to a particular face by this upgrade card’s ability cannot be rerolled, either by attack effects (such as Leading shots) or defense effects (such as Point Defense Ion Cannons). The die may still be modified in other ways, such as being set to a different face, cancelled, spent. Thus, the die is vulnerable to the scatter defense token effect (which cancels dice) but not to the evade defense token effect when resolved at medium range (which rerolls a die).+}',
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'V',
        summary:
          'The text of the Emperor Palpatine (commander) upgrade card was modified as follows, with additional clarity on his relevant old rulings and the new rulings applicable to his text. The timing of his effect was expanded to include all situations in which an opposing player might spend a defense token, rather than only during the Spend Defense Tokens step of the attack sequence.',
        blocks: [
          {
            kind: 'card',
            name: 'Emperor Palpatine',
            sections: [
              {
                label: 'Card Text',
                paragraphs: [
                  '“After deploying fleets, place 1 defense token of each type on this card. At the start of each Ship Phase you may discard 1 of those tokens. If you do, until the end of the {-round, if an enemy ship or squadron spends a matching token during its Spend Defense Tokens step, discard that token.”-}',
                ],
              },
              {
                label: 'Timing',
                paragraphs: [
                  'The initial effect of this Upgrade Card triggers “after deploying fleets” when you place 1 defense token of each type on this card. This Upgrade Card may be then resolved at the start of a Ship Phase by discarding a defense token.',
                ],
              },
              {
                label: 'Clarifications',
                bullets: [
                  'If the ship this Upgrade Card is equipped to is destroyed, this Upgrade Card’s ability (if active) will remain in effect until the end of the round.',
                  '{+This upgrade card’s effect will trigger at any time the opposing player spends a matching defense token. This includes but is not limited to defense tokens spent while defending as part of the Spend Defense tokens step, those spent while defending but not as part of the Spend Defense tokens step (such as Thermal Shields) and those spent while attacking (such as Turbolaser Reroute Circuits).+}',
                  '{+This upgrade card’s effect will only trigger if the opposing player is spending their own defense tokens. It will not trigger if defense tokens are spent by another player, such as via Boarding Troopers.+}',
                  '{+This upgrade card’s effect does not trigger when a defense token is exhausted (rather than spent), such as via Suppressor or Overload Pulse.+}',
                  'If this Upgrade Card is discarded due to Darth Vader (Officer), any remaining defensive tokens on this Upgrade Card cannot be discarded. However if a defensive token was discarded at the beginning of the turn, the card’s ability will remain in effect until the end of the turn.',
                ],
              },
              {
                label: 'Squadron Interactions',
                bullets: ['{+This Upgrade Card will resolve when the opposing player uses the special abilities of both Jan Ors and Axe.+}'],
              },
              {
                label: 'Damage Card Interactions',
                bullets: [
                  '{+The **Injured Crew** damage card only affects defense tokens assigned to the ship which was dealt the damage card. It will not affect the defense tokens assigned to this Upgrade Card.+}',
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'VI',
        summary:
          'The text of the Leia Organa (commander) card was updated as follows. Her restriction requiring the player to only resolve one command when using her ability was removed. Additionally, her text was updated for clarity.',
        blocks: [
          {
            kind: 'card',
            name: 'Leia Organa (Commander)',
            sections: [
              {
                label: 'Card Text',
                paragraphs: [
                  '{-“When a friendly ship resolves a command by spending a command dial, if it has not resolved another command this round, it may resolve that command as if it also spent a matching command token. If it does, that ship cannot resolve additional commands this round.”-}',
                  '{+“When a friendly ship resolves a command by spending the command dial it revealed, it may resolve that command as if it also spent a matching command token.”+}',
                ],
              },
              {
                label: 'Timing',
                paragraphs: ['This Upgrade Card’s effect triggers during a ship’s activation when resolving a command.'],
              },
              {
                label: 'Clarifications',
                bullets: [
                  'This Upgrade Card’s effect cannot be resolved when a ship resolves a command by spending a command dial and a matching command token. To be eligible to use this Upgrade Card’s effect, a ship must resolve a command {+by only spending the command dial which it revealed this turn.+}',
                ],
              },
              {
                label: 'Upgrade Card Interactions',
                bullets: [
                  'This Upgrade Card’s effect {+has no interaction with+} spending tokens for Fleet Command upgrade cards or upgrade cards like Boarding Teams.',
                  'If a dial is discarded or spent to resolve an effect besides a command (such as a Boarding Team), this Upgrade Card’s effect would not be able to trigger since there is no dial with which to resolve a command.',
                  'A ship using this Upgrade Card’s effect is considered to have spent a command token, which would {+trigger+} cards such as **Liberty** or **Nav Team**.',
                ],
              },
              {
                label: 'Damage Card Interactions',
                bullets: ['This Upgrade Card’s effect is unaffected by **Life Support Failure**.'],
              },
            ],
          },
        ],
      },
      {
        numeral: 'VII',
        summary:
          'The text of Commander Sato (commander) was updated as follows. He no longer swaps dice out before rolling. Instead, while attacking, he now adds two dice of any color, provided the restrictions are met. After adding those dice, he must immediately cancel two dice, which may be any dice in the pool.',
        blocks: [
          {
            kind: 'card',
            name: 'Commander Sato',
            sections: [
              {
                label: 'Card Text',
                paragraphs: [
                  '“While a friendly ship is attacking a ship at distance 1 of a friendly squadron,{+ the attacker may add 2 dice, each of any color. If it does, it must cancel 2 attack dice+}.”^[4]',
                ],
              },
              {
                label: 'Timing',
                paragraphs: ['This Upgrade Card’s effect may be resolved during the “{+Resolve Attack Effects+}” step.'],
              },
              {
                label: '{+Clarifications+}',
                bullets: [
                  '{+The dice added by this upgrade card’s effect may both be of the same color or of different colors.+}',
                  '{+The dice cancelled by this upgrade card’s effect may be any of the dice in the attack pool, including the dice just added.+}',
                  '{+The attacker must add both dice at the same time; he may not add one, check the result, and then choose another.+}',
                  '{+The add and subsequent cancel effects of this upgrade card may not be interrupted to resolve other attack effects; the attacker must cancel two attack dice immediately after adding two attack dice. For example the attacker may not add two dice, concentrate fire in a third, and then cancel two dice.+}',
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'VIII',
        summary:
          '**Harrow**: The following clarifications were added. A new ruling was made regarding the interaction between Harrow and certain instances where a ship performs a speed-1 maneuver and its speed dial was set to a different speed. Because Harrow’s text only references the speed of the _maneuver_ and not the speed of the _ship_, this is consistent with the text of the card rulings. Previous community rulings and a prior version of the Armada Reference Manual were both incorrect.',
        blocks: [
          {
            kind: 'card',
            name: 'Harrow',
            sections: [
              {
                label: '{+Clarifications+}',
                bullets: [
                  '{+This upgrade card will provide a yaw value of “II” on speed-1 maneuvers that are performed when the ship’s speed dial is set to something other than 1. This can occur on “bonus” maneuvers, such as those provided by Rift Ambush or Engine Techs. This can also occur if the ship’s speed is temporarily reduced, such as via the Gravity Rift obstacle or G-8 Experimental Projectors.+}',
                ],
              },
              {
                label: '{+Obstacle Interactions+}',
                bullets: [
                  '{+This Upgrade card affects speed-1 maneuvers that are performed when the ship’s speed is set to 2 and it performs a maneuver near the Gravity Rift. Additionally, when playing the Rift Ambush objective as second player, this Upgrade Card will affect the speed-1 maneuvers generated by ending a maneuver at distance 1 of the Gravity Rift.+}',
                ],
              },
            ],
          },
        ],
      },
      {
        numeral: 'IX',
        summary:
          '**Moff Jerjerrod**: The previous entry in the ARM on Moff Jerjerrod (commander) incorrectly referenced text from prior versions of Moff Jerjerrod. While the card’s current text was displayed correctly, the “Clarifications” section contained clarifications that are no longer relevant. They have since been removed, and the ARM entry re-written as below. The text of the upgrade card was not changed and no new rulings were made.',
        blocks: [
          {
            kind: 'card',
            name: 'Moff Jerjerrod',
            sections: [
              {
                label: 'Clarifications',
                bullets: [
                  'This upgrade card may resolve multiple times during a ship’s activation, during each Determine Course step (which will occur each time the ship executes a maneuver).',
                  'When a ship “suffers damage”, it selects a hull zone and suffers damage on that hull zone, one point at a time. Therefore, you cannot bypass shields in order to take a facedown damage card. A hull zone is chosen, and one point of damage is suffered. If that hull zone has no shields remaining, the ship will be dealt one facedown damage card.',
                  'A yaw value of “II” does not require you to use both available clicks.',
                ],
              },
              {
                label: 'Upgrade Card Interactions',
                bullets: ['This Upgrade Card effect can be resolved with **Rakehell** so that the ship’s yaw value at speed 0 is “II”.'],
              },
            ],
          },
        ],
      },
      {
        numeral: 'X',
        summary:
          '**Advanced Projectors**: The following clarifications were added to increase clarity on the timing of Advanced Projectors. This timing is consistent with the standard use of the Redirect defense effect.',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: '{+During the Spend Defense Tokens step, at the time the redirect token is spent, the attacker must declare which zones he is choosing to suffer damage. He cannot wait until the Resolve Damage step to choose which zones are being chosen to suffer damage.+}^[5]',
              },
            ],
          },
        ],
      },
      {
        numeral: 'XI',
        summary:
          '**Cluster Bombs**: The following edit was made to one of the clarifications in this entry, to standardize language and increase clarity.',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: 'The dice rolled are not part of an attack, and thus cannot be modified by card effects {+which occur “while attacking”+}.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'XII',
        summary:
          '**Redundant Shields**: The following clarification mentioned the upgrade card Aspiration by name, but did not mention Gilded Aegis or Tranquility. This has been rectified.',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: 'A ship equipped with **Aspiration,** {+**Tranquility, or Gilded Aegis**+} may not use this upgrade card to recover shields if any hullzone exceeds its maximum shield value.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'XIII',
        summary:
          '**Darth Vader (Boarding Team)**: The following clarification was added. The other clarifications were also edited for clarity.',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: 'If this upgrade card were to discard Swivel-Mount Batteries, the focus token would remain. The upgrade card’s effect would no longer be able to trigger, and players would neither be able to add dice from Swivel-Mount Batteries’ effect, nor would dice be cancelled from attacks originating from an adjacent hull zone.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'XIV',
        summary:
          '**Shriv Suurgav (Boarding Team)**: The following clarification was added. The other clarifications were also edited for clarity.',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: 'If this upgrade card were to discard Swivel-Mount Batteries, the focus token would remain. The upgrade card’s effect would no longer be able to trigger, and players would neither be able to add dice from Swivel-Mount Batteries’ effect, nor would dice be cancelled from attacks originating from an adjacent hull zone.',
              },
            ],
          },
        ],
      },
      {
        numeral: 'XV',
        summary: '**Invincible**: The following clarification was added:',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: '{+If this upgrade card were to be discarded in the course of play, the [defensive retrofit] would remain.+}',
              },
            ],
          },
        ],
      },
      {
        numeral: 'XVI',
        summary: '**SPHA-T**: The timing on this upgrade card was re-written as follows:',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: 'Previous Entry:',
                children: [{ marker: '1.', text: 'This upgrade card’s effect is always active, unless it is discarded.' }],
              },
              {
                marker: 'B.',
                text: 'New Entry:',
                children: [
                  {
                    marker: '{+1.+}',
                    text: '{+This upgrade card’s effect is always active, unless it is discarded. This Upgrade Card allows you to place an Ignition targeting token at close range in your front, left, or right firing arc in order to use it as a special firing arc to make an Ignition attack. After the ship’s activation, this card may be exhausted in order to place an Ignition Targeting token. The card may be readied at the typical timing in the Status Phase+}',
                  },
                ],
              },
            ],
          },
        ],
      },
      { numeral: 'XVII', summary: '**Linked Turbolaser Towers**: This entry was adjusted due to a typographical error.' },
      { numeral: 'XVIII', summary: '**Home One**: This entry was adjusted due to a typographical error.' },
      { numeral: 'XIX', summary: '**Cham Syndulla**: This entry was adjusted due to a typographical error.' },
      { numeral: 'XX', summary: '**Comms Net**: This entry was adjusted due to multiple typographical errors.' },
      { numeral: 'XXI', summary: '**Rapid Launch Bays**: This entry was adjusted due to a typographical error.' },
      {
        numeral: 'XXII',
        summary:
          '**Admiral Piett**: This entry was adjusted as follows to conform to a more consistent text of the rules. The following entry was changed:',
        blocks: [
          {
            kind: 'outline',
            items: [
              {
                marker: 'A.',
                text: 'Clarifications: This Upgrade Card is exhausted and triggers when {+resolving a command by spending only+} a command token.',
              },
            ],
          },
        ],
      },
      { numeral: 'XXIII', summary: '**Hand Of Justice**: This entry was adjusted to conform to internal ARC style guidelines. No rulings were made.' },
      { numeral: 'XXIV', summary: '**Boarding Troopers**: This entry was adjusted to conform to internal ARC style guidelines. No rulings were made.' },
      {
        numeral: 'XXV',
        summary:
          '**Admiral Ackbar**: The entries regarding the interactions between Salvo, Counter, and Admiral Ackbar’s effect were edited for clarity. No new rulings were made.',
      },
      { numeral: 'XXVI', summary: '**Quad Turbolaser Cannons**: This entry was edited for clarity. No rulings were made.' },
      { numeral: 'XXVII', summary: '**Reserve Hangar Deck**: This entry was edited for clarity. No rulings were made.' },
      { numeral: 'XXVIII', summary: '**Quad Laser Turrets**: This entry was edited for clarity. No rulings were made.' },
      { numeral: 'XXIX', summary: '**Boarding Engineers**: This entry was edited for clarity. No rulings were made.' },
      { numeral: 'XXX', summary: '**Hot Landing**: This entry was edited for clarity. No rulings were made.' },
      { numeral: 'XXXI', summary: '**Mercy Mission**: This entry was edited for clarity. No rulings were made.' },
      { numeral: 'XXXII', summary: '**Darth Vader**: This entry was edited for clarity. No rulings were made.' },
      { numeral: 'XXXIII', summary: '**Jyn Erso**: This entry was edited for clarity. No rulings were made.' },
    ],
    footnotes: [
      {
        id: 1,
        text: 'The second paragraph of Mon Mothma’s effect contains identical wording to that of Electronic Countermeasures. It may be a useful shorthand to think “free ECM, but only for an Evade”.',
      },
      { id: 2, text: 'This is identical to the interaction between Electronic Countermeasures and Admiral Sloane.' },
      { id: 3, text: 'This would only be effective if the dice pool contained at least one black die.' },
      {
        id: 4,
        text: 'The astute observer will note that the language for Commander Sato is identical to that of Dual Turbolaser Turrets, and as such, the card functions in a very similar fashion.',
      },
      {
        id: 5,
        text: 'This becomes relevant should the attacker choose to resolve a critical effect (such as Assault Proton Torpedoes dealing the Projector Misaligned damage card); this would take place after the defender has made his decision but before damage is totalled and suffered.',
      },
    ],
  },
  {
    id: 'v1-03',
    from: 'v1.02',
    to: 'v1.03',
    date: '2025-06-12',
    blocks: [
      { kind: 'heading', text: 'Full Version' },
      {
        kind: 'bullets',
        items: [
          'Credits error (triplicate page) corrected',
          'Admiral Sloane: Interaction with Blinded Gunners removed as there is no interaction',
          'Admiral Tarkin & Admiral Trench now correctly placed before Admiral Yularen and Anakin',
          'Mon Karren, second bullet point added addressing Thermal Shields and Barriss Offee',
          'Dutch Vander, Dash Rendar, and Fenn Rau entries now associated with correct squadrons',
          'Wedge Antilles (Squadron) name corrected',
          'Version number added to Cover',
        ],
      },
      { kind: 'heading', text: 'Text Only Version' },
      {
        kind: 'bullets',
        items: [
          'Mon Karren, second bullet point added addressing Thermal Shields and Barriss Offee',
          'Admiral Sloane: Interaction with Blinded Gunners removed as there is no interaction.',
          'Front Cover and Credits replaced with full versions',
        ],
      },
      { kind: 'heading', text: 'Website' },
      { kind: 'bullets', items: ['Officers tab now includes all officers, not half.'] },
      { kind: 'heading', text: 'Changes from KARM / Official Rules to ARM rules' },
      {
        kind: 'bullets',
        items: [
          'The effect from Early Warning System persists until the end of the round, even if the card is discarded by an effect such as Shriv or Darth Vader. This ruling brings the card in line with effects like Intensify Firepower!. Previous rulings had the card’s effect nullified if the card was discarded, which was inconsistent with other effects which triggered at the start of a round and provided effects throughout the round.',
          'Previous rulings from the KARM indicated that a proximity mine, if it was on top of an obstacle and the obstacle was removed from play (such as an exogorth being removed at the end of a phase), the token should be placed touching the obstacle. There was no official basis for this ruling. For increased simplicity, this situation is now ruled that the token should be placed as near to its original position as is possible, as if the obstacle were not there. This position should be determined by the joint decision of the players, or a judge if necessary.',
          'Previous rulings from the KARM suggested that a proximity mine could be engaged with a squadron, for the purposes of triggering cards such as Heavy Fire Zone. This is incorrect. Proximity mine tokens cannot be engaged with squadrons of any kind.',
          'Previous rulings from the KARM suggested an incorrect interaction between XI7 turbolasers and certain critical effects, such as ACM and Superheavy Composite Beam Turbolaser. This was overruled in the AMG rules forum and the ARM reflects the correct ruling.',
          'The text of Engine Techs was updated by AMG incorrectly; the ruling contained in the ARM has the timing windows explained and the function of the card clarified such that a player may not utilize Engine Techs to double-ram an enemy ship.',
          'Previous rulings from the KARM suggested that Ketsu Onyo’s ability would prevent enemy squadrons from moving faster than Speed 3. The correct timings suggest that speed-augmenting abilities (such as All Fighters Follow Me!) trigger after Ketsu, which has been reflected in the ARM.',
          'No official ruling had previously been made regarding movement of an unarmed station - as the station has no “movement” step. However, it is able to move when acted upon by cards such as Ezra Bridger. This interaction was clarified, and as a result, if an armed or unarmed station “moves” by an outside influence, it will trigger any proximity mines after its movement ends.',
        ],
      },
    ],
  },
];
