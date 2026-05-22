import React from "react";
import Input from "@/components/ui/Input";
import OnboardingEstShell from "./components/OnboardingEstShell";
import EstGenreChips from "./components/EstGenreChips";
import SoundStructureSection from "./components/SoundStructureSection";
import { useOnboardingEstPerfil } from "./hooks/useOnboardingEstPerfil";

export default function OnboardingEstPerfilScreen() {
  const vm = useOnboardingEstPerfil();

  return (
    <OnboardingEstShell
      step={3}
      stepLabel="PASSO 3 DE 4"
      stepName="Perfil & Estrutura"
      title="Qual o som da casa?"
      subtitle="Selecione os gêneros musicais predominantes no seu estabelecimento."
      primaryAction={{ label: "CONTINUAR →", onPress: vm.goNext }}
      secondaryAction={{ label: "VOLTAR", onPress: vm.goBack }}
    >
      <EstGenreChips selected={vm.generos} onToggle={vm.toggleGenero} />

      <SoundStructureSection
        enabled={vm.temEstrutura}
        selected={vm.estrutura}
        onToggleEnabled={vm.setTemEstrutura}
        onToggleItem={vm.toggleEstruturaItem}
      />

      <Input
        label="CAPACIDADE DO PÚBLICO (APROX.)"
        placeholder="Ex: 200"
        value={vm.capacidade}
        onChangeText={vm.setCapacidade}
        keyboardType="numeric"
        containerStyle={{ width: "100%", marginTop: 16 }}
      />
    </OnboardingEstShell>
  );
}
