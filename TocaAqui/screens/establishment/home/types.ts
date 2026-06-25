import { EstablishmentProfile } from "@/http/establishmentService";
import { Show } from "@/http/showService";

export interface EstHomeMetricItem {
  label: string;
  value: string | number;
  color: string;
}

export interface EstHomeMetrics {
  abertas: number;
  candidaturas: number;
  showsMes: number;
  nota: number;
}

export interface EstHomeState {
  profile: EstablishmentProfile | null;
  upcomingShows: Show[];
}
