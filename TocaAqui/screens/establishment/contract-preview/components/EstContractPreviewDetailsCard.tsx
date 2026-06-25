import React from "react";
import { Text, View } from "react-native";
import { ContractPreviewData } from "../types";
import { getContractedName } from "../utils";
import { styles } from "../styles";

interface Props {
  artistName: string;
  preview: ContractPreviewData;
}

export default function EstContractPreviewDetailsCard({ artistName, preview }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>CONTRATANTE</Text>
      <Text style={styles.value}>{preview.nomeContratante}</Text>

      <Text style={styles.label}>CONTRATADO</Text>
      <Text style={styles.value}>{getContractedName(artistName, preview)}</Text>

      <View style={styles.divider} />

      <Text style={styles.label}>CACHÊ</Text>
      <Text style={[styles.value, styles.valueHighlight]}>R$ {preview.cacheTotal}</Text>

      <Text style={styles.label}>DATA DO SHOW</Text>
      <Text style={styles.value}>{preview.dataEvento}</Text>

      <Text style={styles.label}>HORÁRIO</Text>
      <Text style={styles.value}>
        {preview.horarioInicio} — {preview.horarioFim}
      </Text>

      <Text style={styles.label}>LOCAL</Text>
      <Text style={styles.valueSm}>{preview.localEvento}</Text>
    </View>
  );
}
