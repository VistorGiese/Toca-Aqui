import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function Header({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <FontAwesome5 name="arrow-left" size={14} color={DS.white} />
        <Text style={styles.brandName}>TOCA AQUI</Text>
      </TouchableOpacity>
      <MaterialCommunityIcons name="guitar-electric" size={22} color={DS.accent} />
    </View>
  );
}
