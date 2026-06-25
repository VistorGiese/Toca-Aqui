import React from "react";
import { StatusBar, View } from "react-native";
import {
  EstAllConfirmedShowsEmptyState,
  EstAllConfirmedShowsHeader,
  EstAllConfirmedShowsList,
  EstAllConfirmedShowsLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstAllConfirmedShows } from "./useEstAllConfirmedShows";

export default function EstAllConfirmedShows() {
  const vm = useEstAllConfirmedShows();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstAllConfirmedShowsHeader onBack={vm.goBack} />

      {vm.loading ? (
        <EstAllConfirmedShowsLoadingState />
      ) : vm.shows.length === 0 ? (
        <EstAllConfirmedShowsEmptyState />
      ) : (
        <EstAllConfirmedShowsList shows={vm.shows} onShowPress={vm.goToShowDetail} />
      )}
    </View>
  );
}
