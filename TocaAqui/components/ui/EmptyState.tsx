import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/utils/colors";

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  text: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: colors.textTertiary,
  },
});
