import { ArtistSearchResult } from "@/http/artistService";

export function filterSearchResults(
  results: ArtistSearchResult[],
  currentArtistId: number | undefined,
  selectedMembers: ArtistSearchResult[]
): ArtistSearchResult[] {
  return results.filter(
    (r) => r.id !== currentArtistId && !selectedMembers.some((m) => m.id === r.id)
  );
}

export function toggleGenreSelection(genres: string[], genre: string): string[] {
  return genres.includes(genre) ? genres.filter((g) => g !== genre) : [...genres, genre];
}
