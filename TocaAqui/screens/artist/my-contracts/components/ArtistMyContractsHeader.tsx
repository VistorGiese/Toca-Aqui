import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  onLogout: () => void;
}

export default function ArtistMyContractsHeader({ onLogout }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        MEUS <Text style={styles.headerTitleAccent}>CONTRATOS</Text>
      </Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
        <FontAwesome5 name="sign-out-alt" size={16} color="#E53E3E" />
      </TouchableOpacity>
    </View>
  );
}
