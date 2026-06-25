import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  EstRateArtistActionsSection,
  EstRateArtistCloseButton,
  EstRateArtistCommentSection,
  EstRateArtistHighlightsSection,
  EstRateArtistStarsSection,
  EstRateArtistTitleSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useEstRateArtist } from "./useEstRateArtist";

export default function EstRateArtist() {
  const vm = useEstRateArtist();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <EstRateArtistCloseButton onPress={vm.goBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <EstRateArtistTitleSection
          artistName={vm.artistName}
          formattedDate={vm.formattedDate}
        />

        <EstRateArtistStarsSection
          rating={vm.rating}
          ratingError={vm.ratingError}
          onSelect={vm.selectRating}
        />

        <EstRateArtistHighlightsSection
          selectedChips={vm.selectedChips}
          onToggle={vm.toggleChip}
        />

        <EstRateArtistCommentSection value={vm.comentario} onChange={vm.setComentario} />

        <EstRateArtistActionsSection
          submitting={vm.submitting}
          onSubmit={vm.submit}
          onSkip={vm.goBack}
        />
      </ScrollView>
    </View>
  );
}
