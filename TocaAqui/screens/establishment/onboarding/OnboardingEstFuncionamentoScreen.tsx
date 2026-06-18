import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import Input from "@/components/ui/Input";
import FieldError from "@/components/ui/FieldError";
import OnboardingEstShell from "./components/OnboardingEstShell";
import LocationPickerModal from "./components/LocationPickerModal";
import WeekScheduleEditor from "./components/WeekScheduleEditor";
import { onboardingStyles as s } from "./styles";
import { useOnboardingEstFuncionamento } from "./hooks/useOnboardingEstFuncionamento";

export default function OnboardingEstFuncionamentoScreen() {
  const vm = useOnboardingEstFuncionamento();

  return (
    <>
      <OnboardingEstShell
        step={2}
        stepLabel="PASSO 2 DE 4"
        title="Localização e Funcionamento"
        subtitle="Defina onde você está localizado e quais são os momentos de maior vibração na sua agenda semanal."
        primaryAction={{ label: "PRÓXIMO PASSO →", onPress: vm.goNext }}
        secondaryAction={{ label: "VOLTAR", onPress: vm.goBack }}
      >
        <Text style={s.sectionLabel}>ENDEREÇO</Text>

        <Text style={s.fieldLabel}>ESTADO</Text>
        <TouchableOpacity
          style={[
            s.selector,
            !vm.draft.estado && s.selectorEmpty,
            vm.errors.estado && s.selectorError,
          ]}
          onPress={() => vm.openPicker("estado")}
          activeOpacity={0.75}
        >
          <Text style={vm.draft.estado ? s.selectorText : s.selectorPlaceholder}>
            {vm.selectedEstado
              ? `${vm.selectedEstado.nome} (${vm.selectedEstado.sigla})`
              : "Selecione o estado"}
          </Text>
          {vm.loadingEstados ? (
            <ActivityIndicator size="small" color={colors.purplePrimary} />
          ) : (
            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
          )}
        </TouchableOpacity>
        <FieldError message={vm.errors.estado} />

        <Text style={[s.fieldLabel, { marginTop: 12 }]}>CIDADE</Text>
        <TouchableOpacity
          style={[
            s.selector,
            !vm.draft.cidade && s.selectorEmpty,
            !vm.draft.estado && s.selectorDisabled,
            vm.errors.cidade && s.selectorError,
          ]}
          onPress={() => vm.draft.estado && vm.openPicker("cidade")}
          activeOpacity={vm.draft.estado ? 0.75 : 1}
        >
          <Text style={vm.draft.cidade ? s.selectorText : s.selectorPlaceholder}>
            {!vm.draft.estado
              ? "Selecione o estado primeiro"
              : vm.draft.cidade || "Selecione a cidade"}
          </Text>
          {vm.loadingCidades ? (
            <ActivityIndicator size="small" color={colors.purplePrimary} />
          ) : (
            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
          )}
        </TouchableOpacity>
        <FieldError message={vm.errors.cidade} />

        <View style={[s.row, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Input
              label="RUA / AVENIDA"
              placeholder="Ex: Av. Paulista"
              value={vm.draft.endereco}
              onChangeText={vm.setEndereco}
              error={vm.errors.endereco}
              containerStyle={{ width: "100%" }}
            />
          </View>
          <View style={{ width: 100 }}>
            <Input
              label="NÚMERO"
              placeholder="1578"
              value={vm.draft.numero}
              onChangeText={vm.setNumero}
              keyboardType="numeric"
              error={vm.errors.numero}
              containerStyle={{ width: "100%" }}
            />
          </View>
        </View>

        <Text style={[s.sectionLabel, { marginTop: 16 }]}>Dias e horários de shows</Text>
        <WeekScheduleEditor
          schedule={vm.draft.diasHorarios}
          onToggleDay={vm.toggleDay}
          onUpdateTime={vm.updateTime}
        />
      </OnboardingEstShell>

      <LocationPickerModal
        visible={vm.pickerMode !== null}
        mode={vm.pickerMode}
        searchText={vm.searchText}
        onSearchChange={vm.setSearchText}
        onClose={vm.closePicker}
        estados={vm.estados}
        cidades={vm.cidades}
        selectedEstadoSigla={vm.draft.estado}
        selectedCidadeId={vm.cidades.find((c) => c.nome === vm.draft.cidade)?.id}
        onSelectEstado={vm.selectEstado}
        onSelectCidade={vm.selectCidade}
      />
    </>
  );
}
