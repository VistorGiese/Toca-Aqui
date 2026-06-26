import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, HEADER_BRAND } from "../constants";
import { styles } from "../styles";

type Props = {
  onClose: () => void;
};

export default function UserRateShowHeader({ onClose }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <FontAwesome5 name="times" size={18} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerBrand}>{HEADER_BRAND}</Text>
      <View style={styles.avatarSmall}>
        <FontAwesome5 name="user" size={12} color={DS.accent} />
      </View>
    </View>
  );
}
