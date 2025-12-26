// Convert dice array [black, red, blue, white] to visual display
export function formatDice(dice: number[]): string {
  if (!dice || dice.length === 0) return '';

  const [black, red, blue, white] = dice;
  const symbols: string[] = [];

  // Add black dice
  for (let i = 0; i < (black || 0); i++) {
    symbols.push('⚫');
  }

  // Add red dice
  for (let i = 0; i < (red || 0); i++) {
    symbols.push('🔴');
  }

  // Add blue dice
  for (let i = 0; i < (blue || 0); i++) {
    symbols.push('🔵');
  }

  // Add white dice (if any)
  for (let i = 0; i < (white || 0); i++) {
    symbols.push('⚪');
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
