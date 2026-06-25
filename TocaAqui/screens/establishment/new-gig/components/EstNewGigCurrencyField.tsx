import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { DS, ZERO_CURRENCY_DISPLAY } from "../constants";
import { styles } from "../styles";

interface Props extends Omit<TextInputProps, "value" | "onChangeText"> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlurNormalize?: () => void;
  error?: string;
  hint?: string;
}

export default function EstNewGigCurrencyField({
  label,
  value,
  onChangeText,
  onBlurNormalize,
  error,
  hint,
  ...inputProps
}: Props) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.currencyRow, error ? styles.currencyRowError : null]}>
        <Text style={styles.currencyPrefix}>R$</Text>
        <TextInput
          style={styles.currencyInput}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlurNormalize}
          placeholder={ZERO_CURRENCY_DISPLAY}
          placeholderTextColor={DS.border}
          keyboardType="number-pad"
          {...inputProps}
        />
      </View>
      <FieldError message={error} />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </>
  );
}
