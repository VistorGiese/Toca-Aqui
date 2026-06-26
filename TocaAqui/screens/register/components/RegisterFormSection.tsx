import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Control } from "react-hook-form";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import FormField from "@/components/ui/FormField";
import { styles } from "../styles";
import { RegisterFormData } from "../types";

interface Props {
  control: Control<RegisterFormData>;
  senhaVisivel: boolean;
  emailRef: React.MutableRefObject<TextInput | null>;
  senhaRef: React.MutableRefObject<TextInput | null>;
  onToggleSenha: () => void;
  onSubmit: () => void;
}

export default function RegisterFormSection({
  control,
  senhaVisivel,
  emailRef,
  senhaRef,
  onToggleSenha,
  onSubmit,
}: Props) {
  return (
    <View style={styles.formContainer}>
      <FormField
        control={control}
        name="nomeCompleto"
        rules={{
          required: "Nome completo é obrigatório",
          minLength: { value: 2, message: "Mínimo 2 caracteres" },
          maxLength: { value: 100, message: "Máximo 100 caracteres" },
        }}
        label="NOME COMPLETO"
        iconName="account-outline"
        placeholder="Como devemos te chamar?"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <FormField
        control={control}
        name="email"
        rules={{
          required: "E-mail é obrigatório",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "E-mail inválido",
          },
        }}
        label="E-MAIL"
        iconName="email-outline"
        placeholder="seu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => senhaRef.current?.focus()}
        onMount={(el) => {
          emailRef.current = el;
        }}
      />

      <FormField
        control={control}
        name="senha"
        rules={{
          required: "Senha é obrigatória",
          minLength: { value: 8, message: "Mínimo 8 caracteres" },
          validate: (v: string) =>
            (/[A-Z]/.test(v) && /[0-9]/.test(v)) || "Precisa ter ao menos 1 maiúscula e 1 número",
        }}
        label="SENHA"
        iconName="lock-outline"
        placeholder="Mínimo 8 caracteres"
        secureTextEntry={!senhaVisivel}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        onMount={(el) => {
          senhaRef.current = el;
        }}
        rightElement={
          <Pressable onPress={onToggleSenha} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons
              name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.neutral}
            />
          </Pressable>
        }
      />
    </View>
  );
}
