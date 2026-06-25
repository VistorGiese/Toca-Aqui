import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { Candidatura } from "@/http/establishmentService";
import { DS } from "../constants";
import EstGigApplicationsCandidateCard from "./EstGigApplicationsCandidateCard";
import EstGigApplicationsEmptyState from "./EstGigApplicationsEmptyState";
import { styles } from "../styles";

interface Props {
  candidates: Candidatura[];
  eventClosed: boolean;
  openingContract: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onViewProfile: (candidate: Candidatura) => void;
  onReview: (candidate: Candidatura) => void;
  onViewContract: (candidate: Candidatura) => void;
}

export default function EstGigApplicationsList({
  candidates,
  eventClosed,
  openingContract,
  refreshing,
  onRefresh,
  onViewProfile,
  onReview,
  onViewContract,
}: Props) {
  return (
    <FlatList
      data={candidates}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <EstGigApplicationsCandidateCard
          candidate={item}
          eventClosed={eventClosed}
          openingContract={openingContract}
          onViewProfile={onViewProfile}
          onReview={onReview}
          onViewContract={onViewContract}
        />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />
      }
      ListEmptyComponent={<EstGigApplicationsEmptyState />}
      showsVerticalScrollIndicator={false}
    />
  );
}
