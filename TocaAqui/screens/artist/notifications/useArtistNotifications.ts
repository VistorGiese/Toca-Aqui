import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/http/notificationService";
import { ArtistNotification } from "./types";
import { filterNotificationsByUser } from "./utils";

type NavProp = NativeStackNavigationProp<{ ArtistNotifications: undefined }, "ArtistNotifications">;

export function useArtistNotifications() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<ArtistNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await notificationService.getNotifications();
        setNotifications(filterNotificationsByUser(data, user?.id));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.lida).length,
    [notifications]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    loading,
    refreshing,
    notifications,
    unreadCount,
    refresh,
    goBack,
  };
}
