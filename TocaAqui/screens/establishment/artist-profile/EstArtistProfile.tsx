import React from "react";
import { StatusBar, View } from "react-native";
import EstArtistProfileArtistContent from "./components/EstArtistProfileArtistContent";
import EstArtistProfileBandContent from "./components/EstArtistProfileBandContent";
import EstArtistProfileBottomBar from "./components/EstArtistProfileBottomBar";
import EstArtistProfileErrorState from "./components/EstArtistProfileErrorState";
import EstArtistProfileLoadingState from "./components/EstArtistProfileLoadingState";
import { styles } from "./styles";
import { useEstArtistProfile } from "./useEstArtistProfile";

export default function EstArtistProfile() {
  const vm = useEstArtistProfile();

  if (vm.loading) {
    return <EstArtistProfileLoadingState />;
  }

  if (!vm.hasProfile) {
    return (
      <EstArtistProfileErrorState
        message={vm.errorMessage ?? "Artista ou banda não encontrado(a)."}
        onBack={vm.goBack}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {vm.artistProfile && vm.artistDisplay ? (
        <EstArtistProfileArtistContent
          profile={vm.artistProfile}
          display={vm.artistDisplay}
          favoriteCount={vm.favoriteCount}
          isFavorite={vm.isFavorite}
          favoriteLoading={vm.favoriteLoading}
          onBack={vm.goBack}
          onToggleFavorite={vm.toggleFavorite}
        />
      ) : vm.bandProfile && vm.bandDisplay ? (
        <EstArtistProfileBandContent
          band={vm.bandProfile}
          display={vm.bandDisplay}
          onBack={vm.goBack}
        />
      ) : null}

      <EstArtistProfileBottomBar onBack={vm.goBack} />
    </View>
  );
}
