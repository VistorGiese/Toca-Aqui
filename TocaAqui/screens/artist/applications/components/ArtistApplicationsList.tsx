import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { BandApplication } from "@/http/bandApplicationService";
import { DS } from "../constants";
import { styles } from "../styles";
import { ApplicationTab } from "../types";
import ArtistApplicationsEmptyState from "./ArtistApplicationsEmptyState";
import ArtistApplicationsItemCard from "./ArtistApplicationsItemCard";

interface Props {
  applications: BandApplication[];
  activeTab: ApplicationTab;
  refreshing: boolean;
  onRefresh: () => void;
  onViewContract: (contractId: number) => void;
}

export default function ArtistApplicationsList({
  applications,
  activeTab,
  refreshing,
  onRefresh,
  onViewContract,
}: Props) {
  return (
    <FlatList
      data={applications}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ArtistApplicationsItemCard application={item} onViewContract={onViewContract} />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />
      }
      ListEmptyComponent={<ArtistApplicationsEmptyState activeTab={activeTab} />}
    />
  );
}
