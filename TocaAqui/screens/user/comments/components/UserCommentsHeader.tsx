import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { HEADER_TITLE } from "../constants";
import { styles } from "../styles";

type Props = {
  onBack: () => void;
};

export default function UserCommentsHeader({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{HEADER_TITLE}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}
