import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { ArtistPublicProfile } from "@/http/establishmentService";
import { DS } from "../constants";
import EstSearchArtistCard from "./EstSearchArtistCard";
import EstSearchEmptyState from "./EstSearchEmptyState";
import { styles } from "../styles";

interface Props {
  artists: ArtistPublicProfile[];
  refreshing: boolean;
  onRefresh: () => void;
  onArtistPress: (artist: ArtistPublicProfile) => void;
}

export default function EstSearchList({
  artists,
  refreshing,
  onRefresh,
  onArtistPress,
}: Props) {
  return (
    <FlatList
      data={artists}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <EstSearchArtistCard artist={item} onPress={onArtistPress} />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />
      }
      ListEmptyComponent={<EstSearchEmptyState />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}
