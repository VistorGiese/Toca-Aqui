import React from "react";
import { ScrollView, Text, View } from "react-native";
import LocationPickerModal from "@/screens/establishment/onboarding/components/LocationPickerModal";
import { INSTRUMENTOS_OPCOES } from "./constants";
import ArtistEditProfileChipSection from "./components/ArtistEditProfileChipSection";
import ArtistEditProfileErrorState from "./components/ArtistEditProfileErrorState";
import ArtistEditProfileFormField from "./components/ArtistEditProfileFormField";
import ArtistEditProfileGenresSection from "./components/ArtistEditProfileGenresSection";
import ArtistEditProfileHeader from "./components/ArtistEditProfileHeader";
import ArtistEditProfileLinksSection from "./components/ArtistEditProfileLinksSection";
import ArtistEditProfileLoadingState from "./components/ArtistEditProfileLoadingState";
import ArtistEditProfileLocationSection from "./components/ArtistEditProfileLocationSection";
import ArtistEditProfilePhotoSection from "./components/ArtistEditProfilePhotoSection";
import ArtistEditProfilePressKitSection from "./components/ArtistEditProfilePressKitSection";
import ArtistEditProfileSaveButton from "./components/ArtistEditProfileSaveButton";
import ArtistEditProfileSoundSection from "./components/ArtistEditProfileSoundSection";
import ArtistEditProfileStatsSection from "./components/ArtistEditProfileStatsSection";
import ArtistEditProfileTypeChips from "./components/ArtistEditProfileTypeChips";
import ArtistEditProfileUnavailableSection from "./components/ArtistEditProfileUnavailableSection";
import { styles } from "./styles";
import { useArtistEditProfile } from "./useArtistEditProfile";

export default function ArtistEditProfile() {
  const vm = useArtistEditProfile();

  if (vm.loading) {
    return <ArtistEditProfileLoadingState />;
  }

  if (vm.loadError) {
    return (
      <ArtistEditProfileErrorState
        message={vm.loadError}
        onRetry={vm.reload}
        onBack={vm.goBack}
      />
    );
  }

  return (
    <View style={styles.root}>
      <ArtistEditProfileHeader onBack={vm.goBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ArtistEditProfilePhotoSection
          avatarUrl={vm.avatarUrl ?? undefined}
          uploading={false}
          onPress={vm.pickPhoto}
        />

        <ArtistEditProfileStatsSection
          showsRealizados={vm.showsRealizados}
          notaMedia={vm.notaMedia}
          estaDisponivel={vm.estaDisponivel}
          onDisponivelChange={vm.setEstaDisponivel}
        />

        <ArtistEditProfileFormField
          label="NOME ARTÍSTICO"
          value={vm.nome}
          onChangeText={vm.setNome}
          placeholder="Seu nome de palco"
          error={vm.errors.nome}
          maxLength={80}
        />

        <ArtistEditProfileFormField
          label="BIOGRAFIA"
          value={vm.bio}
          onChangeText={vm.setBio}
          multiline
          placeholder="Conte sobre você e sua música"
          error={vm.errors.bio}
          style={styles.textArea}
          maxLength={500}
        />

        <ArtistEditProfileTypeChips
          value={vm.tipo}
          onChange={vm.setTipo}
          error={vm.errors.tipo}
        />

        <ArtistEditProfileGenresSection
          selected={vm.generos}
          onToggle={vm.toggleGenero}
          error={vm.errors.generos}
        />

        <ArtistEditProfileChipSection
          title="Instrumentos"
          options={INSTRUMENTOS_OPCOES}
          selected={vm.instrumentos}
          onToggle={vm.toggleInstrumento}
          error={vm.errors.instrumentos}
        />

        <ArtistEditProfileFormField
          label="ANOS DE EXPERIÊNCIA"
          value={vm.experiencia}
          onChangeText={vm.setExperiencia}
          placeholder="Ex: 5"
          keyboardType="numeric"
          error={vm.errors.experiencia}
        />

        <Text style={styles.sectionTitle}>Faixa de cachê</Text>
        <View style={styles.row}>
          <View style={styles.flex}>
            <ArtistEditProfileFormField
              label="MÍNIMO (R$)"
              labelVariant="field"
              value={vm.cacheMin}
              onChangeText={vm.setCacheMin}
              placeholder="500,00"
              keyboardType="numeric"
              error={vm.errors.cacheMin}
            />
          </View>
          <View style={styles.flex}>
            <ArtistEditProfileFormField
              label="MÁXIMO (R$)"
              labelVariant="field"
              value={vm.cacheMax}
              onChangeText={vm.setCacheMax}
              placeholder="2.000,00"
              keyboardType="numeric"
              error={vm.errors.cacheMax}
            />
          </View>
        </View>

        <ArtistEditProfileLocationSection
          estado={vm.estado}
          cidade={vm.cidade}
          selectedEstado={vm.selectedEstado}
          loadingEstados={vm.loadingEstados}
          loadingCidades={vm.loadingCidades}
          onOpenEstadoPicker={() => vm.openPicker("estado")}
          onOpenCidadePicker={() => vm.openPicker("cidade")}
          errors={vm.errors}
        />

        <ArtistEditProfileSoundSection
          temEstrutura={vm.temEstrutura}
          equipamentos={vm.estruturaSom}
          onTemEstruturaChange={vm.setTemEstrutura}
          onToggleEquipamento={vm.toggleEquipamento}
          error={vm.errors.estruturaSom}
        />

        <ArtistEditProfileFormField
          label="PORTFÓLIO ONLINE"
          value={vm.portfolio}
          onChangeText={vm.setPortfolio}
          placeholder="https://..."
          keyboardType="url"
          autoCapitalize="none"
        />

        <ArtistEditProfileLinksSection
          links={vm.links}
          novoLink={vm.novoLink}
          onNovoLinkChange={vm.setNovoLink}
          onAdd={vm.addLink}
          onRemove={vm.removeLink}
        />

        <ArtistEditProfilePressKitSection
          photos={vm.pressKitPhotos}
          onAdd={vm.addPressKitPhotos}
          onRemove={vm.removePressKitPhoto}
        />

        <ArtistEditProfileUnavailableSection
          dates={vm.datasIndisponiveis}
          novaData={vm.novaData}
          onNovaDataChange={vm.setNovaData}
          onAdd={vm.addUnavailableDate}
          onRemove={vm.removeUnavailableDate}
        />

        <ArtistEditProfileSaveButton saving={vm.saving} onPress={vm.handleSalvar} />
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
