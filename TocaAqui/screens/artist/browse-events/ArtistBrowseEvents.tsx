import React from "react";
import { View } from "react-native";
import {
  ArtistBrowseEventsFilterTabs,
  ArtistBrowseEventsHeader,
  ArtistBrowseEventsList,
  ArtistBrowseEventsLoadingState,
  ArtistBrowseEventsSearchSection,
} from "./components";
import { styles } from "./styles";
import { useArtistBrowseEvents } from "./useArtistBrowseEvents";

export default function ArtistBrowseEvents() {
  const vm = useArtistBrowseEvents();

  if (vm.loading) {
    return <ArtistBrowseEventsLoadingState />;
  }

  return (
    <View style={styles.root}>
      <ArtistBrowseEventsHeader onNotifications={vm.goToNotifications} />
      <ArtistBrowseEventsSearchSection value={vm.searchText} onChange={vm.setSearchText} />
      <ArtistBrowseEventsFilterTabs activeTab={vm.activeTab} onChange={vm.setActiveTab} />
      <ArtistBrowseEventsList
        bookings={vm.filteredBookings}
        applicationStatusByEvent={vm.applicationStatusByEvent}
        refreshing={vm.refreshing}
        onRefresh={vm.refresh}
        onBookingPress={vm.goToEventDetail}
      />
    </View>
  );
}
