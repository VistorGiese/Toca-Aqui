import { colors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
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
import { cadastrarUsuarioSimples } from "../http/RegisterService";
import { RootStackParamList } from "../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const formatPhone = (value: string) => {
  if (!value) return "";
  const cleanedValue = value.replace(/\D/g, '');
  if (cleanedValue.length <= 2) return `(${cleanedValue}`;
  if (cleanedValue.length <= 7) return `(${cleanedValue.substring(0, 2)}) ${cleanedValue.substring(2, 7)}`;
  return `(${cleanedValue.substring(0, 2)}) ${cleanedValue.substring(2, 7)}-${cleanedValue.substring(7, 11)}`;
};

export default function InformationPersonResponsible() {
  const navigation = useNavigation<NavigationProp>();
  const { accountFormData: formData, updateFormData } =
    useContext(AccontFormContext);
  const [showFullText, setShowFullText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userType = formData.tipo_usuario || "establishment_owner";
  const isEstablishment = userType === "establishment_owner";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountProps>({
    defaultValues: {
      nome_dono: formData.nome_dono || "",
      email_responsavel: formData.email_responsavel || "",
      celular_responsavel: formData.celular_responsavel || "",
    },
    mode: 'onTouched',
  });

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const handleToggleText = () => setShowFullText((prev) => !prev);

  async function handleNext(data: AccountProps) {
    const maskedPhone = data.celular_responsavel;
    const cleanedPhone = maskedPhone ? maskedPhone.replace(/\D/g, '') : "";
    const dataToSave = { ...data, celular_responsavel: cleanedPhone };
    updateFormData(dataToSave);

    if (isEstablishment) {
      navigation.navigate("AdditionalInformation");
      return;
    }

    try {
      setIsSubmitting(true);
      await cadastrarUsuarioSimples({
        ...formData,
        ...dataToSave,
      });

      Alert.alert("Sucesso!", "Cadastro realizado com sucesso!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Nao foi possivel finalizar o cadastro.";
      Alert.alert("Erro no cadastro", String(msg));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Fund />
      <ToBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          style={styles.image}
          source={require('../assets/images/All/infoPersol.png')}
        />


        <Text style={styles.subtitle}>
          {showFullText
            ? isEstablishment
              ? "Preencha as informacoes do proprietario do estabelecimento para facilitar o contato das bandas."
              : "Preencha seus dados de contato para concluir o cadastro da conta."
            : isEstablishment
              ? "Preencha as informacoes do proprietario... "
              : "Preencha seus dados para concluir... "}
          <Text style={styles.saibaMais} onPress={handleToggleText}>
            {showFullText ? " Ver menos" : " Saiba mais"}
          </Text>
        </Text>

        <Controller
          control={control}
          name="nome_dono"
          rules={{ required: "O nome do responsável é obrigatório" }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={ref}
              label={isEstablishment ? "Nome do responsavel" : "Seu nome"}
              iconName="account"
              placeholder="Nome completo"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.nome_dono?.message}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="email_responsavel"
          rules={{
            required: "O e-mail é obrigatório",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "E-mail inválido",
            },
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={(e) => {
                ref(e);
                emailRef.current = e;
              }}
              label={isEstablishment ? "E-mail do responsavel" : "Seu e-mail"}
              iconName="email"
              placeholder="contato@email.com"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email_responsavel?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="celular_responsavel"
          rules={{
            required: isEstablishment ? "O telefone e obrigatorio" : false,
            validate: value =>
              !value ||
              value.replace(/\D/g, "").length === 11 ||
              "Telefone invalido (11 digitos)",
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputRef={(e) => {
                ref(e);
                phoneRef.current = e;
              }}
              label={isEstablishment ? "Telefone do responsavel" : "Telefone (opcional)"}
              iconName="phone"
              placeholder="(XX) XXXXX-XXXX"
              onBlur={onBlur}
              onChangeText={(text) => onChange(formatPhone(text))}
              value={value}
              error={errors.celular_responsavel?.message}
              keyboardType="phone-pad"
              maxLength={15}
              returnKeyType="done"
              onSubmitEditing={handleSubmit(handleNext)}
            />
          )}
        />
      </ScrollView>

      <Button style={styles.button} onPress={handleSubmit(handleNext)}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.purpleDark} />
        ) : (
          <Text style={styles.buttonText}>
            {isEstablishment ? "Continuar" : "Finalizar cadastro"}
          </Text>
        )}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c0a37",
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  image: {
    width: '50%',
    height: 200,
    resizeMode: 'contain',
    marginTop: -300,
    marginLeft: -200,
  },
  subtitle: {
    fontSize: 18,
    color: "#ccc",
    marginBottom: 25,
    marginLeft: 25,
    textAlign: "left",
    width: "100%",
    fontFamily: 'Montserrat-Regular'
  },
  saibaMais: {
    fontSize: 16,
    textDecorationLine: "underline",
    color: "#5000c9ff",
  },
  button: {
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: 'center',
    position: "absolute",
    marginTop: 1000,
  },
  buttonText: {
    color: colors.purpleDark,
    fontSize: 22,
    fontWeight: "bold",
  },
});
