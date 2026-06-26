import React from "react";
import { View } from "react-native";
import { InitialActionsSection, InitialHeroSection } from "./components";
import { styles } from "./styles";
import { useInitial } from "./useInitial";

export default function Initial() {
  const vm = useInitial();

  return (
    <View style={styles.container}>
      <InitialHeroSection />
      <InitialActionsSection onLogin={vm.goToLogin} onRegister={vm.goToRegister} />
    </View>
  );
}
