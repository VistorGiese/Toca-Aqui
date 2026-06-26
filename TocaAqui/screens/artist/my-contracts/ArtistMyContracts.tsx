import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
  ArtistMyContractsContractCard,
  ArtistMyContractsEmptyState,
  ArtistMyContractsHeader,
  ArtistMyContractsLoadingState,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useArtistMyContracts } from "./useArtistMyContracts";

export default function ArtistMyContracts() {
  const vm = useArtistMyContracts();

  if (vm.loading) {
    return <ArtistMyContractsLoadingState />;
  }

  return (
    <View style={styles.root}>
      <ArtistMyContractsHeader onLogout={vm.handleLogout} />

      <FlatList
        data={vm.contracts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ArtistMyContractsContractCard contract={item} onPress={vm.goToContractDetail} />
        )}
        ListEmptyComponent={<ArtistMyContractsEmptyState />}
        contentContainerStyle={[
          styles.listContent,
          vm.contracts.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            tintColor={DS.accent}
            colors={[DS.accent]}
          />
        }
      />
    </View>
  );
}
