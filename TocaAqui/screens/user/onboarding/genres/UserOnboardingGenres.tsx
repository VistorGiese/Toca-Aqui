import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  UserOnboardingGenresFooter,
  UserOnboardingGenresGrid,
  UserOnboardingGenresHeader,
  UserOnboardingGenresProgressBar,
  UserOnboardingGenresTitleSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { UserOnboardingGenresProps } from "./types";
import { useUserOnboardingGenres } from "./useUserOnboardingGenres";

export default function UserOnboardingGenres(props: UserOnboardingGenresProps) {
  const vm = useUserOnboardingGenres(props);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserOnboardingGenresHeader onSkip={vm.handleSkip} />
      <UserOnboardingGenresProgressBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <UserOnboardingGenresTitleSection selectedCount={vm.selected.length} />
        <UserOnboardingGenresGrid selected={vm.selected} onToggle={vm.toggleGenre} />
      </ScrollView>

      <UserOnboardingGenresFooter error={vm.generosError} onNext={vm.handleNext} />
    </View>
  );
}
