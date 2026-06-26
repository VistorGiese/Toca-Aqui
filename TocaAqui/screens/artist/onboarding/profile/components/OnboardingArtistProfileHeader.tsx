import React from "react";
import { Text, View } from "react-native";
import { STEP_LABEL } from "../constants";
import { styles } from "../styles";

export default function OnboardingArtistProfileHeader() {
  return (
    <View>
      <Text style={styles.headerLabel}>ARTIST ONBOARDING</Text>
      <Text style={styles.title}>Crie seu Perfil</Text>
      <Text style={styles.stepLabel}>{STEP_LABEL}</Text>
    </View>
  );
}
