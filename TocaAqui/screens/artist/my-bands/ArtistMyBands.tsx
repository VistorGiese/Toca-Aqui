import React from "react";
import { View } from "react-native";
import {
  ArtistMyBandsHeader,
  ArtistMyBandsList,
  ArtistMyBandsLoadingState,
} from "./components";
import { styles } from "./styles";
import { useArtistMyBands } from "./useArtistMyBands";

export default function ArtistMyBands() {
  const vm = useArtistMyBands();

  if (vm.loading) {
    return <ArtistMyBandsLoadingState />;
  }

  return (
    <View style={styles.root}>
      <ArtistMyBandsHeader onBack={vm.goBack} onCreate={vm.goToCreateBand} />
      <ArtistMyBandsList
        bands={vm.bands}
        refreshing={vm.refreshing}
        onRefresh={vm.refresh}
        onBandPress={vm.goToBandDetail}
        onCreate={vm.goToCreateBand}
      />
    </View>
  );
}
