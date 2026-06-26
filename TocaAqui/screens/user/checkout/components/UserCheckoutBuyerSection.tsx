import React from "react";
import { Text, TextInput, View } from "react-native";
import { Controller, RegisterOptions } from "react-hook-form";
import FieldError from "@/components/ui/FieldError";
import { sanitizeCpf } from "@/utils/documentValidation";
import { formatCpf, formatPhone } from "@/utils/inputMasks";
import { CheckoutControl, CheckoutFormData } from "../types";
import { styles } from "../styles";

interface Props {
  control: CheckoutControl;
  nomeRules: RegisterOptions<CheckoutFormData, "nome">;
  cpfRules: RegisterOptions<CheckoutFormData, "cpf">;
  telefoneRules: RegisterOptions<CheckoutFormData, "telefone">;
}

export default function UserCheckoutBuyerSection({
  control,
  nomeRules,
  cpfRules,
  telefoneRules,
}: Props) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Dados do Comprador</Text>

      <Controller
        control={control}
        name="nome"
        rules={nomeRules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>NOME COMPLETO</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Seu nome completo"
              placeholderTextColor="#555577"
              value={value}
              onChangeText={onChange}
            />
            <FieldError message={error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="cpf"
        rules={cpfRules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>CPF</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="000.000.000-00"
              placeholderTextColor="#555577"
              value={value}
              onChangeText={(text) => onChange(formatCpf(sanitizeCpf(text)))}
              keyboardType="numeric"
            />
            <FieldError message={error?.message} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="telefone"
        rules={telefoneRules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>TELEFONE</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#555577"
              value={value}
              onChangeText={(text) => onChange(formatPhone(text))}
              keyboardType="phone-pad"
            />
            <FieldError message={error?.message} />
          </View>
        )}
      />
    </View>
  );
}
