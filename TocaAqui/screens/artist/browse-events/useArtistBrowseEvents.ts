import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { bookingService, Booking } from "@/http/bookingService";
import { bandApplicationService } from "@/http/bandApplicationService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { FilterTab, ApplicationStatusMap } from "./types";
import { buildApplicationStatusMap, filterBookings } from "./utils";

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;

export function useArtistBrowseEvents() {
  const navigation = useNavigation<NavProp>();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [applicationStatusByEvent, setApplicationStatusByEvent] = useState<ApplicationStatusMap>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("TODOS");

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [data, myApplications] = await Promise.all([
        bookingService.getBookings({ status: "pendente" }),
        bandApplicationService.getMyApplications().catch(() => []),
      ]);
      setBookings(data);
      setApplicationStatusByEvent(buildApplicationStatusMap(myApplications));
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as vagas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const filteredBookings = useMemo(
    () => filterBookings(bookings, searchText, activeTab),
    [bookings, searchText, activeTab]
  );

  const goToNotifications = useCallback(() => {
    const stackNav = navigation.getParent<NativeStackNavigationProp<ArtistStackParamList>>();
    if (stackNav) {
      stackNav.navigate("ArtistNotifications");
      return;
    }
    navigation.navigate("ArtistNotifications");
  }, [navigation]);

  const goToEventDetail = useCallback(
    (eventId: number) => {
      navigation.navigate("EventDetailArtist", { eventId });
    },
    [navigation]
  );

  const refresh = useCallback(() => {
    fetchBookings(true);
  }, [fetchBookings]);

  return {
    loading,
    refreshing,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    filteredBookings,
    applicationStatusByEvent,
    goToNotifications,
    goToEventDetail,
    refresh,
  };
}
