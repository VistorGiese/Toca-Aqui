import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/utils/colors";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: colors.white,
  },
  action: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: colors.purpleLight,
    letterSpacing: 1,
  },
});
