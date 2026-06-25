import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DEFAULT_CLOSED_MESSAGE, DS } from "../constants";
import { styles } from "../styles";

interface Props {
  message?: string;
}

export default function EstGigApplicationsClosedBanner({ message }: Props) {
  return (
    <View style={styles.closedBanner}>
      <FontAwesome5 name="lock" size={14} color={DS.amber} />
      <Text style={styles.closedBannerText}>{message ?? DEFAULT_CLOSED_MESSAGE}</Text>
    </View>
  );
}
