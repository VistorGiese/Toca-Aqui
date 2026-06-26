import React from "react";
import { StatusBar, View } from "react-native";
import {
  ArtistNotificationsHeader,
  ArtistNotificationsList,
  ArtistNotificationsLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useArtistNotifications } from "./useArtistNotifications";

export default function ArtistNotifications() {
  const vm = useArtistNotifications();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <ArtistNotificationsHeader unreadCount={vm.unreadCount} onBack={vm.goBack} />

      {vm.loading ? (
        <ArtistNotificationsLoadingState />
      ) : (
        <ArtistNotificationsList
          notifications={vm.notifications}
          refreshing={vm.refreshing}
          onRefresh={vm.refresh}
        />
      )}
    </View>
  );
}
