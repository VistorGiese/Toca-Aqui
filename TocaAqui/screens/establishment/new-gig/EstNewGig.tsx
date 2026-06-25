import React from "react";
import { ScrollView, View } from "react-native";
import {
  EstNewGigCalendarModal,
  EstNewGigCapacitySection,
  EstNewGigCoverSection,
  EstNewGigDateSection,
  EstNewGigGenresSection,
  EstNewGigHeaderSection,
  EstNewGigInfoCard,
  EstNewGigLoadingState,
  EstNewGigPaymentSection,
  EstNewGigPublishButton,
  EstNewGigScheduleSection,
} from "./components";
import EstNewGigFormField from "./components/EstNewGigFormField";
import { styles } from "./styles";
import { useEstNewGig } from "./useEstNewGig";

export default function EstNewGig() {
  const vm = useEstNewGig();

  if (vm.loading) {
    return <EstNewGigLoadingState />;
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <EstNewGigHeaderSection isEditing={vm.isEditing} onCancel={vm.goBack} />

        <EstNewGigFormField
          label="TÍTULO DO EVENTO"
          placeholder="Ex: Festival de Inverno 2024"
          value={vm.titulo}
          onChangeText={vm.setTitulo}
          error={vm.errors.titulo}
        />

        <EstNewGigCoverSection capaUri={vm.capaUri} onSelectCover={vm.handleSelectCover} />

        <EstNewGigDateSection
          dataISO={vm.dataISO}
          error={vm.errors.data}
          onPress={vm.openCalendar}
        />

        <EstNewGigScheduleSection
          inicio={vm.inicio}
          fim={vm.fim}
          onInicioChange={vm.setInicio}
          onFimChange={vm.setFim}
          errors={{ inicio: vm.errors.inicio, fim: vm.errors.fim }}
        />

        <EstNewGigPaymentSection
          valorShow={vm.valorShow}
          valorIngresso={vm.valorIngresso}
          modoVendaIngresso={vm.modoVendaIngresso}
          onValorShowChange={vm.setValorShow}
          onValorIngressoChange={vm.setValorIngresso}
          onValorShowBlur={vm.blurValorShow}
          onValorIngressoBlur={vm.blurValorIngresso}
          onModoVendaChange={vm.setModoVendaIngresso}
        />

        <EstNewGigCapacitySection
          capacidade={vm.capacidade}
          onCapacidadeChange={vm.setCapacidade}
          error={vm.errors.capacidade}
        />

        <EstNewGigGenresSection
          selected={vm.generos}
          onToggle={vm.toggleGenero}
          error={vm.errors.generos}
        />

        <EstNewGigInfoCard />

        <EstNewGigPublishButton
          isEditing={vm.isEditing}
          saving={vm.saving}
          onPress={vm.handlePublicar}
        />
      </ScrollView>

      <EstNewGigCalendarModal
        visible={vm.showCalendar}
        dataISO={vm.dataISO}
        minDate={vm.today}
        onClose={() => vm.setShowCalendar(false)}
        onSelectDate={vm.selectDate}
      />
    </View>
  );
}
