import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { CompositeNavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArtistStackParamList, ArtistTabParamList } from "@/navigation/ArtistNavigator";
import { bandApplicationService } from "@/http/bandApplicationService";
import { contractService } from "@/http/contractService";
import { ScheduleFilter } from "./constants";
import {
  buildCalendarDays,
  filterScheduleItems,
  groupItemsByDate,
  mergeScheduleItems,
  parseGigDate,
  toDateKey,
} from "./utils";
import { ArtistScheduleItem } from "./types";

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<ArtistTabParamList, "ArtistSchedule">,
  NativeStackNavigationProp<ArtistStackParamList>
>;

export function useArtistSchedule() {
  const navigation = useNavigation<NavProp>();

  const [items, setItems] = useState<ArtistScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ScheduleFilter>("proximos");
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [contractsResult, applicationsResult] = await Promise.allSettled([
        contractService.getMyContracts(),
        bandApplicationService.getMyApplications(),
      ]);

      const contracts = contractsResult.status === "fulfilled" ? contractsResult.value : [];
      const applications =
        applicationsResult.status === "fulfilled" ? applicationsResult.value : [];

      setItems(mergeScheduleItems(contracts, applications));
    } catch {
      Alert.alert("Erro", "Não foi possível carregar a agenda.");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const eventDateKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const item of items) {
      keys.add(toDateKey(parseGigDate(item.dataShow)));
    }
    return keys;
  }, [items]);

  const calendarDays = useMemo(
    () => buildCalendarDays(viewYear, viewMonth, eventDateKeys),
    [viewYear, viewMonth, eventDateKeys]
  );

  const filteredItems = useMemo(
    () => filterScheduleItems(items, filter, selectedDateKey),
    [items, filter, selectedDateKey]
  );

  const groups = useMemo(() => groupItemsByDate(filteredItems), [filteredItems]);

  const goToBrowseEvents = useCallback(() => {
    navigation.navigate("BrowseEvents");
  }, [navigation]);

  const handleItemPress = useCallback(
    (item: ArtistScheduleItem) => {
      if (item.kind === "contract" && item.contractId) {
        if (item.statusLabel === "Show confirmado" || item.statusLabel === "Realizado") {
          navigation.navigate("ArtistUpcomingShowDetail", {
            nomeEvento: item.title,
            horarioInicio: item.horarioInicio ?? "",
            horarioFim: item.horarioFim,
            dataShow: item.dataShow,
          });
          return;
        }
        navigation.navigate("ContractDetail", { contractId: item.contractId });
        return;
      }

      if (item.kind === "application") {
        if (item.statusLabel === "Candidatura aceita") {
          navigation.navigate("EventDetailArtist", { eventId: item.eventoId });
          return;
        }
        navigation.navigate("EventDetailArtist", { eventId: item.eventoId });
      }
    },
    [navigation]
  );

  const goToPrevMonth = useCallback(() => {
    setViewMonth((month) => {
      if (month === 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      return month - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((month) => {
      if (month === 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return month + 1;
    });
  }, []);

  const selectDate = useCallback((dateKey: string) => {
    setSelectedDateKey((current) => (current === dateKey ? null : dateKey));
  }, []);

  const clearSelectedDate = useCallback(() => {
    setSelectedDateKey(null);
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  return {
    loading,
    refreshing,
    filter,
    setFilter,
    groups,
    filteredCount: filteredItems.length,
    calendarDays,
    viewYear,
    viewMonth,
    selectedDateKey,
    todayKey: toDateKey(today),
    goToPrevMonth,
    goToNextMonth,
    selectDate,
    clearSelectedDate,
    goToBrowseEvents,
    handleItemPress,
    refresh,
  };
}
