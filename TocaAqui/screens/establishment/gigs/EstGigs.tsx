import React from "react";
import { StatusBar, View } from "react-native";
import {
  EstGigsFab,
  EstGigsHeader,
  EstGigsList,
  EstGigsLoadingState,
  EstGigsTabsSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstGigs } from "./useEstGigs";

export default function EstGigs() {
  const vm = useEstGigs();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstGigsHeader headerName={vm.headerName} onNotifications={vm.goToNotifications} />
      <EstGigsTabsSection tab={vm.tab} onChange={vm.setTab} />

      {vm.loading ? (
        <EstGigsLoadingState />
      ) : (
        <EstGigsList
          gigs={vm.filteredGigs}
          refreshing={vm.refreshing}
          onRefresh={vm.refresh}
          onGigPress={vm.goToApplications}
          onGigOptions={vm.showGigOptions}
        />
      )}

      <EstGigsFab onPress={vm.goToNewGig} />
    </View>
  );
}
