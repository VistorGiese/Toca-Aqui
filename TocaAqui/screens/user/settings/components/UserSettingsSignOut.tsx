import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

type Props = {
  onPress: () => void;
};

export default function UserSettingsSignOut({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.signOutBtn} onPress={onPress} activeOpacity={0.85}>
      <FontAwesome5
        name="sign-out-alt"
        size={16}
        color={DS.danger}
        style={{ marginRight: 10 }}
      />
      <Text style={styles.signOutText}>SAIR DA CONTA</Text>
    </TouchableOpacity>
  );
}
