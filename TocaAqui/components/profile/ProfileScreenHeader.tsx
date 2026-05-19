import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/utils/colors";

interface ProfileScreenHeaderProps {
  onSettingsPress: () => void;
}

export default function ProfileScreenHeader({ onSettingsPress }: ProfileScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.avatarSmall}>
        <FontAwesome5 name="user" size={13} color={colors.purpleLight} />
      </View>
      <Text style={styles.headerBrand}>TOCA AQUI</Text>
      <TouchableOpacity onPress={onSettingsPress}>
        <FontAwesome5 name="cog" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentSoftBg,
    borderWidth: 1,
    borderColor: colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrand: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: colors.purpleLight,
    letterSpacing: 2,
  },
});
