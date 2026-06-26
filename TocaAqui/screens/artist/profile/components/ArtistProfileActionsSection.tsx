import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onSwitchProfile: () => void;
  onSignOut: () => void;
}

export default function ArtistProfileActionsSection({ onSwitchProfile, onSignOut }: Props) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.switchProfileBtn} onPress={onSwitchProfile} activeOpacity={0.8}>
        <Ionicons name="person-outline" size={18} color={DS.cyan} />
        <Text style={styles.switchProfileText}>Voltar para Perfil Comum</Text>
        <Ionicons name="chevron-forward" size={16} color={DS.cyan} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut} activeOpacity={0.85}>
        <FontAwesome5 name="sign-out-alt" size={16} color="#FF6B6B" style={styles.signOutIcon} />
        <Text style={styles.signOutText}>SAIR DA CONTA</Text>
      </TouchableOpacity>
    </View>
  );
}
