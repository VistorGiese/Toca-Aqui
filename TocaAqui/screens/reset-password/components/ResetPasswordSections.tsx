import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface PasswordFieldProps {
  label: string;
  value: string;
  error?: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggleShow: () => void;
}

function PasswordField({
  label,
  value,
  error,
  show,
  onChange,
  onToggleShow,
}: PasswordFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={DS.placeholder}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleShow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

interface FormProps {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirm: boolean;
  errors: { password?: string; confirmPassword?: string };
  apiError: string;
  loading: boolean;
  hasToken: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirm: () => void;
  onSubmit: () => void;
}

export function ResetPasswordFormSection({
  password,
  confirmPassword,
  showPassword,
  showConfirm,
  errors,
  apiError,
  loading,
  hasToken,
  onPasswordChange,
  onConfirmChange,
  onTogglePassword,
  onToggleConfirm,
  onSubmit,
}: FormProps) {
  return (
    <>
      <Image
        source={require("../../../assets/images/Login/gridStarts.png")}
        style={styles.bgTexture}
        resizeMode="cover"
      />
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={32} color={DS.accentLight} />
        </View>
      </View>

      <Text style={styles.heading}>Nova senha</Text>
      <Text style={styles.headingSub}>Defina uma nova senha para sua conta.</Text>

      {!hasToken ? (
        <Text style={styles.errorText}>Link inválido. Solicite um novo link de redefinição.</Text>
      ) : (
        <>
          <PasswordField
            label="NOVA SENHA"
            value={password}
            error={errors.password}
            show={showPassword}
            onChange={onPasswordChange}
            onToggleShow={onTogglePassword}
          />
          <PasswordField
            label="CONFIRMAR SENHA"
            value={confirmPassword}
            error={errors.confirmPassword}
            show={showConfirm}
            onChange={onConfirmChange}
            onToggleShow={onToggleConfirm}
          />
          {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>REDEFINIR SENHA</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </>
  );
}

interface SuccessProps {
  onGoToLogin: () => void;
}

export function ResetPasswordSuccessSection({ onGoToLogin }: SuccessProps) {
  return (
    <View style={styles.successWrap}>
      <Image
        source={require("../../../assets/images/Login/gridStarts.png")}
        style={styles.bgTexture}
        resizeMode="cover"
      />
      <View style={styles.glow} pointerEvents="none" />
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle-outline" size={40} color="#22C55E" />
      </View>
      <Text style={styles.heading}>Senha redefinida!</Text>
      <Text style={styles.headingSub}>Sua senha foi alterada com sucesso. Faça login com a nova senha.</Text>
      <TouchableOpacity style={styles.btn} onPress={onGoToLogin} activeOpacity={0.85}>
        <Text style={styles.btnText}>IR PARA O LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}
