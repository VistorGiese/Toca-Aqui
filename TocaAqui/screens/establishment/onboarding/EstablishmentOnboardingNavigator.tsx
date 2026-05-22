import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { EstablishmentOnboardingProvider } from "./context/EstablishmentOnboardingContext";
import OnboardingEstIdentidadeScreen from "./OnboardingEstIdentidadeScreen";
import OnboardingEstFuncionamentoScreen from "./OnboardingEstFuncionamentoScreen";
import OnboardingEstPerfilScreen from "./OnboardingEstPerfilScreen";
import OnboardingEstApresentacaoScreen from "./OnboardingEstApresentacaoScreen";

export type EstablishmentOnboardingStackParamList = {
  OnboardingEstIdentidade: undefined;
  OnboardingEstFuncionamento: undefined;
  OnboardingEstPerfil: undefined;
  OnboardingEstApresentacao: undefined;
};

const Stack = createNativeStackNavigator<EstablishmentOnboardingStackParamList>();

export default function EstablishmentOnboardingNavigator() {
  return (
    <EstablishmentOnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OnboardingEstIdentidade" component={OnboardingEstIdentidadeScreen} />
        <Stack.Screen name="OnboardingEstFuncionamento" component={OnboardingEstFuncionamentoScreen} />
        <Stack.Screen name="OnboardingEstPerfil" component={OnboardingEstPerfilScreen} />
        <Stack.Screen name="OnboardingEstApresentacao" component={OnboardingEstApresentacaoScreen} />
      </Stack.Navigator>
    </EstablishmentOnboardingProvider>
  );
}
