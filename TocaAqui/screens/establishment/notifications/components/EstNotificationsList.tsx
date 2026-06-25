import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { DS } from "../constants";
import { EstNotification } from "../types";
import EstNotificationCard from "./EstNotificationCard";
import EstNotificationsEmptyState from "./EstNotificationsEmptyState";
import { styles } from "../styles";

interface Props {
  notifications: EstNotification[];
  refreshing: boolean;
  onRefresh: () => void;
}

export default function EstNotificationsList({ notifications, refreshing, onRefresh }: Props) {
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <EstNotificationCard item={item} />}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />
      }
      ListEmptyComponent={<EstNotificationsEmptyState />}
    />
  );
}
