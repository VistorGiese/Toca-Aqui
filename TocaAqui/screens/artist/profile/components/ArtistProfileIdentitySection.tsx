import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS } from "../constants";
import { ArtistProfileDisplayData } from "../types";
import { styles } from "../styles";

interface Props {
  display: Pick<
    ArtistProfileDisplayData,
    "nome" | "tipoLabel" | "localizacao" | "disponivel"
  >;
}

export default function ArtistProfileIdentitySection({ display }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{display.nome.toUpperCase()}</Text>
        <View style={[styles.dot, display.disponivel ? styles.dotGreen : styles.dotRed]} />
      </View>
      <Text style={styles.tipoLabel}>{display.tipoLabel}</Text>
      {display.localizacao ? (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={DS.textSecondary} />
          <Text style={styles.metaText}>{display.localizacao}</Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <Ionicons
          name={display.disponivel ? "checkmark-circle-outline" : "close-circle-outline"}
          size={13}
          color={display.disponivel ? DS.green : "#EF4444"}
        />
        <Text style={styles.metaText}>
          {display.disponivel ? "Disponível para shows" : "Indisponível no momento"}
        </Text>
      </View>
    </View>
  );
}
