import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { headerStyles } from "../styles";

type Props = {
  onBack: () => void;
};

export default function UserSettingsHeader({ onBack }: Props) {
  return (
    <View style={headerStyles.header}>
      <TouchableOpacity style={headerStyles.backBtn} onPress={onBack}>
        <FontAwesome5 name="chevron-left" size={14} color={DS.accent} />
      </TouchableOpacity>
      <Text style={headerStyles.headerBrand}>TOCA AQUI</Text>
      <FontAwesome5 name="cog" size={18} color={DS.accent} />
    </View>
  );
}
