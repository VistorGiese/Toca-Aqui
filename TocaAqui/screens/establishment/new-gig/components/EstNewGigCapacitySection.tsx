import React from "react";
import EstNewGigFormField from "./EstNewGigFormField";

interface Props {
  capacidade: string;
  onCapacidadeChange: (value: string) => void;
  error?: string;
}

export default function EstNewGigCapacitySection({
  capacidade,
  onCapacidadeChange,
  error,
}: Props) {
  return (
    <EstNewGigFormField
      label="CAPACIDADE MÁXIMA (PESSOAS)"
      placeholder="Ex: 150"
      value={capacidade}
      onChangeText={onCapacidadeChange}
      keyboardType="number-pad"
      error={error}
      hint="Limite de público do evento, utilizado para controlar a venda de ingressos."
    />
  );
}
