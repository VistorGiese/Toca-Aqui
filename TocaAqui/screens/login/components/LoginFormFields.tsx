import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Control, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import { styles } from "../styles";
import { LoginFormData } from "../types";

interface Props {
  control: Control<LoginFormData>;
  senhaVisivel: boolean;
  senhaRef: React.MutableRefObject<TextInput | null>;
  onToggleSenha: () => void;
  onSubmitSenha: () => void;
}

export default function LoginFormFields({
  control,
  senhaVisivel,
  senhaRef,
  onToggleSenha,
  onSubmitSenha,
}: Props) {
  return (
    <>
      <Controller
        control={control}
        name="email"
        rules={{
          required: "E-mail é obrigatório",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "E-mail inválido",
          },
        }}
        render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>E-MAIL</Text>
            <View style={[styles.inputRow, error && styles.inputError]}>
              <Ionicons name="mail-outline" size={18} color={colors.neutral} style={styles.inputIcon} />
              <TextInput
                ref={ref}
                style={styles.input}
                placeholder="nome@exemplo.com"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => senhaRef.current?.focus()}
              />
            </View>
            {error?.message && error.message !== " " && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="senha"
        rules={{
          required: "Senha é obrigatória",
          minLength: { value: 8, message: "Mínimo 8 caracteres" },
        }}
        render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>SENHA</Text>
            <View style={[styles.inputRow, error && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.neutral} style={styles.inputIcon} />
              <TextInput
                ref={(el) => {
                  ref(el);
                  senhaRef.current = el;
                }}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!senhaVisivel}
                returnKeyType="done"
                onSubmitEditing={onSubmitSenha}
              />
              <TouchableOpacity onPress={onToggleSenha} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                  name={senhaVisivel ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color={colors.neutral}
                />
              </TouchableOpacity>
            </View>
            {error?.message && error.message !== " " && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </View>
        )}
      />
    </>
  );
}
