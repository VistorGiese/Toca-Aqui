import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import {
  RegisterFooter,
  RegisterFormSection,
  RegisterHeader,
  RegisterLogoSection,
} from "./components";
import { styles } from "./styles";
import { useRegister } from "./useRegister";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Register() {
  const navigation = useNavigation<NavigationProp>();
  const {
    control,
    handleSubmit,
    isSubmitting,
    senhaVisivel,
    setSenhaVisivel,
    emailRef,
    senhaRef,
    onSubmit,
  } = useRegister();

  return (
    <View style={styles.container}>
      <RegisterHeader onClose={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.scrollInner}>
            <RegisterLogoSection />
            <RegisterFormSection
              control={control}
              senhaVisivel={senhaVisivel}
              emailRef={emailRef}
              senhaRef={senhaRef}
              onToggleSenha={() => setSenhaVisivel((v) => !v)}
              onSubmit={handleSubmit(onSubmit)}
            />
            <RegisterFooter
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit(onSubmit)}
              onLogin={() => navigation.navigate("Login")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
