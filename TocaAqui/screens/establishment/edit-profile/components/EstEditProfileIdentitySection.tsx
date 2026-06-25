import React from "react";
import { EstEditProfileFieldErrors } from "../types";
import EstEditProfileFormField from "./EstEditProfileFormField";
import EstEditProfileTypeChips from "./EstEditProfileTypeChips";
import { styles } from "../styles";

interface Props {
  nome: string;
  onNomeChange: (value: string) => void;
  descricao: string;
  onDescricaoChange: (value: string) => void;
  tipo: string;
  onTipoChange: (value: string) => void;
  telefone: string;
  onTelefoneChange: (value: string) => void;
  cnpj: string;
  onCnpjChange: (value: string) => void;
  errors: EstEditProfileFieldErrors;
}

export default function EstEditProfileIdentitySection({
  nome,
  onNomeChange,
  descricao,
  onDescricaoChange,
  tipo,
  onTipoChange,
  telefone,
  onTelefoneChange,
  cnpj,
  onCnpjChange,
  errors,
}: Props) {
  return (
    <>
      <EstEditProfileFormField
        label="NOME DO ESTABELECIMENTO"
        value={nome}
        onChangeText={onNomeChange}
        placeholder="Nome do seu espaço"
        error={errors.nome}
      />

      <EstEditProfileFormField
        label="DESCRIÇÃO"
        value={descricao}
        onChangeText={onDescricaoChange}
        multiline
        placeholder="Fale sobre o seu espaço, ambiente e público"
        error={errors.descricao}
        style={styles.textArea}
      />

      <EstEditProfileTypeChips value={tipo} onChange={onTipoChange} error={errors.tipo} />

      <EstEditProfileFormField
        label="TELEFONE DE CONTATO"
        value={telefone}
        onChangeText={onTelefoneChange}
        placeholder="(11) 99999-9999"
        keyboardType="phone-pad"
        maxLength={15}
        error={errors.telefone}
      />

      <EstEditProfileFormField
        label="CNPJ"
        value={cnpj}
        onChangeText={onCnpjChange}
        placeholder="00.000.000/0000-00"
        keyboardType="number-pad"
        maxLength={18}
        error={errors.cnpj}
      />
    </>
  );
}
