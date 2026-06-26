import React from "react";
import { View } from "react-native";
import { styles } from "../styles";

export default function UserOnboardingLocationProgressBar() {
  return (
    <View style={styles.progressRow}>
      <View style={[styles.progressSegment, styles.progressActive]} />
      <View style={[styles.progressSegment, styles.progressActive]} />
    </View>
  );
}
