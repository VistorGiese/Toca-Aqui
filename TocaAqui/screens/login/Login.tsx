import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller } from "react-hook-form";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { colors } from "@/utils/colors";
import { styles } from "./styles";
import { useLogin } from "./useLogin";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Login() {
  const navigation = useNavigation<NavigationProp>();
  const {
    control,
    handleSubmit,
    isSubmitting,
    senhaVisivel,
    setSenhaVisivel,
    senhaRef,
    onSubmit,
  } = useLogin();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Textura de estrelas */}
      <Image
        source={require("../../assets/images/Login/gridStarts.png")}
        style={styles.bgTexture}
        resizeMode="cover"
      />

      {/* Glow roxo atrás do logo */}
      <View style={styles.glow} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="waveform" size={32} color={colors.purpleLight} />
            </View>
            <Text style={styles.logoTitle}>TOCA AQUI</Text>
            <Text style={styles.logoSub}>BACKSTAGE PASS</Text>
          </View>

          {/* ── Heading ── */}
          <View style={styles.headingWrap}>
            <Text style={styles.heading}>Bem-vindo de volta</Text>
            <Text style={styles.headingSub}>Acesse o seu backstage digital</Text>
          </View>

          {/* ── Campo E-MAIL ── */}
          <Controller
            control={control}
            name="email"
            rules={{
              required: "E-mail é obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "E-mail inválido",
              },
            }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>E-MAIL</Text>
                <View style={[styles.inputRow, error && styles.inputError]}>
                  <Ionicons name="mail-outline" size={18} color={colors.neutral} style={styles.inputIcon} />
                  <TextInput
                    ref={ref}
                    style={styles.input}
                    placeholder="nome@exemplo.com"
                    placeholderTextColor={colors.placeholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => senhaRef.current?.focus()}
                  />
                </View>
                {error?.message && error.message !== " " && (
                  <Text style={styles.errorText}>{error.message}</Text>
                )}
              </View>
            )}
          />

          {/* ── Campo SENHA ── */}
          <Controller
            control={control}
            name="senha"
            rules={{
              required: "Senha é obrigatória",
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
            }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>SENHA</Text>
                <View style={[styles.inputRow, error && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.neutral} style={styles.inputIcon} />
                  <TextInput
                    ref={(el) => {
                      ref(el);
                      senhaRef.current = el;
                    }}
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.placeholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!senhaVisivel}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                  <TouchableOpacity
                    onPress={() => setSenhaVisivel((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={senhaVisivel ? "eye-outline" : "eye-off-outline"}
                      size={18}
                      color={colors.neutral}
                    />
                  </TouchableOpacity>
                </View>
                {error?.message && error.message !== " " && (
                  <Text style={styles.errorText}>{error.message}</Text>
                )}
              </View>
            )}
          />

          {/* ── Esqueci senha ── */}
          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* ── Botão ENTRAR ── */}
          <TouchableOpacity
            style={[styles.btn, isSubmitting && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.btnText}>ENTRAR</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          {/* ── Cadastre-se ── */}
          <Pressable
            style={styles.registerRow}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerText}>Não tem conta? </Text>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
