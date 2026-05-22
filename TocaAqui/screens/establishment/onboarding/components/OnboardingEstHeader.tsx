import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";

interface Props {
  onBack?: () => void;
  onSkip?: () => void;
  showBrand?: boolean;
}

export default function OnboardingEstHeader({ onBack, onSkip, showBrand = true }: Props) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      {showBrand && <Text style={styles.brand}>TOCA AQUI</Text>}
      {onSkip ? (
        <TouchableOpacity onPress={onSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skip}>PULAR</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  spacer: {
    width: 36,
  },
  brand: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 14,
    color: colors.white,
    letterSpacing: 2,
  },
  skip: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
