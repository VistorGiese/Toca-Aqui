import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "@/utils/colors";
import Button from "@/components/ui/Button";
import { styles } from "../styles";

interface Props {
  isSubmitting: boolean;
  onSubmit: () => void;
  onLogin: () => void;
}

export default function RegisterFooter({ isSubmitting, onSubmit, onLogin }: Props) {
  return (
    <>
      <Text style={styles.termsText}>
        Ao criar sua conta, você concorda com nossos{" "}
        <Text style={styles.termsLink}>Termos de Uso e Privacidade</Text>.
      </Text>

      <Button style={styles.button} onPress={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>CRIAR CONTA</Text>
        )}
      </Button>

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Já tem conta? </Text>
        <Text style={styles.loginLink} onPress={onLogin}>
          Entrar
        </Text>
      </View>
    </>
  );
}
