export function toggleGenreSelection(genres: string[], genre: string): string[] {
  return genres.includes(genre) ? genres.filter((g) => g !== genre) : [...genres, genre];
}
