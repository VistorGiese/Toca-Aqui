import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { DS } from "../constants";
import { styles } from "../styles";
import { Band } from "../types";
import ArtistMyBandsBandCard from "./ArtistMyBandsBandCard";
import ArtistMyBandsEmptyState from "./ArtistMyBandsEmptyState";

interface Props {
  bands: Band[];
  refreshing: boolean;
  onRefresh: () => void;
  onBandPress: (bandId: number) => void;
  onCreate: () => void;
}

export default function ArtistMyBandsList({
  bands,
  refreshing,
  onRefresh,
  onBandPress,
  onCreate,
}: Props) {
  return (
    <FlatList
      data={bands}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ArtistMyBandsBandCard band={item} onPress={onBandPress} />
      )}
      ListEmptyComponent={<ArtistMyBandsEmptyState onCreate={onCreate} />}
      contentContainerStyle={[
        styles.listContent,
        bands.length === 0 && styles.emptyList,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={DS.accent}
          colors={[DS.accent]}
        />
      }
    />
  );
}
