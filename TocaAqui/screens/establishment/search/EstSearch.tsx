import React from "react";
import { StatusBar, View } from "react-native";
import {
  EstSearchHeader,
  EstSearchInputSection,
  EstSearchList,
  EstSearchLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstSearch } from "./useEstSearch";

export default function EstSearch() {
  const vm = useEstSearch();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstSearchHeader headerName={vm.headerName} onNotifications={vm.goToNotifications} />

      <EstSearchInputSection query={vm.query} onChange={vm.setQuery} />

      {vm.loading ? (
        <EstSearchLoadingState />
      ) : (
        <EstSearchList
          artists={vm.artists}
          refreshing={vm.refreshing}
          onRefresh={vm.refresh}
          onArtistPress={vm.openArtistProfile}
        />
      )}
    </View>
  );
}
