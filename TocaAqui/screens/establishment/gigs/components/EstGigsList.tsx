import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { Gig } from "@/http/establishmentService";
import { DS } from "../constants";
import EstGigsEmptyState from "./EstGigsEmptyState";
import EstGigsGigCard from "./EstGigsGigCard";
import { styles } from "../styles";

interface Props {
  gigs: Gig[];
  refreshing: boolean;
  onRefresh: () => void;
  onGigPress: (gig: Gig) => void;
  onGigOptions: (gig: Gig) => void;
}

export default function EstGigsList({
  gigs,
  refreshing,
  onRefresh,
  onGigPress,
  onGigOptions,
}: Props) {
  return (
    <FlatList
      data={gigs}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <EstGigsGigCard gig={item} onPress={onGigPress} onOptions={onGigOptions} />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />
      }
      ListEmptyComponent={<EstGigsEmptyState />}
      showsVerticalScrollIndicator={false}
    />
  );
}
