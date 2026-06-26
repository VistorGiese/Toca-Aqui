import React from "react";
import { ScrollView, View } from "react-native";
import {
  ArtistApplyConfirmationActionsSection,
  ArtistApplyConfirmationHeader,
  ArtistApplyConfirmationMessageSection,
  ArtistApplyConfirmationProfilePreviewSection,
  ArtistApplyConfirmationSummarySection,
  ArtistApplyConfirmationValueSection,
} from "./components";
import { styles } from "./styles";
import { useArtistApplyConfirmation } from "./useArtistApplyConfirmation";

export default function ArtistApplyConfirmation() {
  const vm = useArtistApplyConfirmation();

  return (
    <View style={styles.root}>
      <ArtistApplyConfirmationHeader onBack={vm.goBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ArtistApplyConfirmationSummarySection summary={vm.summary} />
        <ArtistApplyConfirmationMessageSection
          value={vm.mensagem}
          placeholder={vm.messagePlaceholder}
          error={vm.errors.mensagem}
          onChange={vm.updateMensagem}
        />
        <ArtistApplyConfirmationValueSection
          value={vm.valorProposto}
          error={vm.errors.valorProposto}
          onChange={vm.updateValorProposto}
        />
        <ArtistApplyConfirmationProfilePreviewSection preview={vm.profilePreview} />
        <ArtistApplyConfirmationActionsSection
          loading={vm.loading}
          onSubmit={vm.submit}
          onCancel={vm.goBack}
        />
      </ScrollView>
    </View>
  );
}
