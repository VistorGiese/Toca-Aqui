import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Fund from "@/components/Allcomponents/Fund";
import ToBack from "@/components/Allcomponents/ToBack";
import { RegisterArtistFormSection, RegisterArtistHeader } from "./components";
import { styles } from "./styles";
import { useArtistRegister } from "./useArtistRegister";

export default function ArtistRegister() {
  const vm = useArtistRegister();

  return (
    <View style={styles.container}>
      <Fund />
      <ToBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <RegisterArtistHeader />
          <RegisterArtistFormSection
            control={vm.control}
            handleSubmit={vm.handleSubmit}
            isSubmitting={vm.isSubmitting}
            senha={vm.senha}
            emailRef={vm.emailRef}
            senhaRef={vm.senhaRef}
            confirmarSenhaRef={vm.confirmarSenhaRef}
            onSubmit={vm.onSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
