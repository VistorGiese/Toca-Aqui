import { colors } from "@/utils/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
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
import { cadastrarEstabelecimentoCompleto } from "../http/RegisterService";
import { RootStackParamList } from "../navigation/Navigate";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const formatTime = (value: string) => {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length > 2) {
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
  }
  return cleaned;
};

export default function AdditionalInformation() {
  const navigation = useNavigation<NavigationProp>();
  const { accountFormData, updateFormData } = useContext(AccontFormContext);
  const [showFullText, setShowFullText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountProps>({
    defaultValues: {
      generos_musicais: accountFormData.generos_musicais || "",
      horario_funcionamento_inicio:
        accountFormData.horario_funcionamento_inicio || "",
      horario_funcionamento_fim: accountFormData.horario_funcionamento_fim || "",
    },
    mode: "onTouched",
  });

  const startTimeRef = useRef<TextInput>(null);
  const endTimeRef = useRef<TextInput>(null);
  const handleToggleText = () => setShowFullText((prev) => !prev);

  const handleFinalSubmit = async (data: AccountProps) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    updateFormData(data);

    const finalData = { ...accountFormData, ...data };

    try {
      await cadastrarEstabelecimentoCompleto({
        ...finalData,
        horario_funcionamento_inicio: `${finalData.horario_funcionamento_inicio}:00`,
        horario_funcionamento_fim: `${finalData.horario_funcionamento_fim}:00`,
      });

      Alert.alert("Sucesso!", "Sua conta foi criada com sucesso.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Não foi possível criar sua conta. Verifique os dados.";
      setSubmissionError(errorMessage);

      Alert.alert(
        "Erro no Cadastro",
        `${errorMessage} Você será redirecionado para corrigir suas informações.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("RegisterLocationName"),
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Fund />
      <ToBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>QUASE LA...</Text>
        <Text style={styles.subtitle}>
          {showFullText
            ? "Defina as preferências do seu estabelecimento. Essas informações ajudam as bandas a entender melhor o seu estilo e personalizar a apresentação de acordo com o que você e seus clientes preferem."
            : "Defina as preferências do seu estabelecimento... "}
          <Text
            style={styles.saibaMais}
            onPress={handleToggleText}
            accessibilityRole="button"
          >
            {showFullText ? " Ver menos" : " Saiba mais"}
          </Text>
        </Text>

        <Controller
          control={control}
          name="generos_musicais"
          rules={{ required: "Pelo menos um gênero musical é obrigatório" }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              containerStyle={{ width: "100%" }}
              inputRef={ref}
              label="Gêneros Musicais"
              iconName="music-note"
              placeholder="Ex: Rock, Sertanejo, MPB"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.generos_musicais?.message}
              returnKeyType="next"
              onSubmitEditing={() => startTimeRef.current?.focus()}
            />
          )}
        />

        <View style={styles.timeInputsContainer}>
          <View style={styles.timeInputWrapper}>
            <Controller
              control={control}
              name="horario_funcionamento_inicio"
              rules={{
                required: "O horário de início é obrigatório",
                pattern: {
                  value: /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/,
                  message: "Formato inválido (HH:MM)",
                },
              }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  containerStyle={{ width: "100%" }}
                  inputRef={(e) => {
                    ref(e);
                    startTimeRef.current = e;
                  }}
                  label="Início do Atendimento"
                  iconName="clock-start"
                  placeholder="Ex: 18:00"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(formatTime(text))}
                  value={value}
                  error={errors.horario_funcionamento_inicio?.message}
                  keyboardType="numeric"
                  maxLength={5}
                  returnKeyType="next"
                  onSubmitEditing={() => endTimeRef.current?.focus()}
                />
              )}
            />
          </View>
          <View style={styles.timeInputWrapper}>
            <Controller
              control={control}
              name="horario_funcionamento_fim"
              rules={{
                required: "O horário de término é obrigatório",
                pattern: {
                  value: /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/,
                  message: "Formato inválido (HH:MM)",
                },
              }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  containerStyle={{ width: "100%" }}
                  inputRef={(e) => {
                    ref(e);
                    endTimeRef.current = e;
                  }}
                  label="Fim do Atendimento"
                  iconName="clock-end"
                  placeholder="Ex: 23:00"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(formatTime(text))}
                  value={value}
                  error={errors.horario_funcionamento_fim?.message}
                  keyboardType="numeric"
                  maxLength={5}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(handleFinalSubmit)}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      {submissionError && (
        <Text style={styles.submissionErrorText}>{submissionError}</Text>
      )}

      <Button
        style={{
          ...styles.button,
          ...(!!submissionError && styles.buttonError),
        }}
        onPress={handleSubmit(handleFinalSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.purpleDark} />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
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
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 35,
    fontFamily: "AkiraExpanded-Superbold",
    color: "#fff",
    marginBottom: 60,
    marginTop: -250,
    textAlign: "left",
    alignSelf: "flex-start",
    width: "100%",
  },
  subtitle: {
    fontSize: 18,
    color: "#ccc",
    marginBottom: 45,
    textAlign: "left",
    width: "100%",
    fontFamily: "Montserrat-Regular",
  },
  saibaMais: {
    fontSize: 16,
    textDecorationLine: "underline",
    color: "#5000c9ff",
  },
  timeInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  timeInputWrapper: {
    width: "48%",
  },
  button: {
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 150,
    alignSelf: "center",
  },
  buttonError: {
    borderColor: "#e53e3e",
    borderWidth: 2,
  },
  buttonText: {
    color: colors.purpleDark,
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
  },
  submissionErrorText: {
    color: "#e53e3e",
    textAlign: "center",
    fontSize: 16,
    position: "absolute",
    bottom: 110,
    width: "100%",
    alignSelf: "center",
    fontFamily: "Montserrat-Regular",
  },
});