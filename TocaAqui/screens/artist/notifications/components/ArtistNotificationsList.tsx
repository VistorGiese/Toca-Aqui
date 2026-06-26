import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { DS } from "../constants";
import { ArtistNotification } from "../types";
import ArtistNotificationCard from "./ArtistNotificationCard";
import ArtistNotificationsEmptyState from "./ArtistNotificationsEmptyState";
import { styles } from "../styles";

interface Props {
  notifications: ArtistNotification[];
  refreshing: boolean;
  onRefresh: () => void;
}

export default function ArtistNotificationsList({
  notifications,
  refreshing,
  onRefresh,
}: Props) {
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <ArtistNotificationCard item={item} />}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />
      }
      ListEmptyComponent={<ArtistNotificationsEmptyState />}
    />
  );
}
