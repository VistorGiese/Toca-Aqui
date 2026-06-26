import React from "react";
import { View } from "react-native";
import { PROGRESS_PERCENT } from "../constants";
import { styles } from "../styles";

export default function OnboardingArtistProfileProgressBar() {
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: PROGRESS_PERCENT }]} />
    </View>
  );
}
