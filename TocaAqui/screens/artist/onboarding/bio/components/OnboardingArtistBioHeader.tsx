import React from "react";
import { Text, View } from "react-native";
import { STEP_LABEL } from "../constants";
import { styles } from "../styles";

export default function OnboardingArtistBioHeader() {
  return (
    <View>
      <Text style={styles.headerLabel}>ARTIST ONBOARDING</Text>
      <Text style={styles.stepLabel}>{STEP_LABEL}</Text>
    </View>
  );
}
