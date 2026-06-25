import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function UserEstablishmentProfileBottomBar({ onBack }: Props) {
  return (
    <View style={styles.stickyBottom}>
      <TouchableOpacity style={styles.backBottomBtn} onPress={onBack} activeOpacity={0.85}>
        <FontAwesome5
          name="arrow-left"
          size={14}
          color={DS.textPrimary}
          style={styles.backBottomBtnIcon}
        />
        <Text style={styles.backBottomBtnText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
}
