import { useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { userService } from "@/http/userService";
import { RootStackParamList } from "../../navigation/Navigate";
import { RegisterFormData } from "./types";

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
        nome_completo: data.nomeCompleto,
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
      const axiosError = error as any;
      const status: number | undefined = axiosError?.response?.status;
      const message: string = axiosError?.response?.data?.message ?? "";
      const errorCode: string = axiosError?.code ?? "";

      if (__DEV__) {
        console.log("[Register] erro →", { status, message, errorCode, error });
      }

      if (status === 409 || (status === 400 && message.toLowerCase().includes("email"))) {
        setError("email", { type: "manual", message: "Este e-mail já está cadastrado." });
      } else if (errorCode === "ECONNABORTED") {
        Alert.alert("Tempo esgotado", "O servidor demorou demais para responder. Tente novamente.");
      } else if (!status) {
        Alert.alert(
          "Sem conexão",
          "Não foi possível alcançar o servidor. Verifique se o backend está rodando e se o dispositivo está na mesma rede."
        );
      } else if (status >= 400 && status < 500) {
        Alert.alert("Erro no cadastro", message || "Dados inválidos. Verifique os campos.");
      } else {
        Alert.alert("Erro no servidor", message || "Erro interno. Tente novamente mais tarde.");
      }
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
