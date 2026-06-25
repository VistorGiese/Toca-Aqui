import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import UserEstablishmentProfileAboutSection from "./components/UserEstablishmentProfileAboutSection";
import UserEstablishmentProfileBottomBar from "./components/UserEstablishmentProfileBottomBar";
import UserEstablishmentProfileContactSection from "./components/UserEstablishmentProfileContactSection";
import UserEstablishmentProfileErrorState from "./components/UserEstablishmentProfileErrorState";
import UserEstablishmentProfileGenresSection from "./components/UserEstablishmentProfileGenresSection";
import UserEstablishmentProfileHeroSection from "./components/UserEstablishmentProfileHeroSection";
import UserEstablishmentProfileIdentitySection from "./components/UserEstablishmentProfileIdentitySection";
import UserEstablishmentProfileInfoSection from "./components/UserEstablishmentProfileInfoSection";
import UserEstablishmentProfileLoadingState from "./components/UserEstablishmentProfileLoadingState";
import UserEstablishmentProfilePhotosSection from "./components/UserEstablishmentProfilePhotosSection";
import UserEstablishmentProfileShowsSection from "./components/UserEstablishmentProfileShowsSection";
import { styles } from "./styles";
import { useUserEstablishmentProfile } from "./useUserEstablishmentProfile";

export default function UserEstablishmentProfile() {
  const vm = useUserEstablishmentProfile();

  if (vm.loading) {
    return <UserEstablishmentProfileLoadingState />;
  }

  if (!vm.profile) {
    return <UserEstablishmentProfileErrorState onBack={vm.goBack} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <UserEstablishmentProfileHeroSection
        display={vm.display}
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
        <UserEstablishmentProfileIdentitySection display={vm.display} />
        <UserEstablishmentProfileInfoSection display={vm.display} />
        <UserEstablishmentProfilePhotosSection photosUrls={vm.display.photosUrls} />
        <UserEstablishmentProfileAboutSection descricao={vm.display.descricao} />
        <UserEstablishmentProfileGenresSection generos={vm.display.generos} />
        <UserEstablishmentProfileContactSection telefone={vm.display.telefone} />
        <UserEstablishmentProfileShowsSection
          shows={vm.shows}
          canBuyTickets={vm.canBuyTickets}
          onShowPress={vm.goToShow}
        />
        <View style={styles.scrollBottomSpacer} />
      </ScrollView>

      <UserEstablishmentProfileBottomBar onBack={vm.goBack} />
    </View>
  );
}
