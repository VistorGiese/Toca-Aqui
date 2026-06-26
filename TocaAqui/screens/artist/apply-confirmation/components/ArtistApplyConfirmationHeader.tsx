import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { HELP_MESSAGE, DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function ArtistApplyConfirmationHeader({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <FontAwesome5 name="arrow-left" size={14} color={DS.white} />
        <Text style={styles.headerTitle}>Confirmar Candidatura</Text>
      </TouchableOpacity>
      <TouchableOpacity
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => Alert.alert("Ajuda", HELP_MESSAGE)}
      >
        <FontAwesome5 name="ellipsis-v" size={16} color={DS.white} />
      </TouchableOpacity>
    </View>
  );
}
