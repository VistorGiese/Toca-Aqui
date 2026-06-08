import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "@/utils/colors";

interface ShowPurchaseCtaProps {
  label: string;
  variant: "paid" | "free";
  onPress: () => void;
  stopPropagation?: boolean;
}

export default function ShowPurchaseCta({
  label,
  variant,
  onPress,
  stopPropagation = false,
}: ShowPurchaseCtaProps) {
  const isFree = variant === "free";

  const handlePress = (event: GestureResponderEvent) => {
    if (stopPropagation) event.stopPropagation();
    onPress();
  };

  return (
    <TouchableOpacity
      style={isFree ? styles.confirmBtn : styles.buyBtn}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <Text style={isFree ? styles.confirmBtnText : styles.buyBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buyBtn: {
    backgroundColor: colors.purplePrimary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buyBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.5,
  },
  confirmBtn: {
    borderWidth: 1,
    borderColor: colors.purpleLight,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  confirmBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: colors.purpleLight,
    letterSpacing: 0.5,
  },
});
