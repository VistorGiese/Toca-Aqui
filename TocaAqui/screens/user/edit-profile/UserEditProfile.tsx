import React from "react";
import { ScrollView, View } from "react-native";
import LocationPickerModal from "@/screens/establishment/onboarding/components/LocationPickerModal";
import {
  UserEditProfileErrorState,
  UserEditProfileGenresSection,
  UserEditProfileHeader,
  UserEditProfileIdentitySection,
  UserEditProfileLoadingState,
  UserEditProfileLocationSection,
  UserEditProfilePhotoSection,
  UserEditProfileSaveButton,
} from "./components";
import { styles } from "./styles";
import { useUserEditProfile } from "./useUserEditProfile";

export default function UserEditProfile() {
  const vm = useUserEditProfile();

  if (vm.loading) {
    return <UserEditProfileLoadingState />;
  }

  if (vm.loadError) {
    return (
      <UserEditProfileErrorState
        message={vm.loadError}
        onRetry={vm.reload}
        onBack={vm.goBack}
      />
    );
  }

  return (
    <View style={styles.root}>
      <UserEditProfileHeader onBack={vm.goBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <UserEditProfilePhotoSection
          fotoPerfil={vm.fotoPerfil}
          uploading={vm.uploadingFoto}
          onSelectPhoto={vm.handleSelecionarFoto}
        />

        <UserEditProfileIdentitySection nome={vm.nome} email={vm.email} />

        <UserEditProfileGenresSection
          selected={vm.generos}
          onToggle={vm.toggleGenero}
          error={vm.errors.generos}
        />

        <UserEditProfileLocationSection
          estado={vm.estado}
          cidade={vm.cidade}
          cidadeTexto={vm.cidadeTexto}
          onCidadeTextoChange={vm.setCidadeTexto}
          selectedEstado={vm.selectedEstado}
          loadingEstados={vm.loadingEstados}
          loadingCidades={vm.loadingCidades}
          onOpenEstadoPicker={() => vm.openPicker("estado")}
          onOpenCidadePicker={() => vm.openPicker("cidade")}
          raio={vm.raio}
          onRaioDecrease={vm.decreaseRaio}
          onRaioIncrease={vm.increaseRaio}
          tiposLocal={vm.tiposLocal}
          onToggleTipoLocal={vm.toggleTipoLocal}
          notifNovosShows={vm.notifNovosShows}
          onNotifNovosShowsChange={vm.setNotifNovosShows}
          notifLembretes={vm.notifLembretes}
          onNotifLembretesChange={vm.setNotifLembretes}
          errors={vm.errors}
        />

        <UserEditProfileSaveButton saving={vm.saving} onPress={vm.handleSalvar} />
      </ScrollView>

      <LocationPickerModal
        visible={vm.pickerMode !== null}
        mode={vm.pickerMode}
        searchText={vm.searchText}
        onSearchChange={vm.setSearchText}
        onClose={vm.closePicker}
        estados={vm.estados}
        cidades={vm.cidades}
        selectedEstadoSigla={vm.estado}
        selectedCidadeId={vm.cidades.find((c) => c.nome === vm.cidade)?.id}
        onSelectEstado={vm.selectEstado}
        onSelectCidade={vm.selectCidade}
      />
    </View>
  );
}
