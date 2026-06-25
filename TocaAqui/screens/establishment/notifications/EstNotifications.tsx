import React from "react";
import { StatusBar, View } from "react-native";
import {
  EstNotificationsHeader,
  EstNotificationsList,
  EstNotificationsLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstNotifications } from "./useEstNotifications";

export default function EstNotifications() {
  const vm = useEstNotifications();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstNotificationsHeader unreadCount={vm.unreadCount} onBack={vm.goBack} />

      {vm.loading ? (
        <EstNotificationsLoadingState />
      ) : (
        <EstNotificationsList
          notifications={vm.notifications}
          refreshing={vm.refreshing}
          onRefresh={vm.refresh}
        />
      )}
    </View>
  );
}
