import React from "react";
import { Image, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { styles } from "../styles";

type LabelVariant = "section" | "field";

interface Props extends TextInputProps {
  label: string;
  labelVariant?: LabelVariant;
  error?: string;
}

export default function OnboardingArtistProfileFormField({
  label,
  labelVariant = "section",
  error,
  style,
  ...inputProps
}: Props) {
  const labelStyle = labelVariant === "field" ? styles.fieldLabel : styles.sectionLabel;

  return (
    <>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={DS.textDis}
        {...inputProps}
      />
      <FieldError message={error} />
    </>
  );
}
