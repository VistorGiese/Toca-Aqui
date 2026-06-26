import React from "react";
import { ScrollView, View } from "react-native";
import {
  OnboardingArtistBioAboutSection,
  OnboardingArtistBioActionsSection,
  OnboardingArtistBioHeader,
  OnboardingArtistBioLinksSection,
  OnboardingArtistBioLocationPickerModal,
  OnboardingArtistBioLocationSection,
  OnboardingArtistBioPressKitSection,
  OnboardingArtistBioProgressBar,
} from "./components";
import { styles } from "./styles";
import { useOnboardingArtistBio } from "./useOnboardingArtistBio";

export default function OnboardingArtistBio() {
  const vm = useOnboardingArtistBio();

  return (
    <View style={styles.root}>
      <OnboardingArtistBioProgressBar />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <OnboardingArtistBioHeader />

        <OnboardingArtistBioLocationSection
          estado={vm.estado}
          cidade={vm.cidade}
          loadingEstados={vm.loadingEstados}
          loadingCidades={vm.loadingCidades}
          locationLabel={vm.locationLabel}
          estadoError={vm.errors.estado}
          cidadeError={vm.errors.cidade}
          onOpenEstadoPicker={() => vm.openPicker("estado")}
          onOpenCidadePicker={() => vm.openPicker("cidade")}
        />

        <View style={styles.separator} />

        <OnboardingArtistBioAboutSection
          biografia={vm.biografia}
          error={vm.errors.biografia}
          onChangeBiografia={vm.updateBiografia}
        />

        <OnboardingArtistBioLinksSection
          links={vm.links}
          novoLink={vm.novoLink}
          showLinkInput={vm.showLinkInput}
          onChangeNovoLink={vm.setNovoLink}
          onAddLink={vm.addLink}
          onRemoveLink={vm.removeLink}
          onToggleLinkInput={vm.toggleLinkInput}
        />

        <OnboardingArtistBioPressKitSection
          pressKit={vm.pressKit}
          onAddPressKit={vm.addPressKit}
          onRemovePressKit={vm.removePressKit}
        />

        <OnboardingArtistBioActionsSection
          loading={vm.loading}
          onConcluir={vm.handleConcluir}
          onBack={vm.goBack}
        />
      </ScrollView>

      <OnboardingArtistBioLocationPickerModal
        pickerMode={vm.pickerMode}
        searchText={vm.searchText}
        filteredEstados={vm.filteredEstados}
        filteredCidades={vm.filteredCidades}
        selectedEstado={vm.estado}
        selectedCidade={vm.cidade}
        onSearchChange={vm.setSearchText}
        onClose={vm.closePicker}
        onSelectEstado={vm.selectEstado}
        onSelectCidade={vm.selectCidade}
      />
    </View>
  );
}
