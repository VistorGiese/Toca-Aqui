import React from "react";
import { StatusBar, View } from "react-native";
import {
  EstGigApplicationsClosedBanner,
  EstGigApplicationsHeader,
  EstGigApplicationsList,
  EstGigApplicationsLoadingState,
  EstGigApplicationsTabsSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstGigApplications } from "./useEstGigApplications";

export default function EstGigApplications() {
  const vm = useEstGigApplications();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstGigApplicationsHeader
        gigTitle={vm.gigTitle}
        onBack={vm.goBack}
        onNotifications={vm.goToNotifications}
      />

      {vm.eventClosed ? <EstGigApplicationsClosedBanner message={vm.closedMessage} /> : null}

      <EstGigApplicationsTabsSection tab={vm.tab} onChange={vm.setTab} />

      {vm.loading ? (
        <EstGigApplicationsLoadingState />
      ) : (
        <EstGigApplicationsList
          candidates={vm.filteredCandidates}
          eventClosed={vm.eventClosed}
          openingContract={vm.openingContract}
          refreshing={vm.refreshing}
          onRefresh={vm.refresh}
          onViewProfile={vm.openProfile}
          onReview={vm.navigateToReview}
          onViewContract={vm.openContract}
        />
      )}
    </View>
  );
}
