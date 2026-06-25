import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, HEADER_TITLE } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function EstShowDetailHeader({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{HEADER_TITLE}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}
