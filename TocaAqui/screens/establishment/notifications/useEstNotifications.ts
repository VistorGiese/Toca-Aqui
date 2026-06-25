import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";
import { useAuth } from "@/contexts/AuthContext";
import { EstNotification } from "./types";
import { filterNotificationsByUser } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList, "EstNotifications">;

export function useEstNotifications() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<EstNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await establishmentService.getNotifications(user?.id);
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

  return {
    loading,
    refreshing,
    notifications,
    unreadCount,
    refresh,
    goBack: () => navigation.goBack(),
  };
}
