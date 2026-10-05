// Convert dice array [red, blue, black] to visual display
export function formatDice(dice: number[]): string {
  if (!dice || dice.length === 0) return '';

  const [red, blue, black] = dice;
  const symbols: string[] = [];

  // Add red dice
  for (let i = 0; i < (red || 0); i++) {
    symbols.push('🔴');
  }

  // Add blue dice
  for (let i = 0; i < (blue || 0); i++) {
    symbols.push('🔵');
  }

  // Add black dice
  for (let i = 0; i < (black || 0); i++) {
    symbols.push('⚫');
  }

  return symbols.join(' ');
}

// Get squadron display name (with ace if applicable)
export function getSquadronDisplayName(name: string, aceName?: string): string {
  if (aceName) {
    return `${aceName} - ${name}`;
  }
  return name;
}

// Standard faction list for the application
export const STANDARD_FACTIONS = [
  'rebel',
  'empire',
  'republic',
  'separatist',
  'scum',
  'new-republic',
] as const;

// Format faction name for display
export function formatFactionName(faction: string): string {
  const factionMap: Record<string, string> = {
    'rebel': 'Rebel',
    'empire': 'Empire',
    'republic': 'Republic',
    'separatist': 'Separatist',
    'scum': 'Scum',
    'new-republic': 'New Republic',
  };

  return factionMap[faction.toLowerCase()] || faction.charAt(0).toUpperCase() + faction.slice(1);
}

// The API returns chassis names as slugs (`gozanti-class`), so title-case them for
// display. Roman numerals and size classes are kept in their conventional casing.
const CHASSIS_WORD_OVERRIDES: Record<string, string> = {
  i: 'I',
  ii: 'II',
  iii: 'III',
  iv: 'IV',
  v: 'V',
  vi: 'VI',
  cr90: 'CR90',
  gr75: 'GR-75',
  mc30c: 'MC30c',
  mc75: 'MC75',
  mc80: 'MC80',
  tie: 'TIE',
};

export function formatChassisName(chassisName: string): string {
  if (!chassisName) return '';
  // Already human-readable (contains a space or an uppercase letter) — leave it alone.
  if (/\s/.test(chassisName) || /[A-Z]/.test(chassisName)) return chassisName;

  return chassisName
    .split('-')
    .map((word) =>
      CHASSIS_WORD_OVERRIDES[word] ?? word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

// Get faction color classes for styling
export function getFactionColorClasses(faction: string): {
  border: string;
  bg: string;
  text: string;
  onBg: string;
  glow: string;
  bgLight: string;
} {
  const normalizedFaction = faction.toLowerCase().replace(/\s+/g, '-');

  const factionStyles: Record<string, { border: string; bg: string; text: string; onBg: string; glow: string; bgLight: string }> = {
    'rebel': {
      border: 'border-faction-rebel',
      bg: 'bg-faction-rebel',
      text: 'text-faction-rebel',
      onBg: 'text-white',
      glow: 'glow-faction-rebel',
      bgLight: 'bg-faction-rebel/10',
    },
    'empire': {
      border: 'border-faction-empire',
      bg: 'bg-faction-empire',
      text: 'text-faction-empire',
      onBg: 'text-white',
      glow: 'glow-faction-empire',
      bgLight: 'bg-faction-empire/10',
    },
    'republic': {
      border: 'border-faction-republic',
      bg: 'bg-faction-republic',
      text: 'text-faction-republic',
      onBg: 'text-zinc-900',
      glow: 'glow-faction-republic',
      bgLight: 'bg-faction-republic/10',
    },
    'separatist': {
      border: 'border-faction-separatist',
      bg: 'bg-faction-separatist',
      text: 'text-faction-separatist',
      onBg: 'text-white',
      glow: 'glow-faction-separatist',
      bgLight: 'bg-faction-separatist/10',
    },
    'scum': {
      border: 'border-faction-scum',
      bg: 'bg-faction-scum',
      text: 'text-faction-scum',
      onBg: 'text-white',
      glow: 'glow-faction-scum',
      bgLight: 'bg-faction-scum/10',
    },
    'new-republic': {
      border: 'border-faction-new-republic',
      bg: 'bg-faction-new-republic',
      text: 'text-faction-new-republic',
      onBg: 'text-zinc-900',
      glow: 'glow-faction-new-republic',
      bgLight: 'bg-faction-new-republic/10',
    },
  };

  return factionStyles[normalizedFaction] || {
    border: 'border-primary',
    bg: 'bg-primary',
    text: 'text-primary',
    onBg: 'text-primary-foreground',
    glow: '',
    bgLight: 'bg-primary/10',
  };
}
