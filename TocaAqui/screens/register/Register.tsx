import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { colors } from "@/utils/colors";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="close" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

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
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/adaptive-icon.png")} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.logoSubtitle}>Sua jornada musical começa aqui.</Text>
          </View>

          <View style={styles.formContainer}>
            <FormField
              control={control}
              name="nomeCompleto"
              rules={{
                required: "Nome completo é obrigatório",
                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                maxLength: { value: 100, message: "Máximo 100 caracteres" },
              }}
              label="NOME COMPLETO"
              iconName="account-outline"
              placeholder="Como devemos te chamar?"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <FormField
              control={control}
              name="email"
              rules={{
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "E-mail inválido",
                },
              }}
              label="E-MAIL"
              iconName="email-outline"
              placeholder="seu@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => senhaRef.current?.focus()}
              onMount={(el) => { emailRef.current = el; }}
            />

            <FormField
              control={control}
              name="senha"
              rules={{
                required: "Senha é obrigatória",
                minLength: { value: 8, message: "Mínimo 8 caracteres" },
                validate: (v: string) =>
                  (/[A-Z]/.test(v) && /[0-9]/.test(v)) ||
                  "Precisa ter ao menos 1 maiúscula e 1 número",
              }}
              label="SENHA"
              iconName="lock-outline"
              placeholder="Mínimo 8 caracteres"
              secureTextEntry={!senhaVisivel}
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              onMount={(el) => { senhaRef.current = el; }}
              rightElement={
                <Pressable
                  onPress={() => setSenhaVisivel((v) => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.neutral}
                  />
                </Pressable>
              }
            />
          </View>

          <Text style={styles.termsText}>
            Ao criar sua conta, você concorda com nossos{" "}
            <Text style={styles.termsLink}>Termos de Uso e Privacidade</Text>.
          </Text>

          <Button
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.buttonText}>CRIAR CONTA</Text>
            }
          </Button>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <Text style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
              Entrar
            </Text>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
