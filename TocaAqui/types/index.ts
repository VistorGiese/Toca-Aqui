// Tipos globais da aplicação Toca Aqui

export type UserRole = "common_user" | "artist" | "establishment" | "establishment_owner" | "admin";

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

export interface Notification {
  id: number;
  usuario_id: number;
  tipo?: string;
  titulo?: string;
  mensagem?: string;
  conteudo?: string;
  lida?: boolean;
  created_at?: string;
  criado_em?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MinhasPaginas {
  usuario_id: number;
  pagina_artista: { id: number; nome_artistico: string; foto_perfil: string | null } | null;
  pagina_estabelecimento: { id: number; nome_estabelecimento: string; tipo_estabelecimento: string } | null;
}

/** Formulário legado (tela Profile / HomePage). */
export type AccountProps = {
  nome?: string;
  tipo_usuario?: "establishment_owner" | "artist" | "common_user";
  email_responsavel?: string;
  password?: string;
  passwordConfirm?: string;
  celular_responsavel?: string;
  nome_estabelecimento?: string;
  cidade?: string;
  estado?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  generos_musicais?: string;
  horario_funcionamento_inicio?: string;
  horario_funcionamento_fim?: string;
  nome_dono?: string;
};
