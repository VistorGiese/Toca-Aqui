import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import ArtistProfileAboutSection from "./components/ArtistProfileAboutSection";
import ArtistProfileActionsSection from "./components/ArtistProfileActionsSection";
import ArtistProfileCacheSection from "./components/ArtistProfileCacheSection";
import ArtistProfileChipSection from "./components/ArtistProfileChipSection";
import ArtistProfileHeroSection from "./components/ArtistProfileHeroSection";
import ArtistProfileIdentitySection from "./components/ArtistProfileIdentitySection";
import ArtistProfileInfoSection from "./components/ArtistProfileInfoSection";
import ArtistProfileLoadingState from "./components/ArtistProfileLoadingState";
import ArtistProfilePhotosSection from "./components/ArtistProfilePhotosSection";
import ArtistProfileReviewsSection from "./components/ArtistProfileReviewsSection";
import ArtistProfileSoundSection from "./components/ArtistProfileSoundSection";
import ArtistProfileStatsSection from "./components/ArtistProfileStatsSection";
import { styles } from "./styles";
import { useArtistProfile } from "./useArtistProfile";

export default function ArtistProfile() {
  const vm = useArtistProfile();

  if (vm.loading) {
    return <ArtistProfileLoadingState />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ArtistProfileHeroSection coverUrl={vm.display.coverUrl} onEdit={vm.goToEdit} />

        <ArtistProfileIdentitySection display={vm.display} />

        <ArtistProfileStatsSection stats={vm.stats} />

        <ArtistProfileAboutSection descricao={vm.display.biografia} />

        <ArtistProfileInfoSection display={vm.display} />

        <ArtistProfileChipSection title="Gêneros musicais" items={vm.display.generos} />

        <ArtistProfileChipSection title="Instrumentos" items={vm.display.instrumentos} />

        <ArtistProfileSoundSection display={vm.display} />

        <ArtistProfileCacheSection
          cacheMinimo={vm.display.cacheMinimo}
          cacheMaximo={vm.display.cacheMaximo}
        />

        <ArtistProfilePhotosSection fotosUrls={vm.display.pressKitUrls} />

        <ArtistProfileReviewsSection reviews={vm.reviews} />

        <ArtistProfileActionsSection
          onSwitchProfile={vm.goToUserProfile}
          onSignOut={vm.handleSignOut}
        />
      </ScrollView>
    </View>
  );
}
