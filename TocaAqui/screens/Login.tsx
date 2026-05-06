import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../http/userService";
import { RootStackParamList } from "../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoginFormData {
  email: string;
  senha: string;
}

export default function Login() {
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

      // Sempre persiste estabelecimentoId se o usuário tiver estabelecimento
      if (pags?.pagina_estabelecimento) {
        await AsyncStorage.setItem('estabelecimentoId', String(pags.pagina_estabelecimento.id));
      }

      if (pags?.pagina_artista && pags?.pagina_estabelecimento) {
        // Tem as duas páginas — vai para artista por padrão (pode mudar depois)
        navigation.reset({ index: 0, routes: [{ name: 'ArtistNavigator' }] });
      } else if (pags?.pagina_artista) {
        navigation.reset({ index: 0, routes: [{ name: 'ArtistNavigator' }] });
      } else if (pags?.pagina_estabelecimento) {
        navigation.reset({ index: 0, routes: [{ name: 'EstablishmentNavigator' }] });
      } else {
        // Usuário sem páginas — fluxo de escolha ou UserNavigator
        navigation.reset({ index: 0, routes: [{ name: 'UserNavigator' }] });
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "E-mail ou senha inválidos.";
      setError("email", { type: "manual", message });
      setError("senha", { type: "manual", message: " " });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      {/* Textura de estrelas */}
      <Image
        source={require("../assets/images/Login/gridStarts.png")}
        style={s.bgTexture}
        resizeMode="cover"
      />

      {/* Glow roxo atrás do logo */}
      <View style={s.glow} pointerEvents="none" />

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={s.logoWrap}>
            <View style={s.logoIcon}>
              <MaterialCommunityIcons name="waveform" size={32} color="#A78BFA" />
            </View>
            <Text style={s.logoTitle}>TOCA AQUI</Text>
            <Text style={s.logoSub}>BACKSTAGE PASS</Text>
          </View>

          {/* ── Heading ── */}
          <View style={s.headingWrap}>
            <Text style={s.heading}>Bem-vindo de volta</Text>
            <Text style={s.headingSub}>Acesse o seu backstage digital</Text>
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
              <View style={s.fieldWrap}>
                <Text style={s.label}>E-MAIL</Text>
                <View style={[s.inputRow, error && s.inputError]}>
                  <Ionicons name="mail-outline" size={18} color="#6B7280" style={s.inputIcon} />
                  <TextInput
                    ref={ref}
                    style={s.input}
                    placeholder="nome@exemplo.com"
                    placeholderTextColor="#3D3D5C"
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
                  <Text style={s.errorText}>{error.message}</Text>
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
              <View style={s.fieldWrap}>
                <Text style={s.label}>SENHA</Text>
                <View style={[s.inputRow, error && s.inputError]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={s.inputIcon} />
                  <TextInput
                    ref={(el) => {
                      ref(el);
                      senhaRef.current = el;
                    }}
                    style={s.input}
                    placeholder="••••••••"
                    placeholderTextColor="#3D3D5C"
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
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {error?.message && error.message !== " " && (
                  <Text style={s.errorText}>{error.message}</Text>
                )}
              </View>
            )}
          />

          {/* ── Esqueci senha ── */}
          <TouchableOpacity
            style={s.forgotWrap}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={s.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* ── Botão ENTRAR ── */}
          <TouchableOpacity
            style={[s.btn, isSubmitting && s.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.btnText}>ENTRAR</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          {/* ── Cadastre-se ── */}
          <Pressable
            style={s.registerRow}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={s.registerText}>Não tem conta? </Text>
            <Text style={s.registerLink}>Cadastre-se</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090F" },

  // Background
  bgTexture: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.06,
  },
  glow: {
    position: "absolute",
    top: -120,
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#7B61FF",
    opacity: 0.18,
  },

  // Layout
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "center",
  },

  // Logo
  logoWrap: { alignItems: "center", marginBottom: 40 },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(123,97,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(123,97,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  logoTitle: {
    fontFamily: "AkiraExpanded-SuperBold",
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: 5,
  },
  logoSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#A78BFA",
    letterSpacing: 3,
  },

  // Heading
  headingWrap: { marginBottom: 32 },
  heading: {
    fontFamily: "Montserrat-Bold",
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  headingSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#8888AA",
  },

  // Fields
  fieldWrap: { marginBottom: 16 },
  label: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#8888AA",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F0B1E",
    borderWidth: 1,
    borderColor: "#1E1A30",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputIcon: { marginRight: 2 },
  input: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: "#FFFFFF",
    padding: 0,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
  },

  // Esqueci senha
  forgotWrap: { alignItems: "flex-end", marginBottom: 28, marginTop: 4 },
  forgotText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#A78BFA",
  },

  // Botão
  btn: {
    backgroundColor: "#7B61FF",
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },

  // Cadastre-se
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#8888AA",
  },
  registerLink: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#A78BFA",
  },
});
