import { Ingresso } from "@/http/ingressoService";

export type TicketsTab = "upcoming" | "past";

export type TicketCardVariant = "upcoming" | "past";

export type UserTicketsTicketCardProps = {
  ingresso: Ingresso;
  variant: TicketCardVariant;
  onPress: () => void;
  onRate?: () => void;
};
