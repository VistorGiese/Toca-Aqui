import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/utils/colors";

interface FeedSearchBarProps {
  onPress: () => void;
}

export default function FeedSearchBar({ onPress }: FeedSearchBarProps) {
  return (
    <TouchableOpacity style={styles.searchBar} onPress={onPress} activeOpacity={0.8}>
      <FontAwesome5 name="search" size={14} color={colors.textTertiary} style={styles.leftIcon} />
      <Text style={styles.placeholder}>Buscar artistas, locais ou vibes...</Text>
      <FontAwesome5 name="sliders-h" size={14} color={colors.purpleLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceBorder,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorderStrong,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
  },
  leftIcon: {
    marginRight: 10,
  },
  placeholder: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: colors.textTertiary,
  },
});
