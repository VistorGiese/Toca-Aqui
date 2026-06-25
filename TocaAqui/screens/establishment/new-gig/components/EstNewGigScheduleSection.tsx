import React from "react";
import { View } from "react-native";
import EstNewGigFormField from "./EstNewGigFormField";
import { styles } from "../styles";

interface Props {
  inicio: string;
  fim: string;
  onInicioChange: (value: string) => void;
  onFimChange: (value: string) => void;
  errors: { inicio?: string; fim?: string };
}

export default function EstNewGigScheduleSection({
  inicio,
  fim,
  onInicioChange,
  onFimChange,
  errors,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <EstNewGigFormField
          label="INÍCIO"
          placeholder="19:00"
          value={inicio}
          onChangeText={onInicioChange}
          keyboardType="number-pad"
          maxLength={5}
          error={errors.inicio}
        />
      </View>
      <View style={styles.flex}>
        <EstNewGigFormField
          label="FIM"
          placeholder="23:00"
          value={fim}
          onChangeText={onFimChange}
          keyboardType="number-pad"
          maxLength={5}
          error={errors.fim}
        />
      </View>
    </View>
  );
}
