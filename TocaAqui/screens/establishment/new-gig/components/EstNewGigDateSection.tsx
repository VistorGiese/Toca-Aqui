import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { DS } from "../constants";
import { isoToDisplay } from "../utils";
import { styles } from "../styles";

interface Props {
  dataISO: string;
  error?: string;
  onPress: () => void;
}

export default function EstNewGigDateSection({ dataISO, error, onPress }: Props) {
  return (
    <>
      <Text style={styles.fieldLabel}>DATA DO EVENTO</Text>
      <TouchableOpacity
        style={[styles.dateBtn, error ? styles.inputError : null]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <FontAwesome5 name="calendar-alt" size={15} color={DS.accent} />
        <Text style={[styles.dateBtnText, !dataISO && styles.dateBtnPlaceholder]}>
          {dataISO ? isoToDisplay(dataISO) : "Selecionar data"}
        </Text>
        <FontAwesome5 name="chevron-down" size={12} color={DS.textSecondary} />
      </TouchableOpacity>
      <FieldError message={error} />
    </>
  );
}
