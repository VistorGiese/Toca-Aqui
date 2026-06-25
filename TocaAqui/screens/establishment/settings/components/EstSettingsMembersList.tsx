import React from "react";
import { FlatList } from "react-native";
import { EstablishmentMember } from "@/http/establishmentService";
import EstSettingsEmptyState from "./EstSettingsEmptyState";
import EstSettingsMemberCard from "./EstSettingsMemberCard";
import { styles } from "../styles";

interface Props {
  members: EstablishmentMember[];
  onRemove: (member: EstablishmentMember) => void;
}

export default function EstSettingsMembersList({ members, onRemove }: Props) {
  return (
    <FlatList
      data={members}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <EstSettingsMemberCard member={item} onRemove={onRemove} />
      )}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<EstSettingsEmptyState />}
      showsVerticalScrollIndicator={false}
    />
  );
}
