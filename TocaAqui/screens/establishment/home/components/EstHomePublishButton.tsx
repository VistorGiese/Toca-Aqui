import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onPress: () => void;
}

export default function EstHomePublishButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.publishBtn} onPress={onPress} activeOpacity={0.85}>
      <FontAwesome5 name="plus" size={14} color={DS.textPrimary} style={styles.publishBtnIcon} />
      <Text style={styles.publishBtnText}>PUBLICAR NOVA VAGA</Text>
    </TouchableOpacity>
  );
}
