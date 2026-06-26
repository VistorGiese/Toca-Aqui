import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Button from "@/components/ui/Button";
import { styles } from "../styles";

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

export default function InitialActionsSection({ onLogin, onRegister }: Props) {
  return (
    <View style={styles.bottomContainer}>
      <Button style={styles.buttonPosition} onPress={onLogin}>
        <Text style={styles.textButton}>Fazer Login</Text>
      </Button>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Ainda não tem conta? </Text>
        <TouchableOpacity onPress={onRegister} style={{ backgroundColor: "transparent" }}>
          <Text style={styles.registerLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
