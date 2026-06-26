import React from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";
import { VerifyEmailState } from "../types";

interface Props {
  state: VerifyEmailState;
  onGoToLogin: () => void;
}

export default function VerifyEmailContent({ state, onGoToLogin }: Props) {
  const iconName =
    state.status === "loading"
      ? "hourglass-outline"
      : state.status === "success"
        ? "checkmark-circle-outline"
        : "close-circle-outline";

  const iconColor =
    state.status === "success" ? DS.success : state.status === "error" ? DS.error : DS.accentLight;

  return (
    <>
      <Image
        source={require("../../../assets/images/Login/gridStarts.png")}
        style={styles.bgTexture}
        resizeMode="cover"
      />
      <View style={styles.glow} pointerEvents="none" />

      {state.status === "loading" ? (
        <ActivityIndicator size="large" color={DS.accent} style={{ marginBottom: 28 }} />
      ) : (
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={40} color={iconColor} />
        </View>
      )}

      <Text style={styles.title}>
        {state.status === "loading"
          ? "Verificando..."
          : state.status === "success"
            ? "E-mail verificado!"
            : "Falha na verificação"}
      </Text>
      <Text style={styles.subtitle}>{state.message}</Text>

      {state.status !== "loading" && (
        <TouchableOpacity style={styles.btn} onPress={onGoToLogin} activeOpacity={0.85}>
          <Text style={styles.btnText}>IR PARA O LOGIN</Text>
        </TouchableOpacity>
      )}
    </>
  );
}
