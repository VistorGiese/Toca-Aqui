import React from "react";
import { ScrollView, View } from "react-native";
import LocationPickerModal from "../onboarding/components/LocationPickerModal";
import EstEditProfileAddressSection from "./components/EstEditProfileAddressSection";
import EstEditProfileErrorState from "./components/EstEditProfileErrorState";
import EstEditProfileGenresSection from "./components/EstEditProfileGenresSection";
import EstEditProfileHeader from "./components/EstEditProfileHeader";
import EstEditProfileIdentitySection from "./components/EstEditProfileIdentitySection";
import EstEditProfileLoadingState from "./components/EstEditProfileLoadingState";
import EstEditProfilePhotosSection from "./components/EstEditProfilePhotosSection";
import EstEditProfileSaveButton from "./components/EstEditProfileSaveButton";
import EstEditProfileScheduleSection from "./components/EstEditProfileScheduleSection";
import { styles } from "./styles";
import { useEstEditProfile } from "./useEstEditProfile";

export default function EstEditProfile() {
  const vm = useEstEditProfile();

  if (vm.loading) {
    return <EstEditProfileLoadingState />;
  }

  if (vm.loadError) {
    return (
      <EstEditProfileErrorState
        message={vm.loadError}
        onRetry={vm.reload}
        onBack={vm.goBack}
      />
    );
  }

  return (
    <View style={styles.root}>
      <EstEditProfileHeader onBack={vm.goBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <EstEditProfileIdentitySection
          nome={vm.nome}
          onNomeChange={vm.setNome}
          descricao={vm.descricao}
          onDescricaoChange={vm.setDescricao}
          tipo={vm.tipo}
          onTipoChange={vm.setTipo}
          telefone={vm.telefone}
          onTelefoneChange={vm.setTelefone}
          cnpj={vm.cnpj}
          onCnpjChange={vm.setCnpj}
          errors={vm.errors}
        />

        <EstEditProfileGenresSection
          selected={vm.generos}
          onToggle={vm.toggleGenero}
          error={vm.errors.generos}
        />

        <EstEditProfileAddressSection
          estado={vm.estado}
          cidade={vm.cidade}
          endereco={vm.endereco}
          numero={vm.numero}
          bairro={vm.bairro}
          cep={vm.cep}
          selectedEstado={vm.selectedEstado}
          loadingEstados={vm.loadingEstados}
          loadingCidades={vm.loadingCidades}
          onOpenEstadoPicker={() => vm.openPicker("estado")}
          onOpenCidadePicker={() => vm.openPicker("cidade")}
          onEnderecoChange={vm.setEndereco}
          onNumeroChange={vm.setNumero}
          onBairroChange={vm.setBairro}
          onCepChange={vm.setCep}
          errors={vm.errors}
        />

        <EstEditProfileScheduleSection
          schedule={vm.diasHorarios}
          onToggleDay={vm.toggleDay}
          onUpdateTime={vm.updateTime}
          error={vm.errors.horarios}
        />

        <EstEditProfilePhotosSection
          photos={vm.galleryPhotos}
          onAdd={vm.addPhotos}
          onRemove={vm.removePhoto}
        />

        <EstEditProfileSaveButton saving={vm.saving} onPress={vm.handleSalvar} />
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
