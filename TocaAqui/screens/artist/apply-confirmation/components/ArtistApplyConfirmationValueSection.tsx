import React from "react";
import { Text, TextInput, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export default function ArtistApplyConfirmationValueSection({ value, error, onChange }: Props) {
  return (
    <>
      <Text style={styles.cardSectionTitle}>VALOR PROPOSTO</Text>
      <Text style={styles.inputLabel}>Valor proposto (R$)</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder="0,00"
        placeholderTextColor={DS.textDis}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
      />
      <FieldError message={error} />
    </>
  );
}
