export function toggleChipSelection(selected: string[], label: string): string[] {
  return selected.includes(label)
    ? selected.filter((item) => item !== label)
    : [...selected, label];
}
