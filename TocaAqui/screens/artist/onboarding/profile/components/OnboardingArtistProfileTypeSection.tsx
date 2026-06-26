import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { TIPOS_ATUACAO } from "../constants";
import { styles } from "../styles";
import { TipoAtuacao } from "../types";

interface Props {
  selected: TipoAtuacao | null;
  error?: string;
  onSelect: (tipo: TipoAtuacao) => void;
}

export default function OnboardingArtistProfileTypeSection({ selected, error, onSelect }: Props) {
  return (
    <>
      <Text style={styles.sectionLabel}>TIPO DE ATUAÇÃO</Text>
      <View style={[styles.pillRow, error ? styles.pillRowError : null]}>
        {TIPOS_ATUACAO.map((tipo) => {
          const active = selected === tipo;
          return (
            <TouchableOpacity
              key={tipo}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => onSelect(tipo)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{tipo}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FieldError message={error} />
    </>
  );
}
