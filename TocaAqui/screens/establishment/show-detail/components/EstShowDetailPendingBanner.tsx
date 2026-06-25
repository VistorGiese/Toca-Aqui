import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, PENDING_BANNER_MESSAGE } from "../constants";
import { styles } from "../styles";

export default function EstShowDetailPendingBanner() {
  return (
    <View style={styles.pendingBanner}>
      <FontAwesome5 name="lock" size={14} color={DS.amber} />
      <Text style={styles.pendingBannerText}>{PENDING_BANNER_MESSAGE}</Text>
    </View>
  );
}
