import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigate";
import api from "../http/api";

type RouteP = RouteProp<RootStackParamList, "VerifyEmail">;
type NavP = NativeStackNavigationProp<RootStackParamList>;

export default function VerifyEmail() {
  const navigation = useNavigation<NavP>();
  const route = useRoute<RouteP>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = route.params?.token;
    if (!token) {
      setStatus("error");
      setMessage("Token inválido.");
      return;
    }
    api
      .get(`/usuarios/verificar-email?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message ?? "Email verificado com sucesso!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.error ?? "Token inválido ou expirado.");
      });
  }, []);

  return (
    <View style={s.root}>
      {status === "loading" ? (
        <>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={s.text}>Verificando email...</Text>
        </>
      ) : (
        <>
          <Ionicons
            name={
              status === "success"
                ? "checkmark-circle-outline"
                : "close-circle-outline"
            }
            size={72}
            color={status === "success" ? "#A78BFA" : "#EF4444"}
          />
          <Text style={s.title}>
            {status === "success" ? "Email verificado!" : "Falha na verificação"}
          </Text>
          <Text style={s.text}>{message}</Text>
          <TouchableOpacity
            style={s.btn}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>IR PARA O LOGIN</Text>
          </TouchableOpacity>
        </>
      )}
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
    gap: 20,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
  },
  text: {
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: "#8888AA",
    textAlign: "center",
    lineHeight: 22,
  },
  btn: {
    backgroundColor: "#7B61FF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  btnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
});
