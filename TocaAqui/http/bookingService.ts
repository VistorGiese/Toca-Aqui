import api from "./api";

export enum BookingStatus {
  PENDENTE = "pendente",
  ACEITO = "aceito",
  REJEITADO = "rejeitado",
  CANCELADO = "cancelado",
  REALIZADO = "realizado",
}

export interface Booking {
  id: number;
  banda_id: number | null;
  titulo_evento: string;
  descricao_evento?: string;
  data_show: string;
  estabelecimento_id: number;
  perfil_estabelecimento_id?: number;
  horario_inicio: string;
  horario_fim: string;
  status: BookingStatus;
  preco_ingresso_inteira?: number;
  nome_estabelecimento?: string;
  banda?: {
    nome_banda: string;
  };
}

interface CreateBookingData {
  titulo_evento: string;
  descricao_evento?: string;
  data_show: string;
  perfil_estabelecimento_id: number;
  horario_inicio: string;
  horario_fim: string;
}

interface BookingsResponse {
  data: Booking[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const getBookings = async (params?: { status?: string }) => {
  const response = await api.get<BookingsResponse>("/agendamentos", { params });
  return response.data.data ?? [];
};

const getBookingById = async (id: number) => {
  const response = await api.get<Booking>(`/agendamentos/${id}`);
  return response.data;
};

const createBooking = async (data: CreateBookingData) => {
  const response = await api.post<Booking>("/agendamentos", data);
  return response.data;
};

const updateBooking = async (id: number, data: Partial<Booking>) => {
  const response = await api.put<Booking>(`/agendamentos/${id}`, data);
  return response.data;
};

const deleteBooking = async (id: number) => {
  await api.delete(`/agendamentos/${id}`);
};

export const bookingService = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};
