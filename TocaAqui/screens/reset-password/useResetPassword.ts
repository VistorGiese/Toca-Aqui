import { useCallback, useState } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/Navigate";
import { userService } from "@/http/userService";
import { validateResetPassword } from "./utils";

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "ResetPassword">;

export function useResetPassword() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const token = route.params?.token ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [apiError, setApiError] = useState("");

  const clearFieldError = useCallback((field: "password" | "confirmPassword") => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError("");
  }, []);

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      clearFieldError("password");
    },
    [clearFieldError]
  );

  const handleConfirmChange = useCallback(
    (value: string) => {
      setConfirmPassword(value);
      clearFieldError("confirmPassword");
    },
    [clearFieldError]
  );

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateResetPassword(password, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!token) {
      setApiError("Link inválido. Solicite um novo link de redefinição.");
      return;
    }

    setErrors({});
    setApiError("");
    setLoading(true);

    try {
      await userService.confirmarRedefinicaoSenha(token, password);
      setSuccess(true);
    } catch {
      setApiError("Não foi possível redefinir a senha. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, token]);

  const goToLogin = useCallback(() => navigation.navigate("Login"), [navigation]);

  return {
    password,
    confirmPassword,
    showPassword,
    showConfirm,
    loading,
    success,
    errors,
    apiError,
    hasToken: Boolean(token),
    setShowPassword,
    setShowConfirm,
    handlePasswordChange,
    handleConfirmChange,
    handleSubmit,
    goToLogin,
  };
}
