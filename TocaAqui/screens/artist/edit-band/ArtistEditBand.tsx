import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  ArtistEditBandActionsSection,
  ArtistEditBandFormSection,
  ArtistEditBandGenresSection,
  ArtistEditBandHeader,
  ArtistEditBandLoadingState,
} from "./components";
import { styles } from "./styles";
import { useArtistEditBand } from "./useArtistEditBand";

export default function ArtistEditBand() {
  const vm = useArtistEditBand();

  if (vm.loading) {
    return <ArtistEditBandLoadingState />;
  }

  return (
    <View style={styles.root}>
      <ArtistEditBandHeader
        onBack={vm.goBack}
        onHome={vm.goHome}
        onDelete={vm.handleDelete}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ArtistEditBandFormSection control={vm.control} />

          <ArtistEditBandGenresSection
            selectedGenres={vm.selectedGenres}
            generosError={vm.generosError}
            onToggle={vm.toggleGenre}
          />

          <ArtistEditBandActionsSection
            isSubmitting={vm.isSubmitting}
            disabled={vm.isSubmitting || vm.selectedGenres.length === 0}
            onSubmit={vm.handleSubmit(vm.onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
