import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  isFree: boolean;
  isDisabled: boolean;
  submitting: boolean;
  onSubmit: () => void;
}

export default function UserCheckoutStickyBottom({
  isFree,
  isDisabled,
  submitting,
  onSubmit,
}: Props) {
  return (
    <View style={styles.stickyBottom}>
      <TouchableOpacity
        style={[styles.finishBtn, isDisabled && styles.finishBtnDisabled]}
        onPress={onSubmit}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={styles.finishBtnIcon}
          />
        ) : (
          <FontAwesome5
            name={isFree ? "check" : "lock"}
            size={14}
            color="#FFFFFF"
            style={styles.finishBtnIcon}
          />
        )}
        <Text style={styles.finishBtnText}>
          {isFree ? "CONFIRMAR PRESENÇA" : "FINALIZAR COMPRA"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
