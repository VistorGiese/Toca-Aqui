export interface EstNotification {
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
