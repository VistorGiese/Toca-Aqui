import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { Booking } from "@/http/bookingService";
import { BandApplication } from "@/http/bandApplicationService";
import { DS } from "../constants";
import { styles } from "../styles";
import ArtistBrowseEventsBookingCard from "./ArtistBrowseEventsBookingCard";
import ArtistBrowseEventsEmptyState from "./ArtistBrowseEventsEmptyState";
import ArtistBrowseEventsListHeader from "./ArtistBrowseEventsListHeader";

interface Props {
  bookings: Booking[];
  applicationStatusByEvent: Record<number, BandApplication["status"]>;
  refreshing: boolean;
  onRefresh: () => void;
  onBookingPress: (eventId: number) => void;
}

export default function ArtistBrowseEventsList({
  bookings,
  applicationStatusByEvent,
  refreshing,
  onRefresh,
  onBookingPress,
}: Props) {
  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={<ArtistBrowseEventsListHeader count={bookings.length} />}
      renderItem={({ item }) => (
        <ArtistBrowseEventsBookingCard
          booking={item}
          applicationStatus={applicationStatusByEvent[item.id]}
          onPress={() => onBookingPress(item.id)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DS.accent} />
      }
      ListEmptyComponent={<ArtistBrowseEventsEmptyState />}
    />
  );
}
