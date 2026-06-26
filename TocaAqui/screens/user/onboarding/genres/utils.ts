export function toggleGenreInList(selected: string[], key: string): string[] {
  return selected.includes(key) ? selected.filter((g) => g !== key) : [...selected, key];
}
