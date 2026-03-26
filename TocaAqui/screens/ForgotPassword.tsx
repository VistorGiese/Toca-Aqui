import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigate";
import { userService } from "../http/userService";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPassword() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleEnviar() {
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErro("Informe seu e-mail.");
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailTrimmed)) {
      setErro("E-mail inválido.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      await userService.redefinirSenha(emailTrimmed);
      setEnviado(true);
    } catch (err: any) {
      // Backend pode retornar 404 se email não cadastrado — não revelamos por segurança
      setEnviado(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      {/* Textura de fundo */}
      <Image
        source={require("../assets/images/Login/gridStarts.png")}
        style={s.bgTexture}
        resizeMode="cover"
      />

      {/* Glow */}
      <View style={s.glow} pointerEvents="none" />

      {/* Botão voltar */}
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#A78BFA" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {enviado ? (
            /* ── Estado: e-mail enviado ── */
            <View style={s.successWrap}>
              <View style={s.successIcon}>
                <Ionicons name="mail-open-outline" size={36} color="#A78BFA" />
              </View>
              <Text style={s.heading}>E-mail enviado!</Text>
              <Text style={s.headingSub}>
                Se esse endereço estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada.
              </Text>
              <TouchableOpacity
                style={s.btn}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.85}
              >
                <Text style={s.btnText}>VOLTAR AO LOGIN</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Estado: formulário ── */
            <>
              {/* Ícone */}
              <View style={s.iconWrap}>
                <View style={s.iconCircle}>
                  <Ionicons name="lock-open-outline" size={32} color="#A78BFA" />
                </View>
              </View>

              {/* Heading */}
              <View style={s.headingWrap}>
                <Text style={s.heading}>Esqueceu a senha?</Text>
                <Text style={s.headingSub}>
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </Text>
              </View>

              {/* Campo e-mail */}
              <View style={s.fieldWrap}>
                <Text style={s.label}>E-MAIL</Text>
                <View style={[s.inputRow, erro ? s.inputError : null]}>
                  <Ionicons name="mail-outline" size={18} color="#6B7280" style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="nome@exemplo.com"
                    placeholderTextColor="#3D3D5C"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setErro(""); }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="send"
                    onSubmitEditing={handleEnviar}
                  />
                </View>
                {erro ? <Text style={s.errorText}>{erro}</Text> : null}
              </View>

              {/* Botão */}
              <TouchableOpacity
                style={[s.btn, loading && s.btnDisabled]}
                onPress={handleEnviar}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={s.btnText}>ENVIAR LINK</Text>
                    <Ionicons name="send-outline" size={16} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              {/* Voltar ao login */}
              <TouchableOpacity
                style={s.backToLogin}
                onPress={() => navigation.navigate("Login")}
              >
                <Ionicons name="arrow-back" size={14} color="#8888AA" />
                <Text style={s.backToLoginText}>Voltar ao login</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090F" },

  bgTexture: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.06,
  },
  glow: {
    position: "absolute",
    top: -100,
    alignSelf: "center",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#7B61FF",
    opacity: 0.15,
  },

  backBtn: {
    position: "absolute",
    top: 52,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(123,97,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 110,
    paddingBottom: 40,
    justifyContent: "center",
  },

  // Ícone principal
  iconWrap: { alignItems: "center", marginBottom: 32 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(123,97,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(123,97,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Heading
  headingWrap: { marginBottom: 32 },
  heading: {
    fontFamily: "Montserrat-Bold",
    fontSize: 26,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headingSub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#8888AA",
    lineHeight: 22,
  },

  // Campo
  fieldWrap: { marginBottom: 20 },
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
  inputError: { borderColor: "#EF4444" },
  errorText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
  },

  // Botão
  btn: {
    backgroundColor: "#7B61FF",
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },

  // Voltar ao login
  backToLogin: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  backToLoginText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#8888AA",
  },

  // Estado de sucesso
  successWrap: { alignItems: "center", paddingTop: 20 },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(123,97,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(123,97,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
});
