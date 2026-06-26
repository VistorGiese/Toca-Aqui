import React from "react";
import { StatusBar, View } from "react-native";
import { UserNotificationsEmptyState, UserNotificationsHeader } from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useUserNotifications } from "./useUserNotifications";

export default function UserNotifications() {
  const vm = useUserNotifications();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <UserNotificationsHeader onBack={vm.goBack} />
      <UserNotificationsEmptyState />
    </View>
  );
}
