export type EstEditProfileFieldKey =
  | "nome"
  | "descricao"
  | "tipo"
  | "telefone"
  | "cnpj"
  | "generos"
  | "estado"
  | "cidade"
  | "endereco"
  | "numero"
  | "bairro"
  | "cep"
  | "horarios";

export type EstEditProfileFieldErrors = Partial<Record<EstEditProfileFieldKey, string>>;

export type EstEditProfileTipoOption = {
  value: string;
  label: string;
};
