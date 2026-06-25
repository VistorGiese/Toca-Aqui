import { Gig } from "@/http/establishmentService";

export interface ScheduleDayGroup {
  dateKey: string;
  label: string;
  gigs: Gig[];
}

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
  dateKey: string;
  hasEvents: boolean;
}
