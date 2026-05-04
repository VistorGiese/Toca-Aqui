import { colors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Fund from "../components/Allcomponents/Fund";
import ToBack from "../components/Allcomponents/ToBack";
import { AccontFormContext, AccountProps } from "../contexts/AccountFromContexto";
import { RootStackParamList } from "../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type UserRole = NonNullable<AccountProps["tipo_usuario"]>;

type UserTypeOption = {
  label: string;
  description: string;
  value: UserRole;
};

const userTypeOptions: UserTypeOption[] = [
  {
    label: "Estabelecimento",
    description: "Crie eventos e receba candidaturas de bandas.",
    value: "establishment_owner",
  },
  {
    label: "Artista",
    description: "Gerencie bandas e se candidate para eventos.",
    value: "artist",
  },
  {
    label: "Usuario comum",
    description: "Acesse o app para buscar e favoritar conteudo.",
    value: "common_user",
  },
];

export default function RegisterUserType() {
  const navigation = useNavigation<NavigationProp>();
  const { resetFormData, updateFormData } = useContext(AccontFormContext);

  const handleSelectUserType = (userType: UserRole) => {
    resetFormData();
    updateFormData({ tipo_usuario: userType });

    if (userType === "establishment_owner") {
      navigation.navigate("RegisterLocationName");
      return;
    }

    navigation.navigate("RegisterPassword");
  };

  return (
    <View style={styles.container}>
      <Fund />
      <ToBack />

      <View style={styles.content}>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Escolha como deseja usar o Toca Aqui</Text>

        <View style={styles.optionsContainer}>
          {userTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.optionButton}
              onPress={() => handleSelectUserType(option.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionTitle}>{option.label}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c0a37",
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 34,
    fontFamily: "Montserrat-Bold",
    marginBottom: 12,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 18,
    fontFamily: "Montserrat-Regular",
    marginBottom: 28,
  },
  optionsContainer: {
    gap: 14,
  },
  optionButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#5b4f72",
    backgroundColor: "#2a1546",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  optionTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    marginBottom: 6,
  },
  optionDescription: {
    color: "#d5cfde",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    lineHeight: 20,
  },
});
