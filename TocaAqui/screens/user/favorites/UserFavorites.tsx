import React from "react";
import { StatusBar, View } from "react-native";
import {
  UserFavoritesHeader,
  UserFavoritesList,
  UserFavoritesLoadingState,
  UserFavoritesTabs,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useUserFavorites } from "./useUserFavorites";

export default function UserFavorites() {
  const vm = useUserFavorites();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserFavoritesHeader onSettingsPress={vm.goToSettings} />

      <UserFavoritesTabs activeTab={vm.activeTab} onTabChange={vm.setActiveTab} />

      {vm.loading ? (
        <UserFavoritesLoadingState />
      ) : (
        <UserFavoritesList
          activeTab={vm.activeTab}
          favShows={vm.favShows}
          favArtistas={vm.favArtistas}
          favLocais={vm.favLocais}
          refreshing={vm.refreshing}
          onRefresh={vm.onRefresh}
          onShowPress={vm.goToShowDetail}
          onShowRemove={vm.handleRemoverShow}
          onArtistPress={vm.goToArtist}
          onArtistRemove={vm.handleRemoverArtista}
          onVenuePress={vm.goToEstablishment}
          onVenueRemove={vm.handleRemoverLocal}
        />
      )}
    </View>
  );
}
