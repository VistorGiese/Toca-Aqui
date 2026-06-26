import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { ResetPasswordFormSection, ResetPasswordSuccessSection } from "./components";
import { styles } from "./styles";
import { useResetPassword } from "./useResetPassword";

export default function ResetPassword() {
  const vm = useResetPassword();

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {vm.success ? (
            <ResetPasswordSuccessSection onGoToLogin={vm.goToLogin} />
          ) : (
            <ResetPasswordFormSection
              password={vm.password}
              confirmPassword={vm.confirmPassword}
              showPassword={vm.showPassword}
              showConfirm={vm.showConfirm}
              errors={vm.errors}
              apiError={vm.apiError}
              loading={vm.loading}
              hasToken={vm.hasToken}
              onPasswordChange={vm.handlePasswordChange}
              onConfirmChange={vm.handleConfirmChange}
              onTogglePassword={() => vm.setShowPassword((v) => !v)}
              onToggleConfirm={() => vm.setShowConfirm((v) => !v)}
              onSubmit={vm.handleSubmit}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
