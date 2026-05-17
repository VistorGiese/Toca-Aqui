import { useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { userService } from "@/http/userService";
import { RootStackParamList } from "../../navigation/Navigate";
import { RegisterFormData } from "./types";
import {
  applyApiFieldErrors,
  getApiErrorMessage,
  getApiValidationDetails,
} from "@/utils/errorHandler";
import { isAxiosError } from "axios";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useRegister() {
  const navigation = useNavigation<NavigationProp>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  const { control, handleSubmit, setError } = useForm<RegisterFormData>({
    mode: "onTouched",
  });

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true);
    try {
      await userService.register({
        nome_completo: data.nomeCompleto.trim(),
        email: data.email.trim(),
        senha: data.senha,
        tipo_usuario: "common_user",
      });

      Alert.alert(
        "Conta criada!",
        "Verifique seu email para ativar a conta antes de fazer login.",
        [{ text: "Ir para login", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const message = getApiErrorMessage(error, "");
      const detalhes = getApiValidationDetails(error);

      if (__DEV__) {
        console.log("[Register] erro →", {
          status,
          message,
          detalhes,
          code: isAxiosError(error) ? error.code : undefined,
          axiosMessage: isAxiosError(error) ? error.message : undefined,
          body: isAxiosError(error) ? error.response?.data : undefined,
        });
      }

      if (applyApiFieldErrors(detalhes, setError)) {
        return;
      }

      const msgLower = message.toLowerCase();

      if (
        status === 409 ||
        (status === 400 && (msgLower.includes("email") || msgLower.includes("e-mail")))
      ) {
        setError("email", {
          type: "manual",
          message: message || "Este e-mail já está cadastrado.",
        });
        return;
      }

      if (isAxiosError(error) && error.code === "ECONNABORTED") {
        Alert.alert("Tempo esgotado", "O servidor demorou demais para responder. Tente novamente.");
        return;
      }

      if (!status) {
        Alert.alert(
          "Sem conexão",
          "Não foi possível alcançar o servidor. Verifique se o backend está rodando e se o dispositivo está na mesma rede."
        );
        return;
      }

      if (status >= 400 && status < 500) {
        Alert.alert("Erro no cadastro", message || "Dados inválidos. Verifique os campos.");
        return;
      }

      Alert.alert("Erro no servidor", message || "Erro interno. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    control,
    handleSubmit,
    isSubmitting,
    senhaVisivel,
    setSenhaVisivel,
    emailRef,
    senhaRef,
    onSubmit,
  };
}
