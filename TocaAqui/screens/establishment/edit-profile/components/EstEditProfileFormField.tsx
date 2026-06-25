import React from "react";
import { Text, TextInput, TextInputProps } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { styles } from "../styles";

type LabelVariant = "section" | "field";

interface Props extends TextInputProps {
  label: string;
  labelVariant?: LabelVariant;
  error?: string;
}

export default function EstEditProfileFormField({
  label,
  labelVariant = "section",
  error,
  style,
  ...inputProps
}: Props) {
  const labelStyle = labelVariant === "field" ? styles.fieldLabel : styles.label;

  return (
    <>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#555577"
        {...inputProps}
      />
      <FieldError message={error} />
    </>
  );
}
