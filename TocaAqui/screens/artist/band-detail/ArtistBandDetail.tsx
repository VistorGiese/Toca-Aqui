import React from "react";
import { ScrollView, View } from "react-native";
import {
  ArtistBandDetailContent,
  ArtistBandDetailHero,
  ArtistBandDetailLoadingState,
  ArtistBandDetailOverlayButtons,
} from "./components";
import { styles } from "./styles";
import { useArtistBandDetail } from "./useArtistBandDetail";

export default function ArtistBandDetail() {
  const vm = useArtistBandDetail();

  if (vm.loading || !vm.band) {
    return <ArtistBandDetailLoadingState />;
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ArtistBandDetailHero band={vm.band} />
        <ArtistBandDetailOverlayButtons onBack={vm.goBack} onHome={vm.goHome} />
        <ArtistBandDetailContent band={vm.band} onEdit={vm.goToEdit} />
      </ScrollView>
    </View>
  );
}
