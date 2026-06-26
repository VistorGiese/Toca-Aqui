import React from "react";
import { StatusBar, View } from "react-native";
import {
  ArtistAllConfirmedShowsEmptyState,
  ArtistAllConfirmedShowsHeader,
  ArtistAllConfirmedShowsList,
  ArtistAllConfirmedShowsLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useArtistAllConfirmedShows } from "./useArtistAllConfirmedShows";

export default function ArtistAllConfirmedShows() {
  const vm = useArtistAllConfirmedShows();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <ArtistAllConfirmedShowsHeader onBack={vm.goBack} />

      {vm.loading ? (
        <ArtistAllConfirmedShowsLoadingState />
      ) : vm.shows.length === 0 ? (
        <ArtistAllConfirmedShowsEmptyState />
      ) : (
        <ArtistAllConfirmedShowsList shows={vm.shows} onShowPress={vm.goToShowDetail} />
      )}
    </View>
  );
}
