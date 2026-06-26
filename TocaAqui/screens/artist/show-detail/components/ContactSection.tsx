import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { ShowDetailDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  responsavel: NonNullable<ShowDetailDisplay["responsavel"]>;
  onCall: () => void;
  onMessage: () => void;
  onProfile: () => void;
}

export default function ContactSection({
  responsavel,
  onCall,
  onMessage,
  onProfile,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Contato do Responsável</Text>
      <View style={styles.contactCard}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactAvatarText}>{responsavel.initial}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{responsavel.nome}</Text>
          <Text style={styles.contactRole}>{responsavel.cargo}</Text>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.contactActionBtn} onPress={onCall}>
            <FontAwesome5 name="phone" size={14} color={DS.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactActionBtn} onPress={onMessage}>
            <FontAwesome5 name="comment" size={14} color={DS.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactActionBtn} onPress={onProfile}>
            <FontAwesome5 name="user" size={14} color={DS.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
