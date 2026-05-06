import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/Navigate";
import { colors } from "@/utils/colors";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/http/userService";
import Button from "../components/Allcomponents/Button";
import Input from "../components/Allcomponents/Input";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RegisterFormData {
  nomeCompleto: string;
  email: string;
  senha: string;
}

export default function Register() {
  const navigation = useNavigation<NavigationProp>();
  const { signIn, signInWithToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: "onTouched",
  });

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true);
    try {
      const response = await userService.register({
        nome_completo: data.nomeCompleto,
        email: data.email.trim(),
        senha: data.senha,
      });

      if (response.token && response.user) {
        await signInWithToken(response.token, {
          ...response.user,
          role: response.user.role || "common_user",
        });
      } else {
        await signIn(data.email.trim(), data.senha);
      }
      navigation.reset({ index: 0, routes: [{ name: "UserOnboardingGenres" }] });
    } catch (error: unknown) {
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message || "";
      if (
        status === 409 ||
        (status === 400 && message.toLowerCase().includes("email"))
      ) {
        setError("email", {
          type: "manual",
          message: "Este e-mail já está cadastrado.",
        });
      } else {
        Alert.alert("Erro", "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CRIAR CONTA</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="waveform" size={38} color="#A78BFA" />
            </View>
            <Text style={styles.logoTitle}>TOCA AQUI</Text>
            <Text style={styles.logoSubtitle}>Sua jornada musical começa aqui.</Text>
          </View>

          {/* Campos */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="nomeCompleto"
              rules={{
                required: "Nome completo é obrigatório",
                maxLength: { value: 100, message: "Máximo 100 caracteres" },
              }}
              render={({
                field: { onChange, onBlur, value, ref },
                fieldState: { error },
              }) => (
                <Input
                  inputRef={ref}
                  label="NOME COMPLETO"
                  iconName="account-outline"
                  placeholder="Como devemos te chamar?"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={error?.message}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "E-mail inválido",
                },
              }}
              render={({
                field: { onChange, onBlur, value, ref },
                fieldState: { error },
              }) => (
                <Input
                  inputRef={(el) => {
                    ref(el);
                    emailRef.current = el;
                  }}
                  label="E-MAIL"
                  iconName="email-outline"
                  placeholder="seu@email.com"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={error?.message}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => senhaRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="senha"
              rules={{
                required: "Senha é obrigatória",
                minLength: {
                  value: 8,
                  message: "Mínimo 8 caracteres",
                },
              }}
              render={({
                field: { onChange, onBlur, value, ref },
                fieldState: { error },
              }) => (
                <Input
                  inputRef={(el) => {
                    ref(el);
                    senhaRef.current = el;
                  }}
                  label="SENHA"
                  iconName="lock-outline"
                  placeholder="Mínimo 8 caracteres"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={error?.message}
                  secureTextEntry={!senhaVisivel}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
          </View>

          {/* Termos */}
          <Text style={styles.termsText}>
            Ao criar sua conta, você concorda com nossos{" "}
            <Text style={styles.termsLink}>Termos de Uso e Privacidade</Text>.
          </Text>

          {/* Botão */}
          <Button
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.purpleDark} />
            ) : (
              <Text style={styles.buttonText}>CRIAR CONTA</Text>
            )}
          </Button>

          {/* Link para login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
            >
              Entrar
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D14",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#A78BFA",
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 36,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 2,
    marginBottom: 6,
  },
  logoSubtitle: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  formContainer: {
    width: "100%",
    gap: 4,
  },
  termsText: {
    color: "#666",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  termsLink: {
    color: "#A78BFA",
    textDecorationLine: "underline",
  },
  button: {
    width: "100%",
    height: 56,
  },
  buttonText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: colors.purpleDark,
    letterSpacing: 1,
  },
  loginRow: {
    flexDirection: "row",
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    color: "#888",
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
  },
  loginLink: {
    color: "#A78BFA",
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
  },
});
