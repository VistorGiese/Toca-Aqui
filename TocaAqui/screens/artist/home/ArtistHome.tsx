import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  ArtistHomeAnalyticsSection,
  ArtistHomeGreetingSection,
  ArtistHomeHeaderSection,
  ArtistHomeLoadingState,
  ArtistHomeMetricsSection,
  ArtistHomeRecentContractsSection,
  ArtistHomeRecommendedSection,
  ArtistHomeUpcomingShowsSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useArtistHome } from "./useArtistHome";

export default function ArtistHome() {
  const vm = useArtistHome();

  if (vm.loading) {
    return <ArtistHomeLoadingState />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ArtistHomeHeaderSection onNotifications={vm.goToNotifications} />
        <ArtistHomeGreetingSection greetingName={vm.greetingName} />
        <ArtistHomeMetricsSection metrics={vm.metrics} />
        <ArtistHomeAnalyticsSection metrics={vm.metrics} />

        <ArtistHomeUpcomingShowsSection
          shows={vm.upcomingShows}
          onViewAll={vm.goToAllConfirmed}
          onShowPress={vm.goToShowDetail}
        />

        <ArtistHomeRecommendedSection
          artists={vm.artists}
          establishments={vm.establishments}
          loading={vm.loadingRecommended}
          onArtistPress={vm.goToArtistProfile}
          onEstablishmentPress={vm.goToEstablishment}
        />

        <ArtistHomeRecentContractsSection
          contracts={vm.recentContracts}
          onContractPress={vm.goToContractDetail}
          onBrowseEvents={vm.goToBrowseEvents}
        />
      </ScrollView>
    </View>
  );
}
