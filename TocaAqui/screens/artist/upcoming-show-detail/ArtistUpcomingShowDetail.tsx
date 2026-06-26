import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  ArtistUpcomingShowDetailHeader,
  ArtistUpcomingShowDetailSummaryCard,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useArtistUpcomingShowDetail } from "./useArtistUpcomingShowDetail";

export default function ArtistUpcomingShowDetail() {
  const vm = useArtistUpcomingShowDetail();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <ArtistUpcomingShowDetailHeader onBack={vm.goBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ArtistUpcomingShowDetailSummaryCard display={vm.display} />
      </ScrollView>
    </View>
  );
}
