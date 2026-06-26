import React from "react";
import { ScrollView, View } from "react-native";
import {
  ArtistEventDetailApplyButton,
  ArtistEventDetailDescriptionSection,
  ArtistEventDetailDetailsSection,
  ArtistEventDetailHeader,
  ArtistEventDetailHeroSection,
  ArtistEventDetailInfoGrid,
  ArtistEventDetailLoadingState,
  ArtistEventDetailOverviewSection,
  ArtistEventDetailReviewsSection,
  ArtistEventDetailVenueSection,
} from "./components";
import { styles } from "./styles";
import { useArtistEventDetail } from "./useArtistEventDetail";

export default function ArtistEventDetail() {
  const vm = useArtistEventDetail();

  if (vm.loading) {
    return <ArtistEventDetailLoadingState />;
  }

  if (!vm.booking || !vm.display) return null;

  const fallbackVenue = vm.booking.estabelecimento_id
    ? `Estabelecimento #${vm.booking.estabelecimento_id}`
    : undefined;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ArtistEventDetailHeader onBack={vm.goBack} />
        <ArtistEventDetailHeroSection display={vm.display} />

        <View style={styles.contentPad}>
          <ArtistEventDetailOverviewSection display={vm.display} fallbackVenue={fallbackVenue} />
          <ArtistEventDetailInfoGrid display={vm.display} />
          <ArtistEventDetailDetailsSection display={vm.display} />

          {vm.display.description ? (
            <ArtistEventDetailDescriptionSection description={vm.display.description} />
          ) : null}

          <ArtistEventDetailVenueSection venueDescription={vm.display.venueDescription} />
          <ArtistEventDetailReviewsSection avaliacoes={vm.avaliacoes} />
        </View>
      </ScrollView>

      <ArtistEventDetailApplyButton onPress={vm.handleCandidatar} />
    </View>
  );
}
