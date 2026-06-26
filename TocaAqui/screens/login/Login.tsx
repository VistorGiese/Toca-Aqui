import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import {
  LoginActions,
  LoginBackground,
  LoginFormFields,
  LoginLogoSection,
} from "./components";
import { styles } from "./styles";
import { useLogin } from "./useLogin";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Login() {
  const navigation = useNavigation<NavigationProp>();
  const {
    control,
    handleSubmit,
    isSubmitting,
    senhaVisivel,
    setSenhaVisivel,
    senhaRef,
    onSubmit,
  } = useLogin();

  return (
    <View style={styles.root}>
      <LoginBackground />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LoginLogoSection />
          <LoginFormFields
            control={control}
            senhaVisivel={senhaVisivel}
            senhaRef={senhaRef}
            onToggleSenha={() => setSenhaVisivel((v) => !v)}
            onSubmitSenha={handleSubmit(onSubmit)}
          />
          <LoginActions
            isSubmitting={isSubmitting}
            onForgotPassword={() => navigation.navigate("ForgotPassword")}
            onSubmit={handleSubmit(onSubmit)}
            onRegister={() => navigation.navigate("Register")}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
