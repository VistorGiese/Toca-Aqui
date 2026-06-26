import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  ActionsSection,
  CloseButton,
  CommentSection,
  HighlightsSection,
  StarsSection,
  TitleSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useArtistRateEstablishment } from "./useArtistRateEstablishment";

export default function ArtistRateEstablishment() {
  const vm = useArtistRateEstablishment();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <CloseButton onPress={vm.goBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TitleSection venueName={vm.venueName} />

        <StarsSection
          rating={vm.rating}
          ratingError={vm.ratingError}
          onSelect={vm.selectRating}
        />

        <HighlightsSection selectedChips={vm.selectedChips} onToggle={vm.toggleChip} />

        <CommentSection value={vm.comentario} onChange={vm.setComentario} />

        <ActionsSection
          submitting={vm.submitting}
          onSubmit={vm.submit}
          onSkip={vm.goBack}
        />
      </ScrollView>
    </View>
  );
}
