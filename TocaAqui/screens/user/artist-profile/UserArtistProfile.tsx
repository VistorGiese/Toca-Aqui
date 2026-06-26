import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  UserArtistProfileAboutSection,
  UserArtistProfileBottomBar,
  UserArtistProfileCoverSection,
  UserArtistProfileErrorState,
  UserArtistProfileGallerySection,
  UserArtistProfileGenresSection,
  UserArtistProfileHeroSection,
  UserArtistProfileInfoSection,
  UserArtistProfileInstrumentsSection,
  UserArtistProfileLoadingState,
  UserArtistProfileShowsSection,
  UserArtistProfileSocialLinksSection,
  UserArtistProfileSoundSection,
  UserArtistProfileStatsSection,
} from "./components";
import { styles } from "./styles";
import { useUserArtistProfile } from "./useUserArtistProfile";

export default function UserArtistProfile() {
  const vm = useUserArtistProfile();

  if (vm.loading) {
    return <UserArtistProfileLoadingState />;
  }

  if (!vm.profile || !vm.display) {
    return <UserArtistProfileErrorState onBack={vm.goBack} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <UserArtistProfileCoverSection
        coverUrl={vm.display.coverUrl}
        fotoUrl={vm.display.fotoUrl}
        showFavorite={vm.showFavoriteHeart}
        isFavorite={vm.isFavorite}
        favoriteLoading={vm.favoriteLoading}
        onBack={vm.goBack}
        onToggleFavorite={vm.toggleFavorite}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <UserArtistProfileHeroSection display={vm.display} />
        <UserArtistProfileStatsSection display={vm.display} favoriteCount={vm.favoriteCount} />
        <UserArtistProfileAboutSection biografia={vm.profile.biografia} />
        <UserArtistProfileGenresSection generos={vm.display.generos} />
        <UserArtistProfileInstrumentsSection instrumentos={vm.display.instrumentos} />
        <UserArtistProfileSoundSection profile={vm.profile} />
        <UserArtistProfileInfoSection profile={vm.profile} />
        <UserArtistProfileSocialLinksSection links={vm.profile.links_sociais ?? []} />
        <UserArtistProfileGallerySection urls={vm.display.pressKitUrls} />
        <UserArtistProfileShowsSection
          shows={vm.upcomingShows}
          canBuyTickets={vm.canBuyTickets}
          onBuyTicket={vm.goToCheckout}
        />
        <View style={styles.scrollBottomSpacer} />
      </ScrollView>

      <UserArtistProfileBottomBar onBack={vm.goBack} />
    </View>
  );
}
