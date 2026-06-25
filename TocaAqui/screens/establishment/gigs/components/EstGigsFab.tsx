import React from "react";
import { TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onPress: () => void;
}

export default function EstGigsFab({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <FontAwesome5 name="plus" size={20} color={DS.textPrimary} />
    </TouchableOpacity>
  );
}
