import React from "react";
import { ScrollView, View } from "react-native";
import {
  OnboardingArtistProfileActionsSection,
  OnboardingArtistProfileCacheSection,
  OnboardingArtistProfileGenresSection,
  OnboardingArtistProfileHeader,
  OnboardingArtistProfilePhotoSection,
  OnboardingArtistProfileProgressBar,
  OnboardingArtistProfileSoundSection,
  OnboardingArtistProfileTypeSection,
  OnboardingArtistProfileFormField,
} from "./components";
import { styles } from "./styles";
import { useOnboardingArtistProfile } from "./useOnboardingArtistProfile";

export default function OnboardingArtistProfile() {
  const vm = useOnboardingArtistProfile();

  return (
    <View style={styles.root}>
      <OnboardingArtistProfileProgressBar />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <OnboardingArtistProfileHeader />

        <OnboardingArtistProfilePhotoSection
          fotoUri={vm.fotoUri}
          error={vm.errors.foto}
          onPickPhoto={vm.pickPhoto}
        />

        <OnboardingArtistProfileFormField
          label="NOME ARTÍSTICO"
          placeholder="Ex: Lunar Echoes"
          value={vm.nomeArtistico}
          onChangeText={vm.updateNomeArtistico}
          error={vm.errors.nomeArtistico}
          maxLength={80}
        />

        <OnboardingArtistProfileTypeSection
          selected={vm.tipoSelecionado}
          error={vm.errors.tipo}
          onSelect={vm.selectTipo}
        />

        <View style={styles.separator} />

        <OnboardingArtistProfileGenresSection
          selected={vm.generosSelecionados}
          error={vm.errors.generos}
          onToggle={vm.toggleGenero}
        />

        <OnboardingArtistProfileCacheSection
          cacheMin={vm.cacheMin}
          cacheMax={vm.cacheMax}
          cacheMinError={vm.errors.cacheMin}
          cacheMaxError={vm.errors.cacheMax}
          onChangeCacheMin={vm.updateCacheMin}
          onChangeCacheMax={vm.updateCacheMax}
        />

        <OnboardingArtistProfileSoundSection
          temEstrutura={vm.temEstrutura}
          estrutura={vm.estrutura}
          error={vm.errors.estrutura}
          onTemEstruturaChange={vm.updateTemEstrutura}
          onToggleEquipamento={vm.toggleEquipamento}
        />

        <OnboardingArtistProfileActionsSection
          onContinue={vm.handleContinuar}
          onBack={vm.goBack}
        />
      </ScrollView>
    </View>
  );
}
