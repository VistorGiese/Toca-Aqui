export function toggleChip(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function isDangerChip(chip: string, dangerChips: readonly string[]): boolean {
  return dangerChips.includes(chip);
}
