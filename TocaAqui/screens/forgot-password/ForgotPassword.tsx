import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  ForgotPasswordFormSection,
  ForgotPasswordHeader,
  ForgotPasswordSuccessSection,
} from "./components";
import { styles } from "./styles";
import { useForgotPassword } from "./useForgotPassword";

export default function ForgotPassword() {
  const vm = useForgotPassword();

  return (
    <View style={styles.root}>
      <ForgotPasswordHeader onBack={vm.goBack} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {vm.enviado ? (
            <ForgotPasswordSuccessSection onBackToLogin={vm.goToLogin} />
          ) : (
            <ForgotPasswordFormSection
              email={vm.email}
              erro={vm.erro}
              loading={vm.loading}
              onEmailChange={vm.handleEmailChange}
              onSubmit={vm.handleEnviar}
              onBackToLogin={vm.goToLogin}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
