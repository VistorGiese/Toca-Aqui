import { colors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

import Button from "../components/Allcomponents/Button";
import Fund from "../components/Allcomponents/Fund";
import Input from "../components/Allcomponents/Input";
import ToBack from "../components/Allcomponents/ToBack";
import {
  AccontFormContext,
  AccountProps,
} from "../contexts/AccountFromContexto";
import { RootStackParamList } from "../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width, height } = Dimensions.get("window");

export default function RegisterLocationName() {
  const navigation = useNavigation<NavigationProp>();
  const { accountFormData: formData, updateFormData } =
    useContext(AccontFormContext);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountProps>({
    defaultValues: {
      nome_estabelecimento: formData.nome_estabelecimento || "",
    },
    mode: "onTouched",
  });

  const [showFullText, setShowFullText] = useState(false);
  const handleToggleText = () => setShowFullText((prev) => !prev);

  function handleNext(data: AccountProps) {
    updateFormData({
      nome_estabelecimento: data.nome_estabelecimento,
      tipo_usuario: "establishment_owner",
    });
    console.log({ nome_estabelecimento: data.nome_estabelecimento });
    navigation.navigate("RegisterLocationAndress");
  }

  return (
    <View style={styles.container}>
      <Fund />
      <ToBack />
      <Image
        source={require("../assets/images/Register/CreateAccount.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Nome do Estabelecimento</Text>
      <Text style={styles.subtitle}>
        {showFullText
          ? "Insira o nome completo do seu estabelecimento, que será exibido para os usuários."
          : "Insira o nome completo do seu estabelecimento... "}
        <Text
          style={styles.saibaMais}
          onPress={handleToggleText}
          accessibilityRole="button"
        >
          {showFullText ? "Ver menos" : "Saiba mais"}
        </Text>
      </Text>

      <Controller
        control={control}
        name="nome_estabelecimento"
        rules={{
          required: "O nome do estabelecimento é obrigatório",
        }}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error },
        }) => (
          <Input
            inputRef={ref}
            label="Nome do Estabelecimento"
            iconName="store"
            placeholder="Ex: Bar do João"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={error?.message}
            returnKeyType="done"
            onSubmitEditing={handleSubmit(handleNext)}
          />
        )}
      />

      <Button style={styles.button} onPress={handleSubmit(handleNext)}>
        <Text style={styles.buttonText}>Continuar</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c0a37",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.6,
    height: height * 0.3,
    resizeMode: "contain",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
    textAlign: "left",
    marginBottom: 10,
    width: "95%",
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 25,
    textAlign: "left",
    width: "95%",
    fontFamily: "Montserrat-Regular",
  },
  saibaMais: {
    fontSize: 16,
    textDecorationLine: "underline",
    color: colors.green,
    fontFamily: "Montserrat-SemiBold",
  },
  button: {
    width: "95%",
    marginTop: 400,
    bottom: 50,
    height: 60,
  },
  buttonText: {
    color: colors.purpleDark,
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
  },
});