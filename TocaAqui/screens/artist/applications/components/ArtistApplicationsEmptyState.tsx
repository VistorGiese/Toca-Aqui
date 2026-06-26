import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, EMPTY_MESSAGES } from "../constants";
import { styles } from "../styles";
import { ApplicationTab } from "../types";

interface Props {
  activeTab: ApplicationTab;
}

export default function ArtistApplicationsEmptyState({ activeTab }: Props) {
  return (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="file-alt" size={36} color={DS.textMuted} />
      <Text style={styles.emptyText}>{EMPTY_MESSAGES[activeTab]}</Text>
    </View>
  );
}
