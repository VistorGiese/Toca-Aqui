import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS, SCREEN_SUBTITLE, SCREEN_TITLE } from "../constants";
import { styles } from "../styles";

interface Props {
  onAdd: () => void;
}

export default function EstSettingsHeaderSection({ onAdd }: Props) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{SCREEN_TITLE}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Ionicons name="person-add-outline" size={18} color={DS.accent} />
          <Text style={styles.addBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{SCREEN_SUBTITLE}</Text>
    </>
  );
}
