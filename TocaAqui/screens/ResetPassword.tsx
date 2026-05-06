import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigate";
import { userService } from "../http/userService";

type RouteP = RouteProp<RootStackParamList, "ResetPassword">;
type NavP = NativeStackNavigationProp<RootStackParamList>;

export default function ResetPassword() {
  const navigation = useNavigation<NavP>();
  const route = useRoute<RouteP>();
  const token = route.params?.token ?? "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleRedefinir() {
    if (!novaSenha || !confirmar) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      await userService.confirmarRedefinicaoSenha(token, novaSenha);
      setSucesso(true);
    } catch (err: any) {
      setErro(err.response?.data?.error ?? "Token inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <View style={s.root}>
        <Ionicons name="checkmark-circle-outline" size={72} color="#A78BFA" />
        <Text style={s.title}>Senha redefinida!</Text>
        <Text style={s.sub}>Sua nova senha foi salva com sucesso.</Text>
        <TouchableOpacity
          style={s.btn}
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>IR PARA O LOGIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={{ width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.iconCircle}>
            <Ionicons name="lock-closed-outline" size={32} color="#A78BFA" />
          </View>

          <Text style={s.title}>Nova senha</Text>
          <Text style={s.sub}>
            Escolha uma senha com no mínimo 8 caracteres, uma letra maiúscula e
            um número.
          </Text>

          <Text style={s.label}>NOVA SENHA</Text>
          <View style={[s.inputRow, erro ? s.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
            <TextInput
              style={s.input}
              placeholder="Nova senha"
              placeholderTextColor="#3D3D5C"
              secureTextEntry
              value={novaSenha}
              onChangeText={(t) => { setNovaSenha(t); setErro(""); }}
            />
          </View>

          <Text style={[s.label, { marginTop: 16 }]}>CONFIRMAR SENHA</Text>
          <View style={[s.inputRow, erro ? s.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
            <TextInput
              style={s.input}
              placeholder="Confirme a nova senha"
              placeholderTextColor="#3D3D5C"
              secureTextEntry
              value={confirmar}
              onChangeText={(t) => { setConfirmar(t); setErro(""); }}
            />
          </View>

          {erro ? <Text style={s.erro}>{erro}</Text> : null}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleRedefinir}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>SALVAR NOVA SENHA</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#09090F",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  scroll: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(123,97,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(123,97,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
  },
  sub: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#8888AA",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  label: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#8888AA",
    letterSpacing: 1.5,
    alignSelf: "flex-start",
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
    width: "100%",
  },
  inputError: { borderColor: "#EF4444" },
  input: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: "#FFFFFF",
    padding: 0,
  },
  erro: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#EF4444",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  btn: {
    backgroundColor: "#7B61FF",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
});
