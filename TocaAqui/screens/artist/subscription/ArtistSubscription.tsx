import React from "react";
import { ScrollView, View } from "react-native";
import {
  ArtistSubscriptionFreePlanCard,
  ArtistSubscriptionHeader,
  ArtistSubscriptionProPlanCard,
  ArtistSubscriptionTitleSection,
  ArtistSubscriptionTrustSection,
} from "./components";
import { styles } from "./styles";
import { useArtistSubscription } from "./useArtistSubscription";

export default function ArtistSubscription() {
  const vm = useArtistSubscription();

  return (
    <View style={styles.root}>
      <ArtistSubscriptionHeader />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ArtistSubscriptionTitleSection />
        <ArtistSubscriptionFreePlanCard />
        <ArtistSubscriptionProPlanCard onAssinarPro={vm.handleAssinarPro} />
        <ArtistSubscriptionTrustSection />
      </ScrollView>
    </View>
  );
}
