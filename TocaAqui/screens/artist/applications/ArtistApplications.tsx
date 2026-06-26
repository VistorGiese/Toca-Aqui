import React from "react";
import { View } from "react-native";
import {
  ArtistApplicationsHeader,
  ArtistApplicationsList,
  ArtistApplicationsLoadingState,
  ArtistApplicationsTabsSection,
} from "./components";
import { styles } from "./styles";
import { useArtistApplications } from "./useArtistApplications";

export default function ArtistApplications() {
  const vm = useArtistApplications();

  if (vm.loading) {
    return <ArtistApplicationsLoadingState />;
  }

  return (
    <View style={styles.root}>
      <ArtistApplicationsHeader onBack={vm.goBack} />
      <ArtistApplicationsTabsSection activeTab={vm.activeTab} onChange={vm.setActiveTab} />
      <ArtistApplicationsList
        applications={vm.filtered}
        activeTab={vm.activeTab}
        refreshing={vm.refreshing}
        onRefresh={vm.refresh}
        onViewContract={vm.goToContract}
      />
    </View>
  );
}
