import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

export default function ArtistScheduleEmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <FontAwesome5 name="calendar-alt" size={36} color={DS.textMuted} />
      <Text style={styles.emptyText}>
        Nenhum compromisso encontrado para os filtros selecionados.
      </Text>
    </View>
  );
}
