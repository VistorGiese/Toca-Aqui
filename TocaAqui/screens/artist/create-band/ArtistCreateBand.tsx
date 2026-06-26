import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  ArtistCreateBandActionsSection,
  ArtistCreateBandFormSection,
  ArtistCreateBandGenresSection,
  ArtistCreateBandHeader,
  ArtistCreateBandMembersSection,
} from "./components";
import { styles } from "./styles";
import { useArtistCreateBand } from "./useArtistCreateBand";

export default function ArtistCreateBand() {
  const vm = useArtistCreateBand();

  return (
    <View style={styles.root}>
      <ArtistCreateBandHeader onBack={vm.goBack} onHome={vm.goHome} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ArtistCreateBandFormSection control={vm.control} />

          <ArtistCreateBandMembersSection
            memberSearch={vm.memberSearch}
            searchResults={vm.searchResults}
            selectedMembers={vm.selectedMembers}
            isSearching={vm.isSearching}
            showDropdown={vm.showDropdown}
            onSearchChange={vm.handleMemberSearch}
            onSelectMember={vm.selectMember}
            onRemoveMember={vm.removeMember}
          />

          <ArtistCreateBandGenresSection
            selectedGenres={vm.selectedGenres}
            generosError={vm.generosError}
            onToggle={vm.toggleGenre}
          />

          <ArtistCreateBandActionsSection
            isSubmitting={vm.isSubmitting}
            disabled={vm.isSubmitting || vm.selectedGenres.length === 0}
            onSubmit={vm.handleSubmit(vm.onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
