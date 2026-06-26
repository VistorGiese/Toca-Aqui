import React from "react";
import { ScrollView, Text, View } from "react-native";
import {
  ArtistContractDetailHeader,
  ArtistContractDetailHeroSection,
  ArtistContractDetailInfoSection,
  ArtistContractDetailLoadingState,
  ArtistContractDetailStatusBanners,
  ArtistContractDetailTermsSection,
  ArtistContractDetailWorkflowSection,
} from "./components";
import { LEGAL_TEXT } from "./constants";
import { styles } from "./styles";
import { useArtistContractDetail } from "./useArtistContractDetail";

export default function ArtistContractDetail() {
  const vm = useArtistContractDetail();

  if (vm.loading) {
    return <ArtistContractDetailLoadingState />;
  }

  if (!vm.contract || !vm.display) return null;

  const { display } = vm;

  return (
    <View style={styles.root}>
      <ArtistContractDetailHeader onBack={vm.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ArtistContractDetailHeroSection refNumber={display.refNumber} />

        <ArtistContractDetailStatusBanners
          artistMustResubmit={display.artistMustResubmit}
          artistCanSeeContract={display.artistCanSeeContract}
        />

        <ArtistContractDetailInfoSection
          preview={display.preview}
          formattedDate={display.formattedDate}
        />

        <ArtistContractDetailTermsSection preview={display.preview} />

        {display.artistCanSeeContract ? (
          <ArtistContractDetailWorkflowSection
            contractId={vm.contractId}
            contract={vm.contract}
            workflow={vm.workflow}
            workflowStatus={display.workflowStatus}
            onRefresh={vm.refreshWorkflowAndLoad}
          />
        ) : null}

        <Text style={styles.legalText}>{LEGAL_TEXT}</Text>
      </ScrollView>
    </View>
  );
}
