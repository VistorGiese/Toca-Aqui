import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function UserArtistProfileBottomBar({ onBack }: Props) {
  return (
    <View style={styles.stickyBottom}>
      <TouchableOpacity style={styles.backBottomBtn} onPress={onBack} activeOpacity={0.85}>
        <FontAwesome5 name="arrow-left" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.backBottomBtnText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
}
