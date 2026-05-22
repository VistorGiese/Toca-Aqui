import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";

interface Props {
  currentStep: number;
  totalSteps?: number;
}

export default function OnboardingEstProgressBar({ currentStep, totalSteps = 4 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[styles.segment, i < currentStep ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 56,
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  active: {
    backgroundColor: colors.purpleLight,
  },
  inactive: {
    backgroundColor: colors.inputBorder,
  },
});
