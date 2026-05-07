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
      const status = (error as any)?.response?.status;
      const message: string = (error as any)?.response?.data?.message ?? "";

      if (status === 409 || (status === 400 && message.toLowerCase().includes("email"))) {
        setError("email", { type: "manual", message: "Este e-mail já está cadastrado." });
      } else if (!status) {
        Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.");
      } else {
        Alert.alert("Erro", message || "Erro ao criar conta. Tente novamente.");
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
