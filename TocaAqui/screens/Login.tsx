import { colors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Button from "../components/Allcomponents/Button";
import Fund from "../components/Allcomponents/Fund";
import Input from "../components/Allcomponents/Input";
import ToBack from "../components/Allcomponents/ToBack";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../http/userService";
import { RootStackParamList } from "../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoginFormData {
  email: string;
  senha: string;
}

const { width, height } = Dimensions.get("window");

export default function Login() {
  const navigation = useNavigation<NavigationProp>();
  const { signInWithToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
  } = useForm<LoginFormData>({
    mode: "onTouched",
  });

  const senhaRef = useRef<TextInput>(null);

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true);
    try {
      const response = await userService.login(data.email.trim(), data.senha);
      await signInWithToken(response.token, { ...response.user });

      const role = response.user.role;
      if (role === "artist") {
        navigation.reset({ index: 0, routes: [{ name: "ArtistNavigator" }] });
      } else if (role === "establishment") {
        navigation.reset({ index: 0, routes: [{ name: "HomePage" }] });
      } else {
        // common_user ou sem perfil: feed do usuário
        navigation.reset({ index: 0, routes: [{ name: "UserNavigator" }] });
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "E-mail ou senha inválidos.";

      setError("email", { type: "manual", message });
      setError("senha", { type: "manual", message: " " });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Fund />
      <ToBack />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <MaterialCommunityIcons name="waveform" size={38} color="#A78BFA" />
        </View>
        <Text style={styles.logoTitle}>TOCA AQUI</Text>
        <Text style={styles.logoSubtitle}>BACKSTAGE PASS</Text>
      </View>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Não tem uma conta? </Text>
        <Text
          style={styles.registerLink}
          onPress={() => navigation.navigate("Register")}
        >
          Cadastre-se
        </Text>
      </View>

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
            inputRef={ref}
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
            message: "A senha deve ter no mínimo 8 caracteres",
          },
        }}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error },
        }) => (
          <Input
            inputRef={(element) => {
              ref(element);
              senhaRef.current = element;
            }}
            label="SENHA"
            iconName="lock-outline"
            placeholder="Sua senha"
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

      <View style={styles.forgotPasswordContainer}>
        <Text
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          Esqueci minha senha
        </Text>
      </View>

      <Button
        style={styles.buttonPosition}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.purpleDark} />
        ) : (
          <Text style={styles.textButton}>Entrar</Text>
        )}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#1c0a37",
    width: width,
    height: height,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: -20,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  logoTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  logoSubtitle: {
    color: "#A78BFA",
    fontSize: 11,
    fontFamily: "Montserrat-Regular",
    letterSpacing: 3,
  },
  registerContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    zIndex: 10,
  },
  registerText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  registerLink: {
    color: "#A78BFA",
    fontFamily: "Montserrat-Bold",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  forgotPasswordContainer: {
    width: "95%",
    alignItems: "flex-end",
    marginBottom: 30,
    marginTop: 8,
  },
  forgotPassword: {
    color: "#A78BFA",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  buttonPosition: {
    width: "95%",
    height: 60,
  },
  textButton: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: colors.purpleDark,
    letterSpacing: 1,
  },
});
