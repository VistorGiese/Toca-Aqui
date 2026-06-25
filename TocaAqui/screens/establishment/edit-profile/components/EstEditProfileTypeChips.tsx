import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { EST_EDIT_PROFILE_TIPOS } from "../constants";
import { styles } from "../styles";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function EstEditProfileTypeChips({ value, onChange, error }: Props) {
  return (
    <>
      <Text style={styles.label}>TIPO DE ESTABELECIMENTO</Text>
      <View style={[styles.chipRow, error ? styles.chipRowError : null]}>
        {EST_EDIT_PROFILE_TIPOS.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.chip, value === t.value && styles.chipActive]}
            onPress={() => onChange(t.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, value === t.value && styles.chipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FieldError message={error} />
    </>
  );
}
