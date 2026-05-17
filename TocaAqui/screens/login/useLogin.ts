import { useRef, useState } from "react";
import { TextInput } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/http/userService";
import { RootStackParamList } from "../../navigation/Navigate";
import { LoginFormData } from "./types";
import { getApiErrorMessage } from "@/utils/errorHandler";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useLogin() {
  const navigation = useNavigation<NavigationProp>();
  const { signInWithToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const senhaRef = useRef<TextInput>(null);

  const { control, handleSubmit, setError } = useForm<LoginFormData>({
    mode: "onTouched",
  });

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true);
    try {
      const response = await userService.login(data.email.trim(), data.senha);
      const pags = await signInWithToken(response.token, { ...response.user });

      if (pags?.pagina_estabelecimento) {
        await AsyncStorage.setItem(
          "estabelecimentoId",
          String(pags.pagina_estabelecimento.id)
        );
      }

      if (pags?.pagina_artista && pags?.pagina_estabelecimento) {
        navigation.reset({ index: 0, routes: [{ name: "ArtistNavigator" }] });
      } else if (pags?.pagina_artista) {
        navigation.reset({ index: 0, routes: [{ name: "ArtistNavigator" }] });
      } else if (pags?.pagina_estabelecimento) {
        navigation.reset({ index: 0, routes: [{ name: "EstablishmentNavigator" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "UserNavigator" }] });
      }
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "E-mail ou senha inválidos.");
      setError("email", { type: "manual", message });
      setError("senha", { type: "manual", message: " " });
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
    senhaRef,
    onSubmit,
  };
}
