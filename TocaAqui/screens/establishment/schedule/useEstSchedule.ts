import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import {
  confirmedGigToShow,
  enrichGigWithAcceptedArtist,
  Gig,
  isGigAberta,
  isGigConfirmada,
  establishmentService,
} from "@/http/establishmentService";
import { showToDetailParams } from "@/http/showService";
import { ScheduleFilter } from "./constants";
import {
  buildCalendarDays,
  filterGigs,
  groupGigsByDate,
  parseGigDate,
  toDateKey,
} from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList>;

export function useEstSchedule() {
  const navigation = useNavigation<NavProp>();

  const [gigs, setGigs] = useState<Gig[]>([]);
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
      const storedId = await AsyncStorage.getItem("estabelecimentoId");
      const estId = storedId ? Number(storedId) : undefined;
      const data = await establishmentService.getMyGigs(
        estId ? { estabelecimentoId: estId } : undefined
      );
      setGigs(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar a agenda.");
      setGigs([]);
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
    for (const gig of gigs) {
      keys.add(toDateKey(parseGigDate(gig.data_show)));
    }
    return keys;
  }, [gigs]);

  const calendarDays = useMemo(
    () => buildCalendarDays(viewYear, viewMonth, eventDateKeys),
    [viewYear, viewMonth, eventDateKeys]
  );

  const filteredGigs = useMemo(
    () => filterGigs(gigs, filter, selectedDateKey),
    [gigs, filter, selectedDateKey]
  );

  const groups = useMemo(() => groupGigsByDate(filteredGigs), [filteredGigs]);

  const goToNewGig = useCallback(() => {
    navigation.navigate("EstNewGig", {});
  }, [navigation]);

  const handleGigPress = useCallback(
    async (gig: Gig) => {
      if (isGigConfirmada(gig.status)) {
        try {
          const enriched = await enrichGigWithAcceptedArtist(gig);
          const show = confirmedGigToShow(enriched, null);
          navigation.navigate("EstUpcomingShowDetail", showToDetailParams(show));
        } catch {
          navigation.navigate("EstUpcomingShowDetail", {
            nomeEvento: gig.titulo_evento,
            horarioInicio: gig.horario_inicio,
            horarioFim: gig.horario_fim,
            dataShow: gig.data_show,
          });
        }
        return;
      }

      if (gig.status === "rascunho") {
        navigation.navigate("EstNewGig", { gigId: gig.id });
        return;
      }

      if (isGigAberta(gig.status) || gig.status === "encerrada" || gig.status === "realizado") {
        navigation.navigate("EstGigApplications", {
          gigId: gig.id,
          gigTitle: gig.titulo_evento,
        });
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
    filteredCount: filteredGigs.length,
    calendarDays,
    viewYear,
    viewMonth,
    selectedDateKey,
    todayKey: toDateKey(today),
    goToPrevMonth,
    goToNextMonth,
    selectDate,
    clearSelectedDate,
    goToNewGig,
    handleGigPress,
    refresh,
  };
}
