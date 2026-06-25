import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EstablishmentMember } from "@/http/establishmentService";
import { DS } from "../constants";
import { getMemberInitial } from "../utils";
import { styles } from "../styles";

interface Props {
  member: EstablishmentMember;
  onRemove: (member: EstablishmentMember) => void;
}

export default function EstSettingsMemberCard({ member, onRemove }: Props) {
  const isOwner = member.role === "owner";

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getMemberInitial(member.nome_completo)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{member.nome_completo}</Text>
        <Text style={styles.email}>{member.email}</Text>
      </View>
      <View style={styles.rightCol}>
        <View style={[styles.badge, isOwner ? styles.badgeOwner : styles.badgeAdmin]}>
          <Text style={styles.badgeText}>{isOwner ? "Dono" : "Admin"}</Text>
        </View>
        {!isOwner ? (
          <TouchableOpacity onPress={() => onRemove(member)} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={18} color={DS.danger} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
