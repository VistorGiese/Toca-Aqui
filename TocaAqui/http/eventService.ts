import api from "./api";
import { Booking } from "./bookingService";
import { PaginatedResponse } from "../types";

// Parâmetros suportados pelo BookingController no backend
interface EventsParams {
  page?: number;
  limit?: number;
  status?: string;
  estabelecimento_id?: number;
  data_inicio?: string;
  data_fim?: string;
}

export const eventService = {
  async getAvailableEvents(params?: EventsParams): Promise<PaginatedResponse<Booking>> {
    const response = await api.get<PaginatedResponse<Booking>>("/agendamentos", { params });
    return response.data;
  },

  async getEventById(id: number): Promise<Booking> {
    const response = await api.get<Booking>(`/agendamentos/${id}`);
    return response.data;
  },
};
