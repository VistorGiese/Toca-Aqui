import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import { userService } from "@/http/userService";
import { validateForgotPasswordEmail } from "./utils";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function useForgotPassword() {
  const navigation = useNavigation<NavProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const clearError = useCallback(() => setErro(""), []);

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      clearError();
    },
    [clearError]
  );

  const handleEnviar = useCallback(async () => {
    const validationError = validateForgotPasswordEmail(email);
    if (validationError) {
      setErro(validationError);
      return;
    }

    setErro("");
    setLoading(true);
    try {
      await userService.redefinirSenha(email.trim());
      setEnviado(true);
    } catch {
      setEnviado(true);
    } finally {
      setLoading(false);
    }
  }, [email]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const goToLogin = useCallback(() => navigation.navigate("Login"), [navigation]);

  return {
    email,
    loading,
    enviado,
    erro,
    handleEmailChange,
    handleEnviar,
    goBack,
    goToLogin,
  };
}
