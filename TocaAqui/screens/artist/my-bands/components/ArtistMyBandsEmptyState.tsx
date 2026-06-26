import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { EMPTY_STATE } from "../constants";
import { styles } from "../styles";

interface Props {
  onCreate: () => void;
}

export default function ArtistMyBandsEmptyState({ onCreate }: Props) {
  return (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="guitar" size={52} color="#555577" />
      <Text style={styles.emptyTitle}>{EMPTY_STATE.title}</Text>
      <Text style={styles.emptyText}>{EMPTY_STATE.description}</Text>
      <TouchableOpacity style={styles.createButton} onPress={onCreate}>
        <FontAwesome5 name="plus" size={14} color="#FFFFFF" />
        <Text style={styles.createButtonText}>{EMPTY_STATE.button}</Text>
      </TouchableOpacity>
    </View>
  );
}
