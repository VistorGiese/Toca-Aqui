import React from "react";
import { TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  onClose: () => void;
}

export default function RegisterHeader({ onClose }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialCommunityIcons name="close" size={22} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.headerSpacer} />
    </View>
  );
}
