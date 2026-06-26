import React from "react";
import { View, ScrollView, StatusBar } from "react-native";
import {
  UserRateShowActionsSection,
  UserRateShowArtistSection,
  UserRateShowCommentSection,
  UserRateShowHeader,
  UserRateShowHeroSection,
  UserRateShowVenueSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { useUserRateShow } from "./useUserRateShow";

export default function UserRateShow() {
  const vm = useUserRateShow();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserRateShowHeader onClose={vm.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <UserRateShowHeroSection
          showTitle={vm.showTitle}
          venueName={vm.venueName}
        />

        <UserRateShowArtistSection
          rating={vm.artistRating}
          onRatingChange={vm.setArtistRating}
          ratingError={vm.artistRatingError}
          onClearError={vm.clearArtistRatingError}
          selectedChips={vm.artistChips}
          onToggleChip={vm.toggleArtistChip}
        />

        <UserRateShowVenueSection
          rating={vm.venueRating}
          onRatingChange={vm.setVenueRating}
          selectedChips={vm.venueChips}
          onToggleChip={vm.toggleVenueChip}
        />

        <UserRateShowCommentSection
          value={vm.comment}
          maxLength={vm.maxComment}
          onChange={vm.setCommentText}
        />

        <UserRateShowActionsSection
          loading={vm.loading}
          onPublish={vm.handlePublish}
          onSkip={vm.handleSkip}
        />

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </View>
  );
}
