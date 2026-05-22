import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";
import { ESTABLISHMENT_TYPES } from "../constants";
import { EstablishmentTipo } from "../context/types";

interface Props {
  value: EstablishmentTipo | "";
  onChange: (tipo: EstablishmentTipo) => void;
}

export default function EstTypeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {ESTABLISHMENT_TYPES.map((t) => {
        const active = value === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            style={[styles.chip, active && styles.chipOn]}
            onPress={() => onChange(t.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, active && styles.chipTextOn]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
  },
  chipOn: {
    borderColor: colors.purpleLight,
    backgroundColor: colors.accentSoftBg,
  },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextOn: {
    color: colors.purpleLight,
  },
});
