import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

interface Props {
  isEditing: boolean;
  onCancel: () => void;
}

export default function EstNewGigHeaderSection({ isEditing, onCancel }: Props) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>{isEditing ? "Editar Data" : "Nova Data"}</Text>
        <Text style={styles.subtitle}>Crie uma nova oportunidade para artistas</Text>
      </View>
      <TouchableOpacity onPress={onCancel}>
        <Text style={styles.cancelBtn}>CANCELAR</Text>
      </TouchableOpacity>
    </View>
  );
}
