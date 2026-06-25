import React from "react";
import { Text, TextInput, TextInputProps } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export default function EstNewGigFormField({
  label,
  error,
  hint,
  style,
  ...inputProps
}: Props) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={DS.border}
        {...inputProps}
      />
      <FieldError message={error} />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </>
  );
}
