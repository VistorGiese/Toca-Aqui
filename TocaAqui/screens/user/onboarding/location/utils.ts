import { RADIUS_MAX, RADIUS_MIN, RADIUS_STEP } from "./constants";

export function toggleVenueInList(selected: string[], venue: string): string[] {
  return selected.includes(venue) ? selected.filter((x) => x !== venue) : [...selected, venue];
}

export function decreaseRadius(current: number): number {
  return Math.max(RADIUS_MIN, current - RADIUS_STEP);
}

export function increaseRadius(current: number): number {
  return Math.min(RADIUS_MAX, current + RADIUS_STEP);
}

export function getRadiusFillPercent(radius: number): number {
  return ((radius - RADIUS_MIN) / (RADIUS_MAX - RADIUS_MIN)) * 100;
}
