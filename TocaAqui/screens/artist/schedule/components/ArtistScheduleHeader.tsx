import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBrowseEvents: () => void;
}

export default function ArtistScheduleHeader({ onBrowseEvents }: Props) {
  return (
    <View style={styles.headerTop}>
      <Text style={styles.headerTitle}>Agenda</Text>
      <TouchableOpacity style={styles.browseBtn} onPress={onBrowseEvents} activeOpacity={0.85}>
        <FontAwesome5 name="search" size={11} color={DS.textPrimary} />
        <Text style={styles.browseBtnText}>BUSCAR VAGAS</Text>
      </TouchableOpacity>
    </View>
  );
}
