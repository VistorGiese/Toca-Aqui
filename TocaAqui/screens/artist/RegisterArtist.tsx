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
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { colors } from "@/utils/colors";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/http/userService";
import Button from "../../components/Allcomponents/Button";
import Fund from "../../components/Allcomponents/Fund";
import Input from "../../components/Allcomponents/Input";
import ToBack from "../../components/Allcomponents/ToBack";

const { height } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RegisterFormData {
  nomeCompleto: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export default function RegisterArtist() {
  const navigation = useNavigation<NavigationProp>();
  const { signIn, signInWithToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarSenhaRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: "onTouched",
  });

  const senha = watch("senha");

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true);
    try {
      const response = await userService.register({
        nome_completo: data.nomeCompleto,
        email: data.email.trim(),
        senha: data.senha,
      });

      if (response.token && response.user) {
        await signInWithToken(response.token, { ...response.user, role: response.user.role || "common_user" });
      } else {
        await signIn(data.email.trim(), data.senha);
      }
      navigation.reset({ index: 0, routes: [{ name: "RoleSelection" }] });
    } catch (error: unknown) {
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message || "";
      if (status === 409 || (status === 400 && message.toLowerCase().includes("email"))) {
        setError("email", {
          type: "manual",
          message: "Este e-mail já está cadastrado.",
        });
      } else if (status === 403 && message.toLowerCase().includes("verificado")) {
        Alert.alert("Conta criada!", "Verifique seu e-mail para ativar a conta.");
      } else {
        Alert.alert("Erro", "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <Text style={styles.title}>
            CRIAR CONTA{"\n"}<Text style={styles.titleAccent}>ARTISTA</Text>
          </Text>
          <Text style={styles.subtitle}>
            Preencha seus dados para começar
          </Text>

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
                label="Nome completo"
                iconName="account-outline"
                placeholder="Seu nome"
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
                label="E-mail"
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
                message: "A senha deve ter no mínimo 8 caracteres",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Use letras maiúsculas, minúsculas e números",
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
                label="Senha"
                iconName="lock-outline"
                placeholder="Mínimo 8 caracteres"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={error?.message}
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => confirmarSenhaRef.current?.focus()}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmarSenha"
            rules={{
              required: "Confirme sua senha",
              validate: (value) =>
                value === senha || "As senhas não coincidem",
            }}
            render={({
              field: { onChange, onBlur, value, ref },
              fieldState: { error },
            }) => (
              <Input
                inputRef={(el) => {
                  ref(el);
                  confirmarSenhaRef.current = el;
                }}
                label="Confirmar senha"
                iconName="lock-check-outline"
                placeholder="Repita sua senha"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={error?.message}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <Button
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.purpleDark} />
            ) : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090F",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: height * 0.15,
    paddingBottom: 40,
    zIndex: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "AkiraExpanded-Superbold",
    textAlign: "center",
    marginBottom: 10,
  },
  titleAccent: {
    color: "#4ECDC4",
  },
  subtitle: {
    color: "#A0A0B8",
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: "95%",
    height: 60,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 22,
    color: colors.purpleDark,
  },
});
