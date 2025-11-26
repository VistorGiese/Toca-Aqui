import { colors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

const formatCep = (value: string) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length > 5) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cleaned;
};

const formatState = (value: string) => {
  return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
};

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function RegisterLocationAndress() {
  const navigation = useNavigation<NavigationProp>();
  const { accountFormData: formData, updateFormData } =
    useContext(AccontFormContext);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountProps>({
    defaultValues: {
      rua: formData.rua || "",
      numero: formData.numero || "",
      bairro: formData.bairro || "",
      cidade: formData.cidade || "",
      estado: formData.estado || "",
      cep: formData.cep || "",
    },
    mode: "onTouched",
  });

  const numeroRef = useRef<TextInput>(null);
  const bairroRef = useRef<TextInput>(null);
  const cidadeRef = useRef<TextInput>(null);
  const estadoRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);

  function handleNext(data: AccountProps) {
    updateFormData(data);
    navigation.navigate("RegisterPassword");
  }

  return (
    <View style={styles.container}>
      <Fund />
      <ToBack />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Image
          style={styles.image}
          source={require("../assets/images/All/endereco.png")}
        />
        <Text style={styles.subtitle}>
          Forneça o endereço completo do estabelecimento. Esse campo é importante para que os clientes encontrem facilmente o seu local.
        </Text>

        <Controller
          control={control}
          name="rua"
          rules={{ required: "O nome da rua é obrigatório" }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={ref}
              label="Rua"
              iconName="road-variant"
              placeholder="Ex: Av. Paulista"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.rua?.message}
              returnKeyType="next"
              onSubmitEditing={() => numeroRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="numero"
          rules={{ required: "O número é obrigatório" }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={(e) => {
                ref(e);
                numeroRef.current = e;
              }}
              label="Número"
              iconName="numeric"
              placeholder="Ex: 123"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.numero?.message}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => bairroRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="bairro"
          rules={{ required: "O bairro é obrigatório" }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={(e) => {
                ref(e);
                bairroRef.current = e;
              }}
              label="Bairro"
              iconName="home-group"
              placeholder="Ex: Bela Vista"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.bairro?.message}
              returnKeyType="next"
              onSubmitEditing={() => cidadeRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="cidade"
          rules={{ required: "A cidade é obrigatória" }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={(e) => {
                ref(e);
                cidadeRef.current = e;
              }}
              label="Cidade"
              iconName="city-variant"
              placeholder="Ex: São Paulo"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.cidade?.message}
              returnKeyType="next"
              onSubmitEditing={() => estadoRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="estado"
          rules={{
            required: "O estado é obrigatório",
            validate: (value) =>
              !value ||
              brazilianStates.includes(value) ||
              "precisa ser digitado uma sigla de estado",
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={(e) => {
                ref(e);
                estadoRef.current = e;
              }}
              label="Estado"
              iconName="map-marker-radius"
              placeholder="Ex: SP"
              onBlur={onBlur}
              onChangeText={(text) => onChange(formatState(text))}
              value={value}
              error={errors.estado?.message}
              maxLength={2}
              returnKeyType="next"
              onSubmitEditing={() => cepRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="cep"
          rules={{
            required: "O CEP é obrigatório",
            pattern: {
              value: /^\d{5}-\d{3}$/,
              message: "CEP inválido (formato XXXXX-XXX)",
            },
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={(e) => {
                ref(e);
                cepRef.current = e;
              }}
              label="CEP"
              iconName="mailbox"
              placeholder="00000-000"
              onBlur={onBlur}
              onChangeText={(text) => onChange(formatCep(text))}
              value={value}
              error={errors.cep?.message}
              keyboardType="numeric"
              maxLength={9}
              returnKeyType="done"
              onSubmitEditing={handleSubmit(handleNext)}
            />
          )}
        />

        <Button style={styles.button} onPress={handleSubmit(handleNext)}>
          <Text style={styles.buttonText}>Continuar</Text>
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c0a37",
  },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  image: {
    width: width * 0.4,
    height: height * 0.2,
    resizeMode: "contain",
    marginTop: 80,
    marginLeft: -250,
    marginBottom: -50,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Regular",
    color: "#ccc",
    marginBottom: 25,
    textAlign: "center",
    width: "100%",
  },
  button: {
    width: "95%",
    marginTop: 60,
    height: 60,
  },
  buttonText: {
    color: colors.purpleDark,
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
  },
});