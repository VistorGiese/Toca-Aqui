import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function EstEditProfileHeader({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <FontAwesome5 name="chevron-left" size={14} color="#7B61FF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Editar Perfil</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}
