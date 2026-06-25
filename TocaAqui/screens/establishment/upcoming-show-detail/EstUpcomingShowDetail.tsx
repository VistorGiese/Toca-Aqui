import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  EstUpcomingShowDetailHeader,
  EstUpcomingShowDetailSummaryCard,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstUpcomingShowDetail } from "./useEstUpcomingShowDetail";

export default function EstUpcomingShowDetail() {
  const vm = useEstUpcomingShowDetail();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstUpcomingShowDetailHeader onBack={vm.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <EstUpcomingShowDetailSummaryCard display={vm.display} />
      </ScrollView>
    </View>
  );
}
