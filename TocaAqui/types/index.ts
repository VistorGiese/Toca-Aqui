// Tipos globais da aplicação Toca Aqui

export type UserRole = "common_user" | "artist" | "establishment" | "admin";

export interface User {
  id: number;
  nome_completo: string;
  email: string;
  role: UserRole;
  perfilArtistaId?: number;
}

export interface Band {
  id: number;
  nome_banda: string;
  descricao?: string;
  generos_musicais?: string[];
  foto_url?: string;
  perfil_artista_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Alias mantido para compatibilidade com ContractStatus usado em telas legadas
export type ContractStatus =
  | "aguardando_aceite"
  | "aceito"
  | "cancelado"
  | "recusado"
  | "concluido";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
