import React from "react";
import { Text, TextInput, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  value: string;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}

export default function ArtistApplyConfirmationMessageSection({
  value,
  placeholder,
  error,
  onChange,
}: Props) {
  return (
    <>
      <Text style={styles.cardSectionTitle}>SUA MENSAGEM DE APRESENTAÇÃO</Text>
      <TextInput
        style={[styles.messageInput, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={DS.textDis}
        multiline
        numberOfLines={6}
        value={value}
        onChangeText={onChange}
        textAlignVertical="top"
      />
      <FieldError message={error} />
    </>
  );
}
