import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import EstProfileAboutSection from "./components/EstProfileAboutSection";
import EstProfileActionsSection from "./components/EstProfileActionsSection";
import EstProfileGenresSection from "./components/EstProfileGenresSection";
import EstProfileHeroSection from "./components/EstProfileHeroSection";
import EstProfileIdentitySection from "./components/EstProfileIdentitySection";
import EstProfileLoadingState from "./components/EstProfileLoadingState";
import EstProfilePhotosSection from "./components/EstProfilePhotosSection";
import EstProfileScheduleSection from "./components/EstProfileScheduleSection";
import EstProfileStatsSection from "./components/EstProfileStatsSection";
import { styles } from "./styles";
import { useEstProfile } from "./useEstProfile";

export default function EstProfile() {
  const vm = useEstProfile();

  if (vm.loading) {
    return <EstProfileLoadingState />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <EstProfileHeroSection
          coverUrl={vm.display.coverUrl}
          onEdit={vm.goToEdit}
        />

        <EstProfileIdentitySection display={vm.display} />

        <EstProfileStatsSection stats={vm.stats} />

        <EstProfileAboutSection descricao={vm.display.descricao} />

        <EstProfileGenresSection generos={vm.display.generos} />

        <EstProfilePhotosSection fotosUrls={vm.display.fotosUrls} />

        <EstProfileScheduleSection
          abertura={vm.display.abertura}
          fechamento={vm.display.fechamento}
          visible={vm.display.hasSchedule}
        />

        <EstProfileActionsSection
          onSwitchProfile={vm.goToUserProfile}
          onSignOut={vm.handleSignOut}
        />
      </ScrollView>
    </View>
  );
}
