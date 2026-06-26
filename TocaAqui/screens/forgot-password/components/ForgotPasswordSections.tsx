import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  onBack: () => void;
}

export default function ForgotPasswordHeader({ onBack }: Props) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <Image
        source={require("../../../assets/images/Login/gridStarts.png")}
        style={styles.bgTexture}
        resizeMode="cover"
      />
      <View style={styles.glow} pointerEvents="none" />
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color={DS.accentLight} />
      </TouchableOpacity>
    </>
  );
}

interface FormProps {
  email: string;
  erro: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordFormSection({
  email,
  erro,
  loading,
  onEmailChange,
  onSubmit,
  onBackToLogin,
}: FormProps) {
  return (
    <>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-open-outline" size={32} color={DS.accentLight} />
        </View>
      </View>

      <View style={styles.headingWrap}>
        <Text style={styles.heading}>Esqueceu a senha?</Text>
        <Text style={styles.headingSub}>
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>E-MAIL</Text>
        <View style={[styles.inputRow, erro ? styles.inputError : null]}>
          <Ionicons name="mail-outline" size={18} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="nome@exemplo.com"
            placeholderTextColor={DS.placeholder}
            value={email}
            onChangeText={onEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="send"
            onSubmitEditing={onSubmit}
          />
        </View>
        {erro ? <Text style={styles.errorText}>{erro}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.btnText}>ENVIAR LINK</Text>
            <Ionicons name="send-outline" size={16} color="#fff" style={{ marginLeft: 8 }} />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backToLogin} onPress={onBackToLogin}>
        <Ionicons name="arrow-back" size={14} color={DS.textMuted} />
        <Text style={styles.backToLoginText}>Voltar ao login</Text>
      </TouchableOpacity>
    </>
  );
}

interface SuccessProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordSuccessSection({ onBackToLogin }: SuccessProps) {
  return (
    <View style={styles.successWrap}>
      <View style={styles.successIcon}>
        <Ionicons name="mail-open-outline" size={36} color={DS.accentLight} />
      </View>
      <Text style={styles.heading}>E-mail enviado!</Text>
      <Text style={styles.headingSub}>
        Se esse endereço estiver cadastrado, você receberá um link para redefinir sua senha.
        Verifique sua caixa de entrada.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onBackToLogin} activeOpacity={0.85}>
        <Text style={styles.btnText}>VOLTAR AO LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}
