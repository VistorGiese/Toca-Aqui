import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  EstContractPreviewDetailsCard,
  EstContractPreviewDownloadSection,
  EstContractPreviewHeader,
  EstContractPreviewHeroSection,
  EstContractPreviewLoadingState,
  EstContractPreviewReviewSection,
  EstContractPreviewSuccessBanner,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstContractPreview } from "./useEstContractPreview";

export default function EstContractPreview() {
  const vm = useEstContractPreview();

  if (vm.loading) {
    return <EstContractPreviewLoadingState />;
  }

  if (!vm.display) {
    return null;
  }

  const { display } = vm;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstContractPreviewHeader onBack={vm.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <EstContractPreviewHeroSection
          gigTitle={display.gigTitle}
          refContrato={display.preview.refContrato}
          workflowLabel={display.workflowLabel}
        />

        {display.approved ? <EstContractPreviewSuccessBanner /> : null}

        <EstContractPreviewDetailsCard
          artistName={display.artistName}
          preview={display.preview}
        />

        {display.showReviewSection ? (
          <EstContractPreviewReviewSection
            reviewHint={display.reviewHint}
            awaitingApproval={display.awaitingApproval}
            busy={vm.busy}
            onViewArtistContract={vm.handleViewArtistContract}
            onApprove={vm.handleApprove}
            onReject={vm.handleReject}
          />
        ) : null}

        {display.showDownloadSection ? (
          <EstContractPreviewDownloadSection
            busy={vm.busy}
            onDownload={vm.handleDownloadModel}
            onGoToShow={vm.goToShowDetail}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
