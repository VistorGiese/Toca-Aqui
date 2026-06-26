import { Booking } from "@/http/bookingService";

export interface EstabelecimentoInfo {
  nome_estabelecimento?: string;
  cidade?: string;
  descricao?: string;
}

export interface EventDetailDisplay {
  eventTitle: string;
  venueLocation: string | undefined;
  formattedDate: string;
  horario: string;
  offeredCache: string;
  mainGenre: string;
  eventGenres: string[];
  statusLabel: string;
  description?: string;
  venueDescription: string;
}

export type EventBooking = Booking;
