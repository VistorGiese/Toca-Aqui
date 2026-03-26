import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigate";
import { colors } from "@/utils/colors";
import Fund from "../components/Allcomponents/Fund";
import ToBack from "../components/Allcomponents/ToBack";

const { width, height } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RoleSelection() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Fund />
      <ToBack />

      <View style={styles.content}>
        <Text style={styles.title}>COMO DESEJA{"\n"}SE CADASTRAR?</Text>
        <Text style={styles.subtitle}>
          Escolha o tipo de conta que melhor representa você
        </Text>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("RegisterLocationName")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome5 name="store" size={28} color={colors.purple} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Sou Estabelecimento</Text>
            <Text style={styles.cardDescription}>
              Bares, restaurantes, casas de show e eventos que buscam artistas
            </Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("OnboardingArtistProfile")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome5 name="guitar" size={28} color={colors.purple} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Sou Artista</Text>
            <Text style={styles.cardDescription}>
              Músicos, bandas e artistas que buscam oportunidades para tocar
            </Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c0a37",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 2,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "AkiraExpanded-Superbold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(139,92,246,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginBottom: 4,
  },
  cardDescription: {
    color: "#aaa",
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    lineHeight: 18,
  },
});
