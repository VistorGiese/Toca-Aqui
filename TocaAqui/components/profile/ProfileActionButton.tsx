import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/utils/colors";

interface ProfileActionButtonProps {
  onPress: () => void;
}

export default function ProfileActionButton({ onPress }: ProfileActionButtonProps) {
  return (
    <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onPress}>
      <FontAwesome5 name="cog" size={14} color={colors.purpleLight} style={styles.icon} />
      <Text style={styles.label}>EDITAR PREFERÊNCIAS MUSICAIS</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.purpleLight,
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 24,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: colors.purpleLight,
    letterSpacing: 1,
  },
});
