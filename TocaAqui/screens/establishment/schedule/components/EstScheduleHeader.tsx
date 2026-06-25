import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onNewGig: () => void;
}

export default function EstScheduleHeader({ onNewGig }: Props) {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerTitle}>Agenda</Text>
      <TouchableOpacity style={styles.newBtn} onPress={onNewGig} activeOpacity={0.85}>
        <FontAwesome5 name="plus" size={11} color={DS.textPrimary} />
        <Text style={styles.newBtnText}>NOVA VAGA</Text>
      </TouchableOpacity>
    </View>
  );
}
