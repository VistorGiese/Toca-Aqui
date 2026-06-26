import { useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { userService } from "@/http/userService";
import { RootStackParamList } from "@/navigation/Navigate";
import { SUCCESS_ALERT } from "./constants";
import { RegisterArtistFormData } from "./types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useArtistRegister() {
  const navigation = useNavigation<NavigationProp>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarSenhaRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    watch,
    setError,
  } = useForm<RegisterArtistFormData>({
    mode: "onTouched",
  });

  const senha = watch("senha");

  async function onSubmit(data: RegisterArtistFormData) {
    setIsSubmitting(true);
    try {
      await userService.register({
        nome_completo: data.nomeCompleto,
        email: data.email.trim(),
        senha: data.senha,
        tipo_usuario: "artist",
      });

      Alert.alert(SUCCESS_ALERT.title, SUCCESS_ALERT.message, [
        { text: SUCCESS_ALERT.button, onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number; data?: { message?: string } } })
        ?.response?.status;
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "";

      if (status === 409 || (status === 400 && message.toLowerCase().includes("email"))) {
        setError("email", {
          type: "manual",
          message: "Este e-mail já está cadastrado.",
        });
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
    senha,
    emailRef,
    senhaRef,
    confirmarSenhaRef,
    onSubmit,
  };
}
