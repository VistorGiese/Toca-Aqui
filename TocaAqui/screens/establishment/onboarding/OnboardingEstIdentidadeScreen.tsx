import React from "react";
import { Text, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/utils/colors";
import Input from "@/components/ui/Input";
import FieldError from "@/components/ui/FieldError";
import OnboardingEstShell from "./components/OnboardingEstShell";
import EstTypeSelector from "./components/EstTypeSelector";
import { onboardingStyles as s } from "./styles";
import { useOnboardingEstIdentidade } from "./hooks/useOnboardingEstIdentidade";
import { EstablishmentTipo } from "./context/types";

export default function OnboardingEstIdentidadeScreen() {
  const vm = useOnboardingEstIdentidade();

  return (
    <OnboardingEstShell
      step={1}
      stepLabel="PASSO 1 DE 4"
      stepName="Identidade"
      showHeaderBrand
      onBack={vm.goBackLogin}
      title={
        <Text style={s.title}>
          Conte sobre o seu <Text style={s.titleAccent}>Espaço</Text>
        </Text>
      }
      subtitle="Vamos começar personalizando a presença digital do seu estabelecimento."
      primaryAction={{ label: "PRÓXIMO PASSO →", onPress: () => vm.goNext(false) }}
      secondaryAction={{ label: "PULAR POR AGORA", onPress: vm.skip }}
    >
      <TouchableOpacity style={s.uploadBox} activeOpacity={0.75} onPress={vm.selectPhoto}>
        {vm.fotoUri ? (
          <Image source={{ uri: vm.fotoUri }} style={s.uploadPreview} />
        ) : (
          <>
            <MaterialCommunityIcons name="camera" size={28} color={colors.purpleLight} />
            <Text style={s.uploadLabel}>ADICIONAR FOTO DO LOCAL</Text>
            <Text style={s.uploadSub}>Logo ou fachada (Recomendado: 1080x1080px)</Text>
          </>
        )}
      </TouchableOpacity>

      <Input
        label="NOME DO ESTABELECIMENTO"
        placeholder="Ex: The Sonic Lounge"
        value={vm.nome}
        onChangeText={vm.setNome}
        error={vm.errors.nome}
        containerStyle={{ width: "100%", marginBottom: 4 }}
      />

      <Input
        label="CELULAR DO RESPONSÁVEL"
        placeholder="Ex: (11) 99999-9999"
        value={vm.telefone}
        onChangeText={vm.setTelefone}
        keyboardType="phone-pad"
        error={vm.errors.telefone}
        containerStyle={{ width: "100%", marginBottom: 4 }}
      />

      <Input
        label="CNPJ (OPCIONAL)"
        placeholder="00.000.000/0000-00"
        value={vm.cnpj}
        onChangeText={vm.setCnpj}
        keyboardType="number-pad"
        error={vm.errors.cnpj}
        containerStyle={{ width: "100%", marginBottom: 4 }}
      />

      <Text style={[s.sectionLabel, { marginTop: 12 }]}>TIPO DO LOCAL</Text>
      <EstTypeSelector
        value={vm.tipo}
        onChange={(tipo) => vm.setTipo(tipo as EstablishmentTipo)}
      />
      <FieldError message={vm.errors.tipo} />
    </OnboardingEstShell>
  );
}
