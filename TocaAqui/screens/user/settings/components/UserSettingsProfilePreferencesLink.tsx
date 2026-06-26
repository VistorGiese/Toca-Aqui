import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

type Props = {
  onPress: () => void;
};

export default function UserSettingsProfilePreferencesLink({ onPress }: Props) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionLabelRow}>
        <FontAwesome5 name="user-edit" size={15} color={DS.accent} />
        <Text style={styles.sectionLabel}>PERFIL E PREFERÊNCIAS</Text>
      </View>

      <TouchableOpacity
        style={styles.profileActionCard}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={[styles.profileActionIcon, { backgroundColor: "rgba(167,139,250,0.18)" }]}>
          <FontAwesome5 name="edit" size={18} color={DS.accent} />
        </View>
        <View style={styles.profileActionInfo}>
          <Text style={styles.profileActionTitle}>Editar perfil</Text>
          <Text style={styles.profileActionSubtitle}>
            Foto, gêneros favoritos, localização e notificações
          </Text>
        </View>
        <FontAwesome5 name="chevron-right" size={12} color={DS.textDis} />
      </TouchableOpacity>
    </View>
  );
}
