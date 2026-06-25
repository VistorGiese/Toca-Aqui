import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { APPROVED_BANNER_MESSAGE, DS } from "../constants";
import { styles } from "../styles";

export default function EstContractPreviewSuccessBanner() {
  return (
    <View style={styles.successBanner}>
      <FontAwesome5 name="check-circle" size={14} color={DS.success} />
      <Text style={styles.successBannerText}>{APPROVED_BANNER_MESSAGE}</Text>
    </View>
  );
}
