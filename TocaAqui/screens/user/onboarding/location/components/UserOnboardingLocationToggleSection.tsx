import React from "react";
import { Switch, Text, View } from "react-native";
import { styles } from "../styles";

type Props = {
  useLocation: boolean;
  onUseLocationChange: (value: boolean) => void;
};

export default function UserOnboardingLocationToggleSection({
  useLocation,
  onUseLocationChange,
}: Props) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>Usar minha localização atual</Text>
      <Switch
        value={useLocation}
        onValueChange={onUseLocationChange}
        trackColor={{ false: "#1A1040", true: "#6C5CE7" }}
        thumbColor={useLocation ? "#A78BFA" : "#555577"}
      />
    </View>
  );
}
