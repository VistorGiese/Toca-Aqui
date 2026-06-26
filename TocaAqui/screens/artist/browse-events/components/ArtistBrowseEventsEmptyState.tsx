import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { emptyStyles } from "../styles";

export default function ArtistBrowseEventsEmptyState() {
  return (
    <View style={emptyStyles.container}>
      <FontAwesome5 name="guitar" size={36} color={DS.textDis} />
      <Text style={emptyStyles.text}>Nenhuma vaga encontrada</Text>
      <Text style={emptyStyles.subText}>Tente mudar os filtros ou busca</Text>
    </View>
  );
}
