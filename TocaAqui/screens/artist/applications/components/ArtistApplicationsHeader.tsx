import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function ArtistApplicationsHeader({ onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <FontAwesome5 name="arrow-left" size={16} color={DS.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Minhas candidaturas</Text>
      <View style={styles.headerSpacer}>
        <FontAwesome5 name="ellipsis-v" size={16} color={DS.white} />
      </View>
    </View>
  );
}
