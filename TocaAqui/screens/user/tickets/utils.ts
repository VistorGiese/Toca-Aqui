const MONTHS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
] as const;

export function formatDate(dataShow: string, horarioInicio: string): string {
  const date = new Date(dataShow);
  const day = date.getUTCDate();
  const month = MONTHS[date.getUTCMonth()];
  return `${day} ${month} • ${horarioInicio.slice(0, 5)}`;
}

export function isShowPast(dataShow: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const show = new Date(dataShow);
  show.setHours(0, 0, 0, 0);
  return show.getTime() < today.getTime();
}

export function calcDaysLeft(dataShow: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const show = new Date(dataShow);
  show.setHours(0, 0, 0, 0);
  return Math.round((show.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
