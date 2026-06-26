import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles";

type Props = {
  showTitle: string;
  venueName: string;
};

export default function UserRateShowHeroSection({ showTitle, venueName }: Props) {
  return (
    <View style={styles.showImagePlaceholder}>
      <View style={styles.showImageOverlay}>
        <Text style={styles.howWasTitle}>Como foi?</Text>
        <Text style={styles.showName}>{showTitle}</Text>
        <Text style={styles.venueName}>{venueName}</Text>
      </View>
    </View>
  );
}
