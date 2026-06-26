import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function ArtistContractDetailHeader({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <FontAwesome5 name="arrow-left" size={18} color={DS.white} />
      </TouchableOpacity>
      <Text style={styles.brandName}>TOCA AQUI</Text>
      <FontAwesome5 name="music" size={18} color={DS.accent} />
    </View>
  );
}
