import React from "react";
import { ActivityIndicator, Pressable, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  isSubmitting: boolean;
  onForgotPassword: () => void;
  onSubmit: () => void;
  onRegister: () => void;
}

export default function LoginActions({
  isSubmitting,
  onForgotPassword,
  onSubmit,
  onRegister,
}: Props) {
  return (
    <>
      <TouchableOpacity style={styles.forgotWrap} onPress={onForgotPassword}>
        <Text style={styles.forgotText}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, isSubmitting && styles.btnDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Text style={styles.btnText}>ENTRAR</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 8 }} />
          </>
        )}
      </TouchableOpacity>

      <Pressable style={styles.registerRow} onPress={onRegister}>
        <Text style={styles.registerText}>Não tem conta? </Text>
        <Text style={styles.registerLink}>Cadastre-se</Text>
      </Pressable>
    </>
  );
}
