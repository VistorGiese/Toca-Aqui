import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  EstHomeGreetingSection,
  EstHomeHeaderSection,
  EstHomeLoadingState,
  EstHomeMetricsSection,
  EstHomePublishButton,
  EstHomeRecommendedSection,
  EstHomeUpcomingShowsSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstHome } from "./useEstHome";

export default function EstHome() {
  const vm = useEstHome();

  if (vm.loading) {
    return <EstHomeLoadingState />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <EstHomeHeaderSection
          headerName={vm.headerName}
          onNotifications={vm.goToNotifications}
        />

        <EstHomeGreetingSection greetingName={vm.greetingName} />

        <EstHomeMetricsSection metrics={vm.metrics} />

        <EstHomePublishButton onPress={vm.goToNewGig} />

        <EstHomeUpcomingShowsSection
          shows={vm.upcomingShows}
          onViewAll={vm.goToAllConfirmed}
          onShowPress={vm.goToShowDetail}
        />

        <EstHomeRecommendedSection
          artists={vm.artists}
          establishments={vm.establishments}
          loading={vm.loadingRecommended}
          onArtistPress={vm.goToArtistProfile}
          onEstablishmentPress={vm.goToEstablishmentProfile}
        />
      </ScrollView>
    </View>
  );
}
