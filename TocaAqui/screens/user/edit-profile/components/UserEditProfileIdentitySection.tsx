import React from "react";
import { Text, TextInput } from "react-native";
import { styles } from "../styles";

interface Props {
  nome: string;
  email: string;
}

export default function UserEditProfileIdentitySection({ nome, email }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Identidade</Text>

      <Text style={styles.fieldLabel}>NOME COMPLETO</Text>
      <TextInput
        style={[styles.input, styles.inputReadOnly]}
        value={nome}
        editable={false}
        placeholder="Seu nome"
        placeholderTextColor="#555577"
      />

      <Text style={styles.fieldLabel}>E-MAIL</Text>
      <TextInput
        style={[styles.input, styles.inputReadOnly]}
        value={email}
        editable={false}
        placeholder="seu@email.com"
        placeholderTextColor="#555577"
        autoCapitalize="none"
        keyboardType="email-address"
      />
    </>
  );
}
