import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import OnboardingEstShell from "./components/OnboardingEstShell";
import PhotoGalleryEditor from "./components/PhotoGalleryEditor";
import { onboardingStyles as s } from "./styles";
import { useOnboardingEstApresentacao } from "./hooks/useOnboardingEstApresentacao";

export default function OnboardingEstApresentacaoScreen() {
  const vm = useOnboardingEstApresentacao();

  return (
    <OnboardingEstShell
      step={4}
      stepLabel="PASSO 4 DE 4"
      title="Apresentação"
      subtitle="Conte a história por trás do som e mostre a alma do seu espaço."
      primaryAction={{
        label: "CONCLUIR E IR PARA O APP",
        onPress: vm.submit,
        loading: vm.loading,
      }}
      linkAction={{ label: "REVISAR PASSOS ANTERIORES", onPress: vm.goBack }}
      headerRight={
        <TouchableOpacity onPress={vm.close} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      }
    >
      <Text style={s.sectionLabel}>SOBRE NOSSO ESPAÇO</Text>
      <View style={s.bioContainer}>
        <TextInput
          style={s.bioInput}
          placeholder="Descreva a acústica, a vibração e o que torna seu palco único..."
          placeholderTextColor={colors.placeholder}
          value={vm.bio}
          onChangeText={vm.setBio}
          multiline
          textAlignVertical="top"
        />
        <Text style={s.bioCounter}>{vm.bio.length} / 1000</Text>
      </View>

      <Text style={[s.sectionLabel, { marginTop: 20 }]}>GALERIA DE FOTOS</Text>
      <PhotoGalleryEditor photos={vm.fotos} onAdd={vm.addPhotos} onRemove={vm.removePhoto} />
    </OnboardingEstShell>
  );
}
