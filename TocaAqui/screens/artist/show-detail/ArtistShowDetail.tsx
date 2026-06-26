import React from "react";
import { ScrollView, View } from "react-native";
import {
  CacheSection,
  ConfirmedBadge,
  ContactSection,
  Header,
  HeroSection,
  InfoSection,
  LoadingState,
  LocationSection,
  ReportSection,
  TimelineSection,
} from "./components";
import { styles } from "./styles";
import { useArtistShowDetail } from "./useArtistShowDetail";

export default function ArtistShowDetail() {
  const vm = useArtistShowDetail();

  if (vm.loading) {
    return <LoadingState />;
  }

  if (!vm.display) return null;

  return (
    <View style={styles.root}>
      <Header onBack={vm.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ConfirmedBadge />
        <HeroSection title={vm.display.title} />
        <InfoSection display={vm.display} />
        <CacheSection cacheFormatted={vm.display.cacheFormatted} />
        <LocationSection display={vm.display} onOpenMaps={vm.openMaps} />
        <TimelineSection formattedDate={vm.display.formattedDate} />

        {vm.display.responsavel ? (
          <ContactSection
            responsavel={vm.display.responsavel}
            onCall={vm.handleCall}
            onMessage={vm.handleMessage}
            onProfile={vm.handleContactProfile}
          />
        ) : null}

        <ReportSection onPress={vm.reportProblem} />
      </ScrollView>
    </View>
  );
}
