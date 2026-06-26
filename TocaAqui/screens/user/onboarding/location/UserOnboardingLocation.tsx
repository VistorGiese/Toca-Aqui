import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import {
  UserOnboardingLocationCitySection,
  UserOnboardingLocationFooter,
  UserOnboardingLocationHeader,
  UserOnboardingLocationProgressBar,
  UserOnboardingLocationRadiusSection,
  UserOnboardingLocationToggleSection,
  UserOnboardingLocationVenuesSection,
} from "./components";
import { DS } from "./constants";
import { styles } from "./styles";
import { UserOnboardingLocationProps } from "./types";
import { useUserOnboardingLocation } from "./useUserOnboardingLocation";

export default function UserOnboardingLocation(props: UserOnboardingLocationProps) {
  const vm = useUserOnboardingLocation(props);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <UserOnboardingLocationHeader onSkip={vm.handleSkip} />
      <UserOnboardingLocationProgressBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <UserOnboardingLocationCitySection
          city={vm.city}
          cityError={vm.cityError}
          onCityChange={vm.handleCityChange}
        />

        <UserOnboardingLocationToggleSection
          useLocation={vm.useLocation}
          onUseLocationChange={vm.setUseLocation}
        />

        <UserOnboardingLocationRadiusSection
          radius={vm.radius}
          onDecrease={vm.handleDecreaseRadius}
          onIncrease={vm.handleIncreaseRadius}
        />

        <UserOnboardingLocationVenuesSection
          selectedVenues={vm.selectedVenues}
          onToggle={vm.toggleVenue}
        />
      </ScrollView>

      <UserOnboardingLocationFooter onStart={vm.handleStart} />
    </View>
  );
}
