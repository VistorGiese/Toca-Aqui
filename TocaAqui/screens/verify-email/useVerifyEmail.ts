import { useEffect, useState } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import api from "@/http/api";
import { VerifyEmailState } from "./types";

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "VerifyEmail">;

export function useVerifyEmail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const [state, setState] = useState<VerifyEmailState>({
    status: "loading",
    message: "Verificando seu e-mail...",
  });

  useEffect(() => {
    const token = route.params?.token;
    if (!token) {
      setState({
        status: "error",
        message: "Link inválido. Solicite um novo e-mail de verificação.",
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`/usuarios/verificar-email?token=${token}`);
        if (!cancelled) {
          setState({
            status: "success",
            message: res.data.message ?? "E-mail verificado com sucesso! Você já pode fazer login.",
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const apiError =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          setState({
            status: "error",
            message: apiError ?? "Não foi possível verificar o e-mail. O link pode ter expirado.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [route.params?.token]);

  const goToLogin = () => navigation.navigate("Login");

  return { state, goToLogin };
}
